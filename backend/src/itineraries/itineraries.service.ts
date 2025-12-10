import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityRepository, Transactional } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Itinerary } from '../entities/itinerary.entity';
import {
  CreateItineraryDto,
  ItineraryTravelInfoDto,
  ExistingItinerariesDto,
  QuickViewItinerariesDto,
  ExistingItineraryDto,
  QuickViewItineraryDto,
} from '@go-train-group-pass/shared';
import { ItineraryStatus } from '../entities/itineraryStatusEnum';
import { TripBookingService } from '../trip-booking/trip-booking.service';
import { UsersService } from '../users/users.service';
import { ItineraryCreationResponseDto } from '@go-train-group-pass/shared';
import { TravelGroup, Trip, TripBooking } from 'src/entities';
import { AggregatedItinerary } from 'src/entities';
import { type TravelGroupMemberDto } from '@go-train-group-pass/shared';
import { TripBookingStatus } from 'src/entities/tripBookingEnum';

@Injectable()
export class ItinerariesService {
  constructor(
    @InjectRepository(Itinerary)
    private readonly itineraryRepo: EntityRepository<Itinerary>,
    @InjectRepository(TravelGroup)
    private readonly travelGroupRepo: EntityRepository<TravelGroup>,
    @InjectRepository(AggregatedItinerary)
    private readonly aggregatedItineraryRepo: EntityRepository<AggregatedItinerary>,
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    private readonly userService: UsersService,
    private readonly tripBookingService: TripBookingService,
  ) { }

  @Transactional()
  async create(
    userId: string,
    createItineraryDto: CreateItineraryDto,
  ): Promise<ItineraryCreationResponseDto> {
    const user = await this.userService.findById(userId);
    const tripBookings = await Promise.all(
      createItineraryDto.segments.map(async (segment, index) => {
        return await this.tripBookingService.findOrCreate(
          userId,
          segment.gtfsTripId,
          segment.originStopTimeId,
          segment.destStopTimeId,
          index + 1, // sequence starts from 1
        );
      }),
    );

    const existingItinerary = await this.itineraryRepo.findOne({
      user,
      tripBookings,
    });

    if (existingItinerary) {
      return {
        id: existingItinerary.id,
        trips: tripBookings.map((tripBooking) =>
          this.tripBookingService.getTripDetails(tripBooking),
        ),
        stewarding: existingItinerary.wantsToSteward,
      };
    }

    const itinerary = this.itineraryRepo.create({
      user,
      tripBookings,
      wantsToSteward: createItineraryDto.wantsToSteward,
      status: ItineraryStatus.DRAFT,
      tripHash: undefined,
    });

    // With @Transactional, explicit persist here will be flushed automatically at the end of the method
    // But we usually need to persist it. flush is handled by the transaction commit.
    // However, for the id to be generated if it's database-generated (SERIAL), we might need flush if we return it.
    // But usually MikroORM flushes before commit.
    this.itineraryRepo.getEntityManager().persist(itinerary);

    return {
      id: itinerary.id,
      trips: tripBookings.map((tripBooking) =>
        this.tripBookingService.getTripDetails(tripBooking),
      ),
      stewarding: itinerary.wantsToSteward,
    };
  }

  // assuming that if a user is a steward of one trip they are a steward of all trips because of round trip demo use case
  async getItineraryInfo(
    userId: string,
    id: string,
  ): Promise<ItineraryTravelInfoDto> {
    const itinerary = await this.itineraryRepo.findOneOrFail(
      {
        id,
        user: { id: userId },
      },
      { populate: ['tripBookings', 'tripBookings.trip'] },
    );
    const tripBookings = itinerary.tripBookings.getItems();
    const tripIds = tripBookings.map((tripBooking) => tripBooking.trip.id);
    const itineraryTravelInfo: ItineraryTravelInfoDto = {
      tripDetails: tripBookings.map((booking) => {
        return {
          ...this.tripBookingService.getTripDetails(booking),
          bookingId: booking.id,
          isCheckedIn: booking.status == TripBookingStatus.CHECKED_IN,
        }
      }

      ),
      groupsFormed: false,
    };
    const travelGroup = await this.travelGroupRepo.findOne(
      {
        trip: { id: { $in: tripIds } },
      },
      { populate: ['tripBookings.user', 'steward'] },
    );

    if (!travelGroup) {
      return itineraryTravelInfo;
    }

    itineraryTravelInfo.steward = {
      name: travelGroup.steward.name,
      email: travelGroup.steward.email,
      phoneNumber: travelGroup.steward.phoneNumber,
    };
    itineraryTravelInfo.groupsFormed = true;

    if (travelGroup.steward.id === userId) {
      itineraryTravelInfo.members = travelGroup.members().map((user) => ({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      }));
    }
    return { ...itineraryTravelInfo, groupsFormed: true };
  }
  // demo only
  async getExistingItineraries(): Promise<ExistingItinerariesDto> {
    const aggregatedItineraries = await this.aggregatedItineraryRepo.findAll();
    return aggregatedItineraries.map((aggregatedItinerary) => ({
      tripSequence: aggregatedItinerary.tripSequence,
      userCount: aggregatedItinerary.userCount,
      tripDetails: aggregatedItinerary.tripDetails,
    }));
  }

  async getQuickViewItineraries(
    userId?: string,
  ): Promise<QuickViewItinerariesDto> {
    const aggregatedItineraries = await this.aggregatedItineraryRepo.findAll();

    if (aggregatedItineraries.length === 0) {
      return {
        joinedItineraries: [],
        itinerariesToJoin: [],
      };
    }

    if (!userId) {
      return {
        joinedItineraries: [],
        itinerariesToJoin: aggregatedItineraries.map((aggregatedItinerary) => ({
          userCount: aggregatedItinerary.userCount,
          tripDetails: aggregatedItinerary.tripDetails,
          tripSequence: aggregatedItinerary.tripSequence,
        })),
      };
    }

    const aggregatedTripHashes = aggregatedItineraries.map(
      (aggregatedItinerary) => aggregatedItinerary.id,
    );

    const userItineraries = await this.itineraryRepo.find({
      user: { id: userId },
      tripHash: { $in: aggregatedTripHashes },
    });
    const joinedTripHashes = new Set(
      userItineraries.map((itinerary) => itinerary.tripHash).filter(Boolean),
    );

    const allTripIds = aggregatedItineraries.flatMap((aggregatedItinerary) =>
      aggregatedItinerary.tripDetails.map((tripDetail) => tripDetail.tripId),
    );

    const travelGroups = await this.travelGroupRepo.find(
      { trip: { id: { $in: allTripIds } } },
      { populate: ['tripBookings.user', 'steward', 'trip'] },
    );

    const travelGroupsByTripId = new Map<string, TravelGroup[]>();
    for (const group of travelGroups) {
      const groupsForTrip = travelGroupsByTripId.get(group.trip.id) || [];
      groupsForTrip.push(group);
      travelGroupsByTripId.set(group.trip.id, groupsForTrip);
    }
    const userQuickViewItineraries: QuickViewItineraryDto[] = [];
    const otherItineraries: ExistingItineraryDto[] = [];
    for (const aggregatedItinerary of aggregatedItineraries) {
      const userJoined = joinedTripHashes.has(aggregatedItinerary.id);
      if (userJoined) {
        const tripIds = aggregatedItinerary.tripDetails.map(
          (tripDetail) => tripDetail.tripId,
        );
        const groupsForItinerary = tripIds.flatMap(
          (tripId) => travelGroupsByTripId.get(tripId) || [],
        );

        const stewardGroups = groupsForItinerary.filter(
          (group) => group.steward?.id === userId,
        );

        const groupMembersMap = new Map<string, TravelGroupMemberDto>();

        stewardGroups.forEach((group) => {
          group.members().forEach((member) => {
            if (!groupMembersMap.has(member.id)) {
              groupMembersMap.set(member.id, {
                name: member.name,
                email: member.email,
                phoneNumber: member.phoneNumber,
              });
            }
          });
        });
        // definitely a better way to do this
        const itineraryId = userItineraries.find(
          (itinerary) => itinerary.tripHash === aggregatedItinerary.id,
        )?.id;
        if (!itineraryId) {
          // this should be impossible
          throw new Error('Could not find itinerary id');
        }
        userQuickViewItineraries.push({
          // this should be renamed later to aggregatedItineraryId
          id: aggregatedItinerary.id,
          itineraryId: itineraryId,
          userCount: aggregatedItinerary.userCount,
          groupMembers: Array.from(groupMembersMap.values()),
          joined: joinedTripHashes.has(aggregatedItinerary.id),
          groupFormed: groupsForItinerary.length > 0,
          tripDetails: aggregatedItinerary.tripDetails,
        });
      } else {
        otherItineraries.push({
          userCount: aggregatedItinerary.userCount,
          tripDetails: aggregatedItinerary.tripDetails,
          tripSequence: aggregatedItinerary.tripSequence,
        });
      }
    }

    return {
      joinedItineraries: userQuickViewItineraries,
      itinerariesToJoin: otherItineraries,
    };
  }
  @Transactional()
  async createItineraryWithExistingTripSequence(
    userId: string,
    tripSequence: string,
    wantsToSteward: boolean,
  ): Promise<ItineraryCreationResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const tripIds = tripSequence.split(',');
    const tripIdSequenceMap = tripIds.reduce(
      (acc, tripId, index) => {
        acc[tripId] = index;
        return acc;
      },
      {} as Record<string, number>,
    );
    const trips = await this.tripRepository.find(
      {
        id: { $in: tripIds },
      },
      { populate: ['gtfsTrip', 'originStopTime', 'destinationStopTime'] },
    );
    if (trips.length !== tripIds.length) {
      throw new BadRequestException('Trip sequence not found');
    }
    const tripBookings: TripBooking[] = [];
    for (const trip of trips) {
      if (!trip || !trip.originStopTime.id || !trip.destinationStopTime.id) {
        // should never happen
        throw new Error('Error loading trip');
      }
      const tripBooking = await this.tripBookingService.findOrCreate(
        userId,
        trip.gtfsTrip.id,
        trip.originStopTime.id,
        trip.destinationStopTime.id,
        tripIdSequenceMap[trip.id],
      );
      tripBookings.push(tripBooking);
    }
    const itinerary = this.itineraryRepo.create({
      user,
      tripBookings: tripBookings,
      status: ItineraryStatus.DRAFT,
      wantsToSteward,
    });
    return {
      id: itinerary.id,
      trips: tripBookings.map((tripBooking) =>
        this.tripBookingService.getTripDetails(tripBooking),
      ),
      stewarding: itinerary.wantsToSteward,
    };
  }
}

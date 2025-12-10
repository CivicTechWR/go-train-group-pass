import { Injectable } from '@nestjs/common';
import { EntityRepository, Transactional } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Itinerary } from '../entities/itinerary.entity';
import {
  CreateItineraryDto,
  ItineraryTravelInfoDto,
  ExistingItinerariesDto,
} from '@go-train-group-pass/shared';
import { ItineraryStatus } from '../entities/itineraryStatusEnum';
import { TripBookingService } from '../trip-booking/trip-booking.service';
import { UsersService } from '../users/users.service';
import { ItineraryCreationResponseDto } from '@go-train-group-pass/shared';
import { TravelGroup } from 'src/entities';
import { AggregatedItinerary } from 'src/entities';

@Injectable()
export class ItinerariesService {
  constructor(
    @InjectRepository(Itinerary)
    private readonly itineraryRepo: EntityRepository<Itinerary>,
    @InjectRepository(TravelGroup)
    private readonly travelGroupRepo: EntityRepository<TravelGroup>,
    @InjectRepository(AggregatedItinerary)
    private readonly aggregatedItineraryRepo: EntityRepository<AggregatedItinerary>,
    private readonly userService: UsersService,
    private readonly tripBookingService: TripBookingService,
  ) {}

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
      tripDetails: tripBookings.map((booking) =>
        this.tripBookingService.getTripDetails(booking),
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
      itineraryTravelInfo.members = travelGroup.members.map((user) => ({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      }));
    }

    return itineraryTravelInfo;
  }
  // demo only
  async getExistingItineraries(): Promise<ExistingItinerariesDto> {
    const aggregatedItineraries = await this.aggregatedItineraryRepo.findAll();
    return aggregatedItineraries.map((aggregatedItinerary) => ({
      userCount: aggregatedItinerary.userCount,
      tripDetails: aggregatedItinerary.tripDetails,
    }));
  }
}

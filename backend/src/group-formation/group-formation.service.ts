import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip, TripBooking, TravelGroup, User, Itinerary } from '../entities';
import { TripBookingStatus } from '../entities/tripBookingEnum';
import { TravelGroupStatus } from '../entities/travelGroupEnum';
import { GroupFormationResultDto } from '@go-train-group-pass/shared';

export enum GroupFormationResultFailureReason {
  NOT_ENOUGH_BOOKINGS = 'not_enough_bookings',
  NO_STEWARD_CANDIDATE = 'no_steward_candidates',
  INSUFFICIENT_STEWARDS = 'insufficient_stewards',
}
/**
 * Result of group formation for a single trip
 */
export interface GroupFormationResult {
  groupsFormed: number;
  usersGrouped: number;
  usersNotGrouped: number;
  stewardsNeeded: number;
  failureReason?: GroupFormationResultFailureReason;
}

// Constants
const MIN_GROUP_SIZE = 2;
const MAX_GROUP_SIZE = 5;

/**
 * Service for forming travel groups from checked-in users.
 *
 * Simplified for MVP - focuses on core grouping logic without
 * distributed locking or complex scheduling.
 */
@Injectable()
export class GroupFormationService {
  private readonly logger = new Logger(GroupFormationService.name);

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(TripBooking)
    private readonly tripBookingRepository: EntityRepository<TripBooking>,
    @InjectRepository(TravelGroup)
    private readonly travelGroupRepository: EntityRepository<TravelGroup>,
    @InjectRepository(Itinerary)
    private readonly itineraryRepository: EntityRepository<Itinerary>,
  ) {}

  /**
   * Form groups for a specific itinerary's upcoming trips.
   * Called when it's time to lock in groups (e.g., 15 mins before departure).
   *
   * IMPORTANT: Creates the SAME group assignments across ALL trips in the itinerary.
   * Users with matching itineraries should travel together on every leg of their journey.
   */
  async formGroupsForItinerary(
    itineraryId: string,
  ): Promise<GroupFormationResultDto> {
    this.logger.log(`Forming groups for itinerary ${itineraryId}`);

    // Get the itinerary with its trip bookings
    const itinerary = await this.itineraryRepository.findOneOrFail(
      { id: itineraryId, tripHash: { $ne: null } },
      {
        populate: ['tripBookings', 'tripBookings.trip', 'user'],
      },
    );

    // Find ALL itineraries with the same tripHash (users traveling the same route)
    // Theoretically, should always be one itinerary/trip combo per user enforced on db level so shouldn't need to de-duplicate.
    const checkedInUngroupedItineraries = await this.itineraryRepository.find(
      {
        tripHash: itinerary.tripHash,
        tripBookings: {
          $some: { status: TripBookingStatus.CHECKED_IN },
          // demo-logic: for now all everyone with the same itinerary always stays together, so the trip bookings for every itinerary should be grouped
          $every: { group: null },
        },
      },
      {
        populate: [
          'tripBookings',
          'tripBookings.trip',
          'tripBookings.user',
          'user',
        ],
      },
    );

    if (!checkedInUngroupedItineraries) {
      throw new BadRequestException(
        `No eligible itineraries found for tripHash ${itinerary.tripHash}`,
      );
    }

    const notEnoughBookingsForGrouping =
      checkedInUngroupedItineraries.length < MIN_GROUP_SIZE;

    if (notEnoughBookingsForGrouping) {
      this.logger.log(
        `Not enough eligible itineraries (${checkedInUngroupedItineraries.length}) for tripHash ${itinerary.tripHash}`,
      );
      // Return results for each trip showing no groups formed
      return {
        groupsFormed: 0,
        usersGrouped: 0,
        usersNotGrouped: checkedInUngroupedItineraries.length,
        stewardsNeeded: 0,
        failureReason: GroupFormationResultFailureReason.NOT_ENOUGH_BOOKINGS,
      };
    }

    const itinerariesWithPotentialStewards =
      checkedInUngroupedItineraries.filter((itin) => itin.wantsToSteward);
    const itinerariesNoSteward = checkedInUngroupedItineraries.filter(
      (itinerary) => itinerary.wantsToSteward !== true,
    );

    if (itinerariesWithPotentialStewards.length === 0) {
      this.logger.warn(
        `No steward candidates for ${checkedInUngroupedItineraries.length} users with tripHash ${itinerary.tripHash}`,
      );
      return {
        groupsFormed: 0,
        usersGrouped: 0,
        usersNotGrouped: checkedInUngroupedItineraries.length,
        stewardsNeeded:
          Math.ceil(checkedInUngroupedItineraries.length / MAX_GROUP_SIZE) -
          itinerariesWithPotentialStewards.length,
        failureReason: GroupFormationResultFailureReason.NO_STEWARD_CANDIDATE,
      };
    }
    if (itinerariesNoSteward.length === 0) {
      // this should never happen
      throw new Error(`Error loading itineraries`);
    }

    const groupSizes = this.calculateBestSplit(
      checkedInUngroupedItineraries.length,
    );

    if (itinerariesWithPotentialStewards.length < groupSizes.length) {
      // currently if we don't have enough stewards for the optimal groups, we don't form groups. May want to change this to form as many as possible
      throw new BadRequestException(
        `Not enough stewards to create optimal amount groups`,
      );
    }

    const selectedStewards: { [groupId: number]: User } = {};
    const memberGroups: { [groupId: number]: User[] } = {};

    // add stewards to groups
    const groupedItineraries: Itinerary[] = [];
    const groupItineraryLookup: { [itineraryId: string]: number } = {};
    groupSizes.forEach((_, idx) => {
      const stewardItinerary = itinerariesWithPotentialStewards.pop();
      if (!stewardItinerary) {
        // this should never happen
        throw new Error(`Itinerary not loaded`);
      }
      selectedStewards[idx] = stewardItinerary.user;
      groupedItineraries.push(stewardItinerary);
      groupItineraryLookup[stewardItinerary.id] = idx;
      memberGroups[idx] = []; // Initialize array for members
    });

    // of the remaining itineraries, we want to create memberGroups
    const remainingItineraries = [
      ...itinerariesNoSteward,
      ...itinerariesWithPotentialStewards,
    ];
    groupSizes.forEach((groupSize, idx) => {
      while (memberGroups[idx].length < groupSize - 1) {
        const itinerary = remainingItineraries.pop();
        if (!itinerary) {
          // this should never happen
          throw new Error(`Itinerary not loaded`);
        }
        memberGroups[idx].push(itinerary.user);
        groupedItineraries.push(itinerary);
        groupItineraryLookup[itinerary.id] = idx;
      }
    });

    for (const itinerary of groupedItineraries) {
      const groupNumber = groupItineraryLookup[itinerary.id];
      itinerary.tripBookings.getItems().forEach((booking) => {
        this.travelGroupRepository.create({
          groupNumber: groupItineraryLookup[itinerary.id],
          status: TravelGroupStatus.FORMING,
          trip: booking.trip,
          steward: selectedStewards[groupNumber],
          tripBookings: booking,
        });
      });
    }

    await this.travelGroupRepository.getEntityManager().flush();
    return {
      groupsFormed: groupSizes.length,
      usersGrouped: groupedItineraries.length,
      usersNotGrouped: remainingItineraries.length,
      stewardsNeeded: 0,
    };
  }

  private calculateBestSplit(totalPeople: number): number[] {
    // If we have less than 5 people, we only need one group
    if (totalPeople <= MAX_GROUP_SIZE) return [totalPeople];

    const groups: number[] = [];

    // Calculate how many full groups of 5 we initially want
    // We reserve 'remainder' logic for the last chunk
    let peopleToGroup = totalPeople;

    // We want to reduce n until it fits a known "remainder optimization" bucket
    // The tricky buckets are remainders 1, 2, 3 where we might want to borrow from a 5.

    while (peopleToGroup > 0) {
      if (peopleToGroup >= 10) {
        // If we have plenty of people, peel off a 5 safely
        groups.push(5);
        peopleToGroup -= 5;
      } else {
        // We are in the final optimization zone (6 to 9 people)
        // or we have exactly 5.
        switch (peopleToGroup) {
          case 9:
            groups.push(5, 4);
            break;
          case 8:
            // 4+4 is same price as 5+3 but fairer
            groups.push(4, 4);
            break;
          case 7:
            // 4+3 is same price as 5+2 but fairer
            groups.push(4, 3);
            break;
          case 6:
            // 3+3 is same price as 4+2 but fairer
            groups.push(3, 3);
            break;
          case 5:
            groups.push(5);
            break;
          default:
            // Should not happen if n >= 10 loop is correct
            // but strictly speaking n=4,3,2 handled here
            groups.push(peopleToGroup);
        }
        peopleToGroup = 0; // Done
      }
    }

    // Sort for clean display (e.g., [5, 5, 4, 3])
    return groups;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip, TripBooking, TravelGroup, User, Itinerary } from '../entities';
import { TripBookingStatus } from '../entities/tripBookingEnum';
import { TravelGroupStatus } from '../entities/travelGroupEnum';
import { createHash } from 'crypto';

/**
 * Result of group formation for a single trip
 */
export interface GroupFormationResult {
  tripId: string;
  groupsFormed: number;
  usersGrouped: number;
  usersNotGrouped: number;
  failedNoSteward: number;
  failureReason?:
    | 'not_enough_bookings'
    | 'no_steward_candidates'
    | 'insufficient_stewards';
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
   */
  async formGroupsForItinerary(
    itineraryId: string,
  ): Promise<GroupFormationResult[]> {
    this.logger.log(`Forming groups for itinerary ${itineraryId}`);

    // Get the itinerary with its trip bookings
    const itinerary = await this.itineraryRepository.findOne(
      { id: itineraryId },
      {
        populate: ['tripBookings', 'tripBookings.trip', 'user'],
      },
    );

    if (!itinerary) {
      this.logger.warn(`Itinerary ${itineraryId} not found`);
      return [];
    }

    const tripHash = itinerary.tripHash ?? this.computeTripHash(itinerary);
    if (!tripHash) {
      this.logger.warn(
        `Itinerary ${itineraryId} missing trip hash; cannot group bookings`,
      );
      return [];
    }

    const results: GroupFormationResult[] = [];

    // Process each trip in the itinerary
    for (const booking of itinerary.tripBookings.getItems()) {
      const trip = booking.trip;
      const result = await this.formGroupsForTrip(trip, tripHash);
      results.push(result);
    }

    return results;
  }

  /**
   * Form groups for a specific trip.
   * Groups users by matching itineraries.
   */
  async formGroupsForTrip(
    trip: Trip,
    requiredTripHash?: string,
  ): Promise<GroupFormationResult> {
    const result: GroupFormationResult = {
      tripId: trip.id,
      groupsFormed: 0,
      usersGrouped: 0,
      usersNotGrouped: 0,
      failedNoSteward: 0,
    };

    const eligibleBookings = await this.tripBookingRepository.find(
      {
        trip: { id: trip.id },
        status: TripBookingStatus.CHECKED_IN,
        group: null,
        ...(requiredTripHash
          ? { itinerary: { tripHash: requiredTripHash } }
          : { itinerary: { tripHash: { $ne: null } } }),
      },
      {
        populate: ['user', 'itinerary'],
      },
    );

    const bookingsByHash = new Map<string, TripBooking[]>();
    let bookingsMissingHash = 0;

    for (const booking of eligibleBookings) {
      const hash = booking.itinerary?.tripHash;
      if (!hash) {
        bookingsMissingHash++;
        continue;
      }
      if (requiredTripHash && hash !== requiredTripHash) {
        continue;
      }
      const list = bookingsByHash.get(hash) ?? [];
      list.push(booking);
      bookingsByHash.set(hash, list);
    }

    this.logger.log(
      `Trip ${trip.id}: processing ${bookingsByHash.size} itinerary group(s)` +
        (requiredTripHash ? ` for hash ${requiredTripHash}` : ''),
    );

    for (const [, groupBookings] of bookingsByHash.entries()) {
      if (groupBookings.length < MIN_GROUP_SIZE) {
        result.usersNotGrouped += groupBookings.length;
        result.failureReason ??= 'not_enough_bookings';
        continue;
      }

      const stewardCandidates = groupBookings.filter(
        (b) => b.itinerary?.wantsToSteward,
      );

      const groupResult = await this.formGroupsFromBookings(
        trip,
        groupBookings,
        stewardCandidates,
      );

      result.groupsFormed += groupResult.groupsFormed;
      result.usersGrouped += groupResult.usersGrouped;
      result.usersNotGrouped += groupResult.usersNotGrouped;
      result.failedNoSteward += groupResult.failedNoSteward;
      result.failureReason ??= groupResult.failureReason;
    }

    if (bookingsMissingHash > 0) {
      result.usersNotGrouped += bookingsMissingHash;
      result.failureReason ??= 'not_enough_bookings';
      this.logger.warn(
        `Trip ${trip.id}: ${bookingsMissingHash} eligible bookings missing trip hash`,
      );
    }

    if (
      result.groupsFormed === 0 &&
      result.usersNotGrouped > 0 &&
      !result.failureReason
    ) {
      result.failureReason = 'not_enough_bookings';
    }

    return result;
  }

  /**
   * Form groups for a specific trip by its ID.
   * Finds the trip and delegates to formGroupsForTrip.
   */
  async formGroupsForTripById(tripId: string): Promise<GroupFormationResult> {
    const trip = await this.tripRepository.findOne({ id: tripId });

    if (!trip) {
      throw new Error(`Trip ${tripId} not found`);
    }

    return this.formGroupsForTrip(trip);
  }

  /**
   * Form travel groups from a set of bookings with the same itinerary.
   */
  private async formGroupsFromBookings(
    trip: Trip,
    bookings: TripBooking[],
    stewardCandidates: TripBooking[],
  ): Promise<{
    groupsFormed: number;
    usersGrouped: number;
    usersNotGrouped: number;
    failedNoSteward: number;
    failureReason?:
      | 'not_enough_bookings'
      | 'no_steward_candidates'
      | 'insufficient_stewards';
  }> {
    const result: {
      groupsFormed: number;
      usersGrouped: number;
      usersNotGrouped: number;
      failedNoSteward: number;
      failureReason?:
        | 'not_enough_bookings'
        | 'no_steward_candidates'
        | 'insufficient_stewards';
    } = {
      groupsFormed: 0,
      usersGrouped: 0,
      usersNotGrouped: 0,
      failedNoSteward: 0,
    };

    if (bookings.length < MIN_GROUP_SIZE) {
      result.usersNotGrouped = bookings.length;
      result.failureReason = 'not_enough_bookings';
      return result;
    }

    if (stewardCandidates.length === 0) {
      this.logger.warn(
        `No steward candidates for ${bookings.length} users on trip ${trip.id}`,
      );
      result.usersNotGrouped = bookings.length;
      result.failedNoSteward = Math.ceil(bookings.length / MAX_GROUP_SIZE);
      result.failureReason = 'no_steward_candidates';
      return result;
    }

    // Split into groups of 2-5
    const groups = this.splitIntoGroups(bookings, stewardCandidates);

    if (groups.length === 0) {
      result.usersNotGrouped = bookings.length;
      result.failedNoSteward = Math.ceil(bookings.length / MAX_GROUP_SIZE);
      result.failureReason = 'insufficient_stewards';
      return result;
    }

    for (const groupBookings of groups) {
      const steward = this.selectSteward(groupBookings, stewardCandidates);

      if (!steward) {
        result.usersNotGrouped += groupBookings.length;
        result.failedNoSteward++;
        continue;
      }

      await this.createTravelGroup(trip, steward.user, groupBookings);
      result.groupsFormed++;
      result.usersGrouped += groupBookings.length;
    }

    return result;
  }

  /**
   * Split bookings into groups of 2-5 people.
   */
  private splitIntoGroups(
    bookings: TripBooking[],
    stewardCandidates: TripBooking[],
  ): TripBooking[][] {
    const n = bookings.length;

    const minGroupsNeeded = Math.ceil(n / MAX_GROUP_SIZE);
    const maxGroupsPossible = Math.floor(n / MIN_GROUP_SIZE);
    const numGroups = Math.min(maxGroupsPossible, stewardCandidates.length);

    if (numGroups < minGroupsNeeded || numGroups === 0) {
      return [];
    }

    // Separate steward candidates and non-stewards
    const stewardSet = new Set(stewardCandidates.map((b) => b.id));
    const nonStewards = bookings.filter((b) => !stewardSet.has(b.id));

    // Create groups, each starting with one steward
    const groups: TripBooking[][] = [];
    for (let i = 0; i < numGroups; i++) {
      groups.push([stewardCandidates[i]]);
    }

    // Distribute extra stewards
    for (let i = numGroups; i < stewardCandidates.length; i++) {
      const targetGroup = groups.find((g) => g.length < MAX_GROUP_SIZE);
      if (targetGroup) {
        targetGroup.push(stewardCandidates[i]);
      }
    }

    // Distribute non-stewards evenly
    let groupIndex = 0;
    for (const booking of nonStewards) {
      let attempts = 0;
      while (
        groups[groupIndex].length >= MAX_GROUP_SIZE &&
        attempts < numGroups
      ) {
        groupIndex = (groupIndex + 1) % numGroups;
        attempts++;
      }

      if (groups[groupIndex].length < MAX_GROUP_SIZE) {
        groups[groupIndex].push(booking);
        groupIndex = (groupIndex + 1) % numGroups;
      }
    }

    return groups.filter((g) => g.length >= MIN_GROUP_SIZE);
  }

  /**
   * Select a steward from the group.
   */
  private selectSteward(
    groupBookings: TripBooking[],
    stewardCandidates: TripBooking[],
  ): TripBooking | null {
    const candidateIds = new Set(stewardCandidates.map((c) => c.id));
    return groupBookings.find((b) => candidateIds.has(b.id)) ?? null;
  }

  /**
   * Create a TravelGroup and update bookings.
   */
  private async createTravelGroup(
    trip: Trip,
    steward: User,
    bookings: TripBooking[],
  ): Promise<TravelGroup> {
    // Get next group number
    const existingCount = await this.travelGroupRepository.count({
      trip: { id: trip.id },
    });
    const groupNumber = existingCount + 1;

    // Create group using repository
    const travelGroup = this.travelGroupRepository.create({
      groupNumber,
      status: TravelGroupStatus.FORMING,
      trip,
      steward,
    });

    // Update bookings
    for (const booking of bookings) {
      booking.group = travelGroup;
      booking.status = TripBookingStatus.GROUPED;
    }

    // Persist
    await this.travelGroupRepository
      .getEntityManager()
      .persistAndFlush([travelGroup, ...bookings]);

    this.logger.log(
      `Created TravelGroup #${groupNumber} for trip ${trip.id} with ${bookings.length} members`,
    );

    return travelGroup;
  }

  /**
   * Compute a trip hash for an itinerary if one is missing.
   */
  private computeTripHash(itinerary: Itinerary): string | null {
    if (
      itinerary.tripBookings &&
      itinerary.tripBookings.isInitialized() &&
      itinerary.tripBookings.length > 0
    ) {
      const sortedBookings = itinerary.tripBookings
        .getItems()
        .slice()
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
      const tripIds = sortedBookings.map((b) => b.trip.id).join(',');
      return createHash('md5').update(tripIds).digest('hex');
    }
    return null;
  }
}

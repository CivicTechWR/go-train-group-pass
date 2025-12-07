import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import { Trip, TripBooking, TravelGroup, User } from '../entities';
import { TripBookingStatus } from '../entities/tripBookingEnum';
import { TravelGroupStatus } from '../entities/travelGroupEnum';

/**
 * Represents a group of users with identical itineraries who can be grouped together
 */
interface ItineraryGroup {
  /** Hash key representing the unique set of trip IDs */
  itineraryHash: string;
  /** All checked-in bookings for users with this itinerary hash */
  bookings: TripBooking[];
  /** Bookings where the user wants to steward */
  stewardCandidates: TripBooking[];
}

/**
 * Result of attempting to form groups for a trip
 */
export interface GroupFormationResult {
  tripId: string;
  tripDepartureTime: string;
  groupsFormed: number;
  usersGrouped: number;
  usersNotGrouped: number;
  failedGroupsNoSteward: number;
  failedGroupsTooSmall: number;
}

/**
 * Overall result of a group formation run
 */
export interface GroupFormationRunResult {
  timestamp: Date;
  tripsProcessed: number;
  totalGroupsFormed: number;
  totalUsersGrouped: number;
  totalUsersNotGrouped: number;
  results: GroupFormationResult[];
}

// Constants
const DEPARTURE_WINDOW_MINUTES = 15;
const MIN_GROUP_SIZE = 2;
const MAX_GROUP_SIZE = 5;

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
    private readonly em: EntityManager,
  ) {}

  /**
   * Main entry point for group formation.
   * Finds all trips departing soon and forms groups for checked-in users.
   */
  async formGroups(): Promise<GroupFormationRunResult> {
    const runResult: GroupFormationRunResult = {
      timestamp: new Date(),
      tripsProcessed: 0,
      totalGroupsFormed: 0,
      totalUsersGrouped: 0,
      totalUsersNotGrouped: 0,
      results: [],
    };

    try {
      // Find trips departing in the next DEPARTURE_WINDOW_MINUTES
      const tripsToProcess = await this.findTripsWithDepartingSoon();
      runResult.tripsProcessed = tripsToProcess.length;

      if (tripsToProcess.length === 0) {
        this.logger.log('No trips departing soon. Nothing to process.');
        return runResult;
      }

      this.logger.log(
        `Found ${tripsToProcess.length} trips departing in the next ${DEPARTURE_WINDOW_MINUTES} minutes`,
      );

      // Process each trip
      for (const trip of tripsToProcess) {
        const tripResult = await this.formGroupsForTrip(trip);
        runResult.results.push(tripResult);
        runResult.totalGroupsFormed += tripResult.groupsFormed;
        runResult.totalUsersGrouped += tripResult.usersGrouped;
        runResult.totalUsersNotGrouped += tripResult.usersNotGrouped;
      }

      this.logger.log(
        `Group formation complete: ${runResult.totalGroupsFormed} groups formed, ` +
          `${runResult.totalUsersGrouped} users grouped, ` +
          `${runResult.totalUsersNotGrouped} users not grouped`,
      );

      return runResult;
    } catch (error) {
      this.logger.error('Error during group formation', error);
      throw error;
    }
  }

  /**
   * Find all trips with departures in the next DEPARTURE_WINDOW_MINUTES.
   * A trip is ready for grouping if its origin stop time departs within the window.
   */
  private async findTripsWithDepartingSoon(): Promise<Trip[]> {
    const now = new Date();
    const windowEnd = new Date(
      now.getTime() + DEPARTURE_WINDOW_MINUTES * 60 * 1000,
    );

    // Get current time in GTFS format (HH:MM:SS)
    const currentTimeStr = this.toGTFSTimeString(now);
    const windowEndTimeStr = this.toGTFSTimeString(windowEnd);

    // Get today's date in YYYYMMDD format for service ID matching
    const todayServiceId = this.toServiceIdFormat(now);

    this.logger.debug(
      `Looking for trips departing between ${currentTimeStr} and ${windowEndTimeStr} on ${todayServiceId}`,
    );

    // Query trips where:
    // 1. The gtfsTrip.serviceId matches today's date
    // 2. The originStopTime.departureTime is within our window
    // 3. There are CHECKED_IN bookings that haven't been grouped yet
    const trips = await this.tripRepository.find(
      {
        gtfsTrip: {
          serviceId: todayServiceId,
        },
      },
      {
        populate: ['gtfsTrip', 'originStopTime', 'destinationStopTime'],
      },
    );

    // Filter trips by departure time window
    const tripsInWindow = trips.filter((trip) => {
      const departureTime = trip.originStopTime.departureTime;
      return (
        departureTime >= currentTimeStr && departureTime <= windowEndTimeStr
      );
    });

    // Further filter to only include trips that have ungrouped, checked-in bookings
    const tripsWithEligibleBookings: Trip[] = [];
    for (const trip of tripsInWindow) {
      const hasEligibleBookings = await this.tripBookingRepository.count({
        trip,
        status: TripBookingStatus.CHECKED_IN,
        group: null,
      });
      if (hasEligibleBookings > 0) {
        tripsWithEligibleBookings.push(trip);
      }
    }

    return tripsWithEligibleBookings;
  }

  /**
   * Form groups for a specific trip.
   * Groups users by identical itineraries.
   */
  private async formGroupsForTrip(trip: Trip): Promise<GroupFormationResult> {
    const result: GroupFormationResult = {
      tripId: trip.id,
      tripDepartureTime: trip.originStopTime.departureTime,
      groupsFormed: 0,
      usersGrouped: 0,
      usersNotGrouped: 0,
      failedGroupsNoSteward: 0,
      failedGroupsTooSmall: 0,
    };

    // Get all checked-in, ungrouped bookings for this trip
    const eligibleBookings = await this.tripBookingRepository.find(
      {
        trip,
        status: TripBookingStatus.CHECKED_IN,
        group: null,
      },
      {
        populate: [
          'user',
          'itinerary',
          'itinerary.tripBookings',
          'itinerary.tripBookings.trip',
        ],
      },
    );

    if (eligibleBookings.length < MIN_GROUP_SIZE) {
      this.logger.log(
        `Trip ${trip.id}: Not enough eligible bookings (${eligibleBookings.length})`,
      );
      result.usersNotGrouped = eligibleBookings.length;
      return result;
    }

    // Group bookings by identical itineraries
    const itineraryGroups = this.groupByItinerary(eligibleBookings);

    this.logger.log(
      `Trip ${trip.id}: Found ${itineraryGroups.length} distinct itinerary groups among ${eligibleBookings.length} bookings`,
    );

    // Form groups within each itinerary group
    for (const itineraryGroup of itineraryGroups) {
      const groupResults = await this.formGroupsFromItineraryGroup(
        trip,
        itineraryGroup,
      );
      result.groupsFormed += groupResults.groupsFormed;
      result.usersGrouped += groupResults.usersGrouped;
      result.usersNotGrouped += groupResults.usersNotGrouped;
      result.failedGroupsNoSteward += groupResults.failedGroupsNoSteward;
      result.failedGroupsTooSmall += groupResults.failedGroupsTooSmall;
    }

    return result;
  }

  /**
   * Group bookings by their itinerary hash (set of trip IDs).
   * Users with identical itineraries (same set of trips) will be grouped together.
   */
  private groupByItinerary(bookings: TripBooking[]): ItineraryGroup[] {
    const groupMap = new Map<string, ItineraryGroup>();

    for (const booking of bookings) {
      const hash = this.computeItineraryHash(booking);

      if (!groupMap.has(hash)) {
        groupMap.set(hash, {
          itineraryHash: hash,
          bookings: [],
          stewardCandidates: [],
        });
      }

      const group = groupMap.get(hash)!;
      group.bookings.push(booking);

      // Check if user wants to steward (from their itinerary)
      if (booking.itinerary?.wantsToSteward) {
        group.stewardCandidates.push(booking);
      }
    }

    return Array.from(groupMap.values());
  }

  /**
   * Compute a hash representing the user's complete itinerary (set of trip IDs).
   * If the booking has no itinerary, use just the current trip ID.
   */
  private computeItineraryHash(booking: TripBooking): string {
    if (!booking.itinerary || !booking.itinerary.tripBookings.isInitialized()) {
      // No itinerary or not loaded - just use the single trip
      return booking.trip.id;
    }

    // Get all trip IDs from the itinerary's bookings, sorted for consistent hashing
    const tripIds = booking.itinerary.tripBookings
      .getItems()
      .map((tb) => tb.trip.id)
      .sort();

    return tripIds.join('|');
  }

  /**
   * Form travel groups from a set of bookings with identical itineraries.
   * Splits into groups of 2-5 with steward prioritization.
   */
  private async formGroupsFromItineraryGroup(
    trip: Trip,
    itineraryGroup: ItineraryGroup,
  ): Promise<{
    groupsFormed: number;
    usersGrouped: number;
    usersNotGrouped: number;
    failedGroupsNoSteward: number;
    failedGroupsTooSmall: number;
  }> {
    const result = {
      groupsFormed: 0,
      usersGrouped: 0,
      usersNotGrouped: 0,
      failedGroupsNoSteward: 0,
      failedGroupsTooSmall: 0,
    };

    const { bookings, stewardCandidates } = itineraryGroup;

    // Not enough people to form a group
    if (bookings.length < MIN_GROUP_SIZE) {
      result.usersNotGrouped = bookings.length;
      result.failedGroupsTooSmall = 1;
      this.logger.debug(
        `Itinerary group ${itineraryGroup.itineraryHash}: Only ${bookings.length} users, need at least ${MIN_GROUP_SIZE}`,
      );
      return result;
    }

    // No steward candidates - fail all groups for this itinerary
    if (stewardCandidates.length === 0) {
      result.usersNotGrouped = bookings.length;
      result.failedGroupsNoSteward = Math.ceil(
        bookings.length / MAX_GROUP_SIZE,
      );
      this.logger.warn(
        `Itinerary group ${itineraryGroup.itineraryHash}: No steward candidates among ${bookings.length} users. Failing groups.`,
      );
      return result;
    }

    // Apply the grouping algorithm
    const groups = this.splitIntoGroups(bookings, stewardCandidates);

    // Persist each group
    for (const groupBookings of groups) {
      const steward = this.selectSteward(groupBookings, stewardCandidates);

      if (!steward) {
        // This shouldn't happen given our earlier check, but handle it defensively
        result.usersNotGrouped += groupBookings.length;
        result.failedGroupsNoSteward++;
        continue;
      }

      const travelGroup = await this.createTravelGroup(
        trip,
        steward.user,
        groupBookings,
      );

      if (travelGroup) {
        result.groupsFormed++;
        result.usersGrouped += groupBookings.length;
      } else {
        result.usersNotGrouped += groupBookings.length;
      }
    }

    return result;
  }

  /**
   * Split bookings into groups of 2-5 people.
   * Algorithm:
   * 1. Calculate how many groups we can form
   * 2. Distribute users as evenly as possible across groups
   * 3. Ensure each group has at least one steward candidate
   */
  private splitIntoGroups(
    bookings: TripBooking[],
    stewardCandidates: TripBooking[],
  ): TripBooking[][] {
    const n = bookings.length;

    // Calculate optimal number of groups
    // We want groups of 2-5, and we need at least as many groups as steward candidates allow
    // (since each group needs a steward)
    const minGroupsForSize = Math.ceil(n / MAX_GROUP_SIZE);
    const maxGroupsForSize = Math.floor(n / MIN_GROUP_SIZE);
    const maxGroupsForStewards = stewardCandidates.length;

    // The number of groups we can actually form
    const numGroups = Math.min(maxGroupsForSize, maxGroupsForStewards);

    if (numGroups < minGroupsForSize) {
      // Can't form valid groups (not enough stewards for the minimum number of groups needed)
      // This situation is handled by the caller
      return [];
    }

    if (numGroups === 0) {
      return [];
    }

    // Separate steward candidates and non-steward bookings
    const stewardSet = new Set(stewardCandidates.map((b) => b.id));
    const nonStewards = bookings.filter((b) => !stewardSet.has(b.id));

    // Create groups, each starting with one steward candidate
    const groups: TripBooking[][] = [];
    for (let i = 0; i < numGroups; i++) {
      groups.push([stewardCandidates[i]]);
    }

    // Distribute remaining steward candidates (if more stewards than groups)
    for (let i = numGroups; i < stewardCandidates.length; i++) {
      // Add extra stewards to groups that have room
      const targetGroup = groups.find((g) => g.length < MAX_GROUP_SIZE);
      if (targetGroup) {
        targetGroup.push(stewardCandidates[i]);
      }
    }

    // Distribute non-steward bookings evenly
    let groupIndex = 0;
    for (const booking of nonStewards) {
      // Find the next group that has room
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
      // If all groups are full, this booking can't be placed (shouldn't happen with our math)
    }

    // Filter out any groups that ended up below minimum size
    return groups.filter((g) => g.length >= MIN_GROUP_SIZE);
  }

  /**
   * Select a steward for the group.
   * Prefers users who explicitly want to steward.
   */
  private selectSteward(
    groupBookings: TripBooking[],
    stewardCandidates: TripBooking[],
  ): TripBooking | null {
    const candidateIds = new Set(stewardCandidates.map((c) => c.id));

    // Find a steward candidate within this group
    const steward = groupBookings.find((b) => candidateIds.has(b.id));

    return steward || null;
  }

  /**
   * Create a TravelGroup entity and update all bookings to reference it.
   */
  private async createTravelGroup(
    trip: Trip,
    steward: User,
    bookings: TripBooking[],
  ): Promise<TravelGroup | null> {
    try {
      // Get the next group number for this trip
      const existingGroupCount = await this.travelGroupRepository.count({
        trip,
      });
      const groupNumber = existingGroupCount + 1;

      // Create the travel group
      const travelGroup = this.travelGroupRepository.create({
        groupNumber,
        status: TravelGroupStatus.FORMING,
        trip,
        steward,
      });

      // Update all bookings to reference this group and update their status
      for (const booking of bookings) {
        booking.group = travelGroup;
        booking.status = TripBookingStatus.GROUPED;
      }

      // Persist everything in a single transaction
      await this.em.persistAndFlush([travelGroup, ...bookings]);

      this.logger.log(
        `Created TravelGroup #${groupNumber} for trip ${trip.id} with ${bookings.length} members, steward: ${steward.id}`,
      );

      return travelGroup;
    } catch (error) {
      this.logger.error(
        `Failed to create travel group for trip ${trip.id}`,
        error,
      );
      return null;
    }
  }

  /**
   * Convert a Date to GTFS time string format (HH:MM:SS).
   * Note: GTFS times can exceed 24:00:00 for overnight trips.
   */
  private toGTFSTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Convert a Date to Metrolinx service ID format (YYYYMMDD).
   */
  private toServiceIdFormat(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
}

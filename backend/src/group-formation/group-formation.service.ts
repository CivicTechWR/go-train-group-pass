import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  EntityRepository,
  EntityManager,
  LockMode,
} from '@mikro-orm/postgresql';
import { Trip, TripBooking, TravelGroup, User } from '../entities';
import { TripBookingStatus } from '../entities/tripBookingEnum';
import { TravelGroupStatus } from '../entities/travelGroupEnum';

/**
 * Represents a group of users with identical itineraries who can be grouped together
 */
interface ItineraryGroup {
  /** Hash key representing the unique set of trip IDs (sorted, normalized) */
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
 * Metrics for observability
 */
export interface GroupFormationMetrics {
  runDurationMs: number;
  stewardShortageIncidents: number;
  groupsTooSmallIncidents: number;
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
  metrics: GroupFormationMetrics;
}

// Configuration defaults
const DEFAULT_DEPARTURE_WINDOW_MINUTES = 15;
const DEFAULT_MIN_GROUP_SIZE = 2;
const DEFAULT_MAX_GROUP_SIZE = 5;

@Injectable()
export class GroupFormationService {
  private readonly logger = new Logger(GroupFormationService.name);

  // Configurable parameters (can be overridden via env vars)
  private readonly departureWindowMinutes: number;
  private readonly minGroupSize: number;
  private readonly maxGroupSize: number;

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(TripBooking)
    private readonly tripBookingRepository: EntityRepository<TripBooking>,
    @InjectRepository(TravelGroup)
    private readonly travelGroupRepository: EntityRepository<TravelGroup>,
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
  ) {
    // Load configurable parameters
    this.departureWindowMinutes =
      this.configService.get<number>('GROUP_FORMATION_WINDOW_MINUTES') ??
      DEFAULT_DEPARTURE_WINDOW_MINUTES;
    this.minGroupSize =
      this.configService.get<number>('GROUP_FORMATION_MIN_SIZE') ??
      DEFAULT_MIN_GROUP_SIZE;
    this.maxGroupSize =
      this.configService.get<number>('GROUP_FORMATION_MAX_SIZE') ??
      DEFAULT_MAX_GROUP_SIZE;

    this.logger.log(
      `Initialized with: windowMinutes=${this.departureWindowMinutes}, ` +
        `minSize=${this.minGroupSize}, maxSize=${this.maxGroupSize}`,
    );
  }

  /**
   * Main entry point for group formation.
   * Finds all trips departing soon and forms groups for checked-in users.
   *
   * Uses database transactions and locking for concurrency safety.
   */
  async formGroups(): Promise<GroupFormationRunResult> {
    const startTime = Date.now();

    const runResult: GroupFormationRunResult = {
      timestamp: new Date(),
      tripsProcessed: 0,
      totalGroupsFormed: 0,
      totalUsersGrouped: 0,
      totalUsersNotGrouped: 0,
      results: [],
      metrics: {
        runDurationMs: 0,
        stewardShortageIncidents: 0,
        groupsTooSmallIncidents: 0,
      },
    };

    try {
      // Find trips departing in the next window (UTC-based)
      const tripsToProcess = await this.findTripsWithDepartingSoon();
      runResult.tripsProcessed = tripsToProcess.length;

      if (tripsToProcess.length === 0) {
        this.logger.log('No trips departing soon. Nothing to process.');
        runResult.metrics.runDurationMs = Date.now() - startTime;
        return runResult;
      }

      this.logger.log(
        `[METRICS] Found ${tripsToProcess.length} trips departing in the next ${this.departureWindowMinutes} minutes`,
      );

      // Process each trip in its own transaction
      for (const trip of tripsToProcess) {
        const tripResult = await this.formGroupsForTripWithTransaction(trip);
        runResult.results.push(tripResult);
        runResult.totalGroupsFormed += tripResult.groupsFormed;
        runResult.totalUsersGrouped += tripResult.usersGrouped;
        runResult.totalUsersNotGrouped += tripResult.usersNotGrouped;
        runResult.metrics.stewardShortageIncidents +=
          tripResult.failedGroupsNoSteward;
        runResult.metrics.groupsTooSmallIncidents +=
          tripResult.failedGroupsTooSmall;
      }

      runResult.metrics.runDurationMs = Date.now() - startTime;

      // Log summary metrics
      this.logger.log(
        `[METRICS] Group formation complete: ` +
          `trips=${runResult.tripsProcessed}, ` +
          `groupsFormed=${runResult.totalGroupsFormed}, ` +
          `usersGrouped=${runResult.totalUsersGrouped}, ` +
          `usersNotGrouped=${runResult.totalUsersNotGrouped}, ` +
          `stewardShortages=${runResult.metrics.stewardShortageIncidents}, ` +
          `tooSmall=${runResult.metrics.groupsTooSmallIncidents}, ` +
          `durationMs=${runResult.metrics.runDurationMs}`,
      );

      return runResult;
    } catch (error) {
      runResult.metrics.runDurationMs = Date.now() - startTime;
      this.logger.error(
        `[ERROR] Group formation failed after ${runResult.metrics.runDurationMs}ms`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  /**
   * Find all trips with departures in the configured time window.
   * Uses UTC for consistent timezone handling.
   */
  private async findTripsWithDepartingSoon(): Promise<Trip[]> {
    // Use UTC for all time calculations
    const now = new Date();
    const windowEnd = new Date(
      now.getTime() + this.departureWindowMinutes * 60 * 1000,
    );

    // Get current time in GTFS format (HH:MM:SS) using UTC
    const currentTimeStr = this.toGTFSTimeStringUTC(now);
    const windowEndTimeStr = this.toGTFSTimeStringUTC(windowEnd);

    // Get today's date in YYYYMMDD format for service ID matching (using local time for date)
    const todayServiceId = this.toServiceIdFormat(now);

    this.logger.debug(
      `Looking for trips departing between ${currentTimeStr} and ${windowEndTimeStr} UTC on service ${todayServiceId}`,
    );

    // Query trips for today's service
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
      const eligibleCount = await this.tripBookingRepository.count({
        trip,
        status: TripBookingStatus.CHECKED_IN,
        group: null,
      });
      if (eligibleCount > 0) {
        this.logger.debug(
          `Trip ${trip.id} has ${eligibleCount} eligible bookings`,
        );
        tripsWithEligibleBookings.push(trip);
      }
    }

    return tripsWithEligibleBookings;
  }

  /**
   * Form groups for a specific trip within a database transaction.
   * Uses row-level locking to prevent concurrent processing of the same bookings.
   */
  private async formGroupsForTripWithTransaction(
    trip: Trip,
  ): Promise<GroupFormationResult> {
    const result: GroupFormationResult = {
      tripId: trip.id,
      tripDepartureTime: trip.originStopTime.departureTime,
      groupsFormed: 0,
      usersGrouped: 0,
      usersNotGrouped: 0,
      failedGroupsNoSteward: 0,
      failedGroupsTooSmall: 0,
    };

    // Use a forked EntityManager for transaction isolation
    const fork = this.em.fork();

    try {
      await fork.transactional(async (txEm) => {
        // Get eligible bookings with FOR UPDATE lock to prevent concurrent processing
        const eligibleBookings = await txEm.find(
          TripBooking,
          {
            trip: { id: trip.id },
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
            lockMode: LockMode.PESSIMISTIC_WRITE,
          },
        );

        // Re-validate after acquiring lock (another process may have grouped them)
        const stillEligible = eligibleBookings.filter(
          (b) => b.status === TripBookingStatus.CHECKED_IN && b.group === null,
        );

        if (stillEligible.length < this.minGroupSize) {
          this.logger.debug(
            `Trip ${trip.id}: Not enough eligible bookings after lock (${stillEligible.length})`,
          );
          result.usersNotGrouped = stillEligible.length;
          return;
        }

        // Group bookings by identical itineraries
        const itineraryGroups = this.groupByItinerary(stillEligible);

        this.logger.log(
          `Trip ${trip.id}: Processing ${itineraryGroups.length} itinerary groups with ${stillEligible.length} bookings`,
        );

        // Form groups within each itinerary group
        for (const itineraryGroup of itineraryGroups) {
          const groupResults = await this.formGroupsFromItineraryGroup(
            txEm,
            trip,
            itineraryGroup,
          );
          result.groupsFormed += groupResults.groupsFormed;
          result.usersGrouped += groupResults.usersGrouped;
          result.usersNotGrouped += groupResults.usersNotGrouped;
          result.failedGroupsNoSteward += groupResults.failedGroupsNoSteward;
          result.failedGroupsTooSmall += groupResults.failedGroupsTooSmall;
        }
      });
    } catch (error) {
      this.logger.error(
        `[ERROR] Transaction failed for trip ${trip.id}`,
        error instanceof Error ? error.stack : error,
      );
      // Don't re-throw - we want to continue processing other trips
    }

    return result;
  }

  /**
   * Group bookings by their itinerary hash (set of trip IDs).
   * Users with identical itineraries (same set of trips) will be grouped together.
   *
   * Hash computation is deterministic: trip IDs are sorted alphabetically.
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
   * Compute a deterministic hash representing the user's complete itinerary.
   *
   * Algorithm:
   * 1. Get all trip IDs from the itinerary's bookings
   * 2. Sort alphabetically for consistent hashing
   * 3. Join with pipe separator
   *
   * If no itinerary, returns just the current trip ID.
   */
  private computeItineraryHash(booking: TripBooking): string {
    if (!booking.itinerary || !booking.itinerary.tripBookings.isInitialized()) {
      // No itinerary or not loaded - just use the single trip
      return `single:${booking.trip.id}`;
    }

    // Get all trip IDs from the itinerary's bookings, sorted for consistent hashing
    const tripIds = booking.itinerary.tripBookings
      .getItems()
      .map((tb) => tb.trip.id)
      .sort(); // Alphabetical sort for determinism

    return `multi:${tripIds.join('|')}`;
  }

  /**
   * Form travel groups from a set of bookings with identical itineraries.
   * Splits into groups of minSize-maxSize with steward prioritization.
   */
  private async formGroupsFromItineraryGroup(
    txEm: EntityManager,
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
    if (bookings.length < this.minGroupSize) {
      result.usersNotGrouped = bookings.length;
      result.failedGroupsTooSmall = 1;
      this.logger.debug(
        `[METRICS] Itinerary ${itineraryGroup.itineraryHash}: ` +
          `${bookings.length} users < minSize ${this.minGroupSize}`,
      );
      return result;
    }

    // No steward candidates - fail all groups for this itinerary
    if (stewardCandidates.length === 0) {
      result.usersNotGrouped = bookings.length;
      result.failedGroupsNoSteward = Math.ceil(
        bookings.length / this.maxGroupSize,
      );
      this.logger.warn(
        `[METRICS] Steward shortage: itinerary=${itineraryGroup.itineraryHash}, ` +
          `users=${bookings.length}, potentialGroups=${result.failedGroupsNoSteward}`,
      );
      return result;
    }

    // Apply the grouping algorithm
    const groups = this.splitIntoGroups(bookings, stewardCandidates);

    // Persist each group within the transaction
    for (const groupBookings of groups) {
      const steward = this.selectSteward(groupBookings, stewardCandidates);

      if (!steward) {
        // This shouldn't happen given our earlier check, but handle defensively
        result.usersNotGrouped += groupBookings.length;
        result.failedGroupsNoSteward++;
        this.logger.warn(
          `[WARNING] No steward found for group in itinerary ${itineraryGroup.itineraryHash}`,
        );
        continue;
      }

      const travelGroup = await this.createTravelGroup(
        txEm,
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
   * Split bookings into groups of minSize-maxSize people.
   *
   * Algorithm:
   * 1. Calculate how many groups we can form (limited by steward count)
   * 2. Each group starts with one steward
   * 3. Distribute remaining users evenly
   * 4. Filter out any groups below minimum size
   *
   * Remainder handling:
   * - Users who can't fit into a valid group remain ungrouped
   * - They will be picked up in the next run if more users check in
   */
  private splitIntoGroups(
    bookings: TripBooking[],
    stewardCandidates: TripBooking[],
  ): TripBooking[][] {
    const n = bookings.length;

    // Calculate optimal number of groups
    const minGroupsForSize = Math.ceil(n / this.maxGroupSize);
    const maxGroupsForSize = Math.floor(n / this.minGroupSize);
    const maxGroupsForStewards = stewardCandidates.length;

    // The number of groups we can actually form
    const numGroups = Math.min(maxGroupsForSize, maxGroupsForStewards);

    if (numGroups < minGroupsForSize) {
      // Can't form valid groups (not enough stewards)
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
      const targetGroup = groups.find((g) => g.length < this.maxGroupSize);
      if (targetGroup) {
        targetGroup.push(stewardCandidates[i]);
      }
    }

    // Distribute non-steward bookings evenly
    let groupIndex = 0;
    for (const booking of nonStewards) {
      let attempts = 0;
      while (
        groups[groupIndex].length >= this.maxGroupSize &&
        attempts < numGroups
      ) {
        groupIndex = (groupIndex + 1) % numGroups;
        attempts++;
      }

      if (groups[groupIndex].length < this.maxGroupSize) {
        groups[groupIndex].push(booking);
        groupIndex = (groupIndex + 1) % numGroups;
      }
      // If all groups are full, this booking can't be placed
    }

    // Filter out any groups that ended up below minimum size
    return groups.filter((g) => g.length >= this.minGroupSize);
  }

  /**
   * Select a steward for the group.
   * Returns the first steward candidate found in the group.
   */
  private selectSteward(
    groupBookings: TripBooking[],
    stewardCandidates: TripBooking[],
  ): TripBooking | null {
    const candidateIds = new Set(stewardCandidates.map((c) => c.id));
    return groupBookings.find((b) => candidateIds.has(b.id)) ?? null;
  }

  /**
   * Create a TravelGroup entity and update all bookings to reference it.
   * All operations happen within the provided transaction.
   */
  private async createTravelGroup(
    txEm: EntityManager,
    trip: Trip,
    steward: User,
    bookings: TripBooking[],
  ): Promise<TravelGroup | null> {
    try {
      // Get the next group number for this trip
      const existingGroupCount = await txEm.count(TravelGroup, {
        trip: { id: trip.id },
      });
      const groupNumber = existingGroupCount + 1;

      // Create the travel group
      const travelGroup = txEm.create(TravelGroup, {
        groupNumber,
        status: TravelGroupStatus.FORMING,
        trip: txEm.getReference(Trip, trip.id),
        steward: txEm.getReference(User, steward.id),
      });

      // Update all bookings to reference this group and update their status
      for (const booking of bookings) {
        booking.group = travelGroup;
        booking.status = TripBookingStatus.GROUPED;
      }

      // Persist within the transaction
      txEm.persist(travelGroup);
      for (const booking of bookings) {
        txEm.persist(booking);
      }

      this.logger.log(
        `[CREATED] TravelGroup #${groupNumber} for trip ${trip.id}: ` +
          `members=${bookings.length}, steward=${steward.id}`,
      );

      return travelGroup;
    } catch (error) {
      this.logger.error(
        `[ERROR] Failed to create travel group for trip ${trip.id}`,
        error instanceof Error ? error.stack : error,
      );
      return null;
    }
  }

  /**
   * Convert a Date to GTFS time string format (HH:MM:SS) using UTC.
   * This ensures consistent behavior regardless of server timezone.
   */
  private toGTFSTimeStringUTC(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Convert a Date to Metrolinx service ID format (YYYYMMDD).
   * Uses local date since service IDs are typically based on local dates.
   */
  private toServiceIdFormat(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
}

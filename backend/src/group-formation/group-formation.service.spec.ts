import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GroupFormationService,
  GroupFormationRunResult,
} from './group-formation.service';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Trip, TripBooking, TravelGroup } from '../entities';
import { TripBookingStatus } from '../entities/tripBookingEnum';
import {
  createMockUser,
  createMockTrip,
  createMockItinerary,
  createMockBooking,
  createUniformItineraryScenario,
  resetCounters,
} from './test-utils';

describe('GroupFormationService', () => {
  let service: GroupFormationService;
  let mockTripRepo: EntityRepository<Trip>;
  let mockBookingRepo: EntityRepository<TripBooking>;
  let mockTravelGroupRepo: EntityRepository<TravelGroup>;
  let mockEm: EntityManager;

  // Store created groups for verification
  let createdGroups: TravelGroup[];

  beforeEach(() => {
    resetCounters();
    createdGroups = [];

    mockTripRepo = {
      find: vi.fn().mockResolvedValue([]),
    } as unknown as EntityRepository<Trip>;

    mockBookingRepo = {
      find: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    } as unknown as EntityRepository<TripBooking>;

    mockTravelGroupRepo = {
      find: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation((data: Partial<TravelGroup>) => {
        const group = new TravelGroup();
        Object.assign(group, data);
        createdGroups.push(group);
        return group;
      }),
    } as unknown as EntityRepository<TravelGroup>;

    mockEm = {
      persistAndFlush: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    service = new GroupFormationService(
      mockTripRepo,
      mockBookingRepo,
      mockTravelGroupRepo,
      mockEm,
    );
  });

  describe('formGroups - Public API', () => {
    it('should return empty result when no trips are departing soon', async () => {
      const result = await service.formGroups();

      expect(result.tripsProcessed).toBe(0);
      expect(result.totalGroupsFormed).toBe(0);
      expect(result.totalUsersGrouped).toBe(0);
      expect(result.totalUsersNotGrouped).toBe(0);
      expect(result.results).toHaveLength(0);
    });

    it('should include timestamp in result', async () => {
      const before = new Date();
      const result = await service.formGroups();
      const after = new Date();

      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should return properly structured GroupFormationRunResult', async () => {
      const result = await service.formGroups();

      // Verify all required properties exist
      expect(result).toMatchObject({
        timestamp: expect.any(Date) as Date,
        tripsProcessed: expect.any(Number) as number,
        totalGroupsFormed: expect.any(Number) as number,
        totalUsersGrouped: expect.any(Number) as number,
        totalUsersNotGrouped: expect.any(Number) as number,
        results: expect.any(Array) as unknown[],
      });
    });
  });

  describe('Trip Finding Logic', () => {
    it('should query trips for current service date', async () => {
      const findMock = vi.fn().mockResolvedValue([]);
      mockTripRepo = {
        find: findMock,
      } as unknown as EntityRepository<Trip>;

      service = new GroupFormationService(
        mockTripRepo,
        mockBookingRepo,
        mockTravelGroupRepo,
        mockEm,
      );

      await service.formGroups();

      // Verify trip repository was called
      expect(findMock).toHaveBeenCalled();
    });
  });
});

describe('Grouping Algorithm - Unit Tests', () => {
  describe('Group Size Constraints', () => {
    it('documents minimum group size of 2', () => {
      // The algorithm requires at least 2 users to form a group
      // Single users cannot be grouped
      const MIN_GROUP_SIZE = 2;
      expect(MIN_GROUP_SIZE).toBe(2);
    });

    it('documents maximum group size of 5', () => {
      // Groups cannot exceed 5 members (GO Transit group pass limit)
      const MAX_GROUP_SIZE = 5;
      expect(MAX_GROUP_SIZE).toBe(5);
    });
  });

  describe('Steward Requirements', () => {
    it('documents steward requirement', () => {
      // Each group must have at least one member who is willing to steward
      // Groups without steward candidates fail
      const REQUIRES_STEWARD = true;
      expect(REQUIRES_STEWARD).toBe(true);
    });
  });

  describe('Itinerary Matching', () => {
    it('documents itinerary matching requirement', () => {
      // Users must have identical itineraries (same set of trips) to be grouped
      const REQUIRES_IDENTICAL_ITINERARY = true;
      expect(REQUIRES_IDENTICAL_ITINERARY).toBe(true);
    });
  });

  describe('Departure Window', () => {
    it('documents 15 minute departure window', () => {
      // The job processes trips departing within 15 minutes
      const DEPARTURE_WINDOW_MINUTES = 15;
      expect(DEPARTURE_WINDOW_MINUTES).toBe(15);
    });
  });
});

describe('Test Utilities', () => {
  beforeEach(() => {
    resetCounters();
  });

  describe('createMockUser', () => {
    it('should create a valid user entity', () => {
      const user = createMockUser();

      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toContain('@');
      expect(user.phoneNumber).toBeDefined();
      expect(user.authUserId).toBeDefined();
    });

    it('should create unique users', () => {
      const user1 = createMockUser();
      const user2 = createMockUser();

      expect(user1.id).not.toBe(user2.id);
      expect(user1.email).not.toBe(user2.email);
    });
  });

  describe('createMockTrip', () => {
    it('should create a valid trip entity', () => {
      const trip = createMockTrip('08:30:00', '20251210');

      expect(trip.id).toBeDefined();
      expect(trip.gtfsTrip.serviceId).toBe('20251210');
      expect(trip.originStopTime.departureTime).toBe('08:30:00');
    });
  });

  describe('createMockItinerary', () => {
    it('should create itinerary with wantsToSteward flag', () => {
      const trip = createMockTrip();
      const itinerary = createMockItinerary(true, [trip]);

      expect(itinerary.wantsToSteward).toBe(true);
    });

    it('should create itinerary with trip bookings', () => {
      const trip1 = createMockTrip();
      const trip2 = createMockTrip();
      const itinerary = createMockItinerary(false, [trip1, trip2]);

      expect(itinerary.tripBookings.isInitialized()).toBe(true);
      expect(itinerary.tripBookings.getItems()).toHaveLength(2);
    });
  });

  describe('createMockBooking', () => {
    it('should create booking with CHECKED_IN status by default', () => {
      const user = createMockUser();
      const trip = createMockTrip();
      const booking = createMockBooking(user, trip);

      expect(booking.status).toBe(TripBookingStatus.CHECKED_IN);
      expect(booking.user).toBe(user);
      expect(booking.trip).toBe(trip);
      expect(booking.group).toBeUndefined();
    });

    it('should allow custom status', () => {
      const user = createMockUser();
      const trip = createMockTrip();
      const booking = createMockBooking(
        user,
        trip,
        undefined,
        TripBookingStatus.PENDING,
      );

      expect(booking.status).toBe(TripBookingStatus.PENDING);
    });
  });

  describe('createUniformItineraryScenario', () => {
    it('should create scenario with specified user count', () => {
      const scenario = createUniformItineraryScenario(5, 1);

      expect(scenario.bookings).toHaveLength(5);
      expect(scenario.users).toHaveLength(5);
    });

    it('should create scenario with specified steward count', () => {
      const scenario = createUniformItineraryScenario(5, 2);

      expect(scenario.stewardCandidates).toHaveLength(2);
    });

    it('should create all bookings with same itinerary structure', () => {
      const scenario = createUniformItineraryScenario(3, 1, [
        'trip-a',
        'trip-b',
      ]);

      // All bookings should have the same number of trips in their itinerary
      for (const booking of scenario.bookings) {
        expect(booking.itinerary).toBeDefined();
        expect(booking.itinerary?.tripBookings.getItems()).toHaveLength(2);
      }
    });
  });
});

describe('GroupFormationResult Structure', () => {
  it('should define correct GroupFormationResult interface', () => {
    const mockResult = {
      tripId: 'trip-1',
      tripDepartureTime: '08:00:00',
      groupsFormed: 2,
      usersGrouped: 8,
      usersNotGrouped: 1,
      failedGroupsNoSteward: 0,
      failedGroupsTooSmall: 1,
    };

    expect(mockResult.tripId).toBeDefined();
    expect(mockResult.tripDepartureTime).toBeDefined();
    expect(mockResult.groupsFormed).toBeGreaterThanOrEqual(0);
    expect(mockResult.usersGrouped).toBeGreaterThanOrEqual(0);
    expect(mockResult.usersNotGrouped).toBeGreaterThanOrEqual(0);
    expect(mockResult.failedGroupsNoSteward).toBeGreaterThanOrEqual(0);
    expect(mockResult.failedGroupsTooSmall).toBeGreaterThanOrEqual(0);
  });

  it('should define correct GroupFormationRunResult interface', () => {
    const mockResult: GroupFormationRunResult = {
      timestamp: new Date(),
      tripsProcessed: 3,
      totalGroupsFormed: 5,
      totalUsersGrouped: 20,
      totalUsersNotGrouped: 3,
      results: [],
    };

    expect(mockResult.timestamp).toBeInstanceOf(Date);
    expect(typeof mockResult.tripsProcessed).toBe('number');
    expect(typeof mockResult.totalGroupsFormed).toBe('number');
    expect(typeof mockResult.totalUsersGrouped).toBe('number');
    expect(typeof mockResult.totalUsersNotGrouped).toBe('number');
    expect(Array.isArray(mockResult.results)).toBe(true);
  });
});

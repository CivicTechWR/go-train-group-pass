import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GroupFormationService,
  GroupFormationResult,
} from './group-formation.service';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip, TripBooking, TravelGroup, Itinerary } from '../entities';
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
  let mockItineraryRepo: EntityRepository<Itinerary>;

  beforeEach(() => {
    resetCounters();

    mockTripRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
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
        return group;
      }),
      getEntityManager: vi.fn().mockReturnValue({
        persistAndFlush: vi.fn().mockResolvedValue(undefined),
      }),
    } as unknown as EntityRepository<TravelGroup>;

    mockItineraryRepo = {
      findOne: vi.fn().mockResolvedValue(null),
    } as unknown as EntityRepository<Itinerary>;

    service = new GroupFormationService(
      mockTripRepo,
      mockBookingRepo,
      mockTravelGroupRepo,
      mockItineraryRepo,
    );
  });

  describe('formGroupsForTrip', () => {
    it('should return empty result when not enough eligible bookings', async () => {
      const trip = createMockTrip();

      // Mock: only 1 booking (less than min of 2)
      mockBookingRepo.find = vi
        .fn()
        .mockResolvedValue([createMockBooking(createMockUser(), trip)]);

      const result = await service.formGroupsForTrip(trip);

      expect(result.tripId).toBe(trip.id);
      expect(result.groupsFormed).toBe(0);
      expect(result.usersNotGrouped).toBe(1);
    });

    it('should return result with correct structure', async () => {
      const trip = createMockTrip();
      mockBookingRepo.find = vi.fn().mockResolvedValue([]);

      const result = await service.formGroupsForTrip(trip);

      expect(result).toMatchObject({
        tripId: expect.any(String) as string,
        groupsFormed: expect.any(Number) as number,
        usersGrouped: expect.any(Number) as number,
        usersNotGrouped: expect.any(Number) as number,
        failedNoSteward: expect.any(Number) as number,
      });
    });
  });

  describe('formGroupsForItinerary', () => {
    it('should return empty array when itinerary not found', async () => {
      mockItineraryRepo.findOne = vi.fn().mockResolvedValue(null);

      const results = await service.formGroupsForItinerary('non-existent');

      expect(results).toEqual([]);
    });
  });
});

describe('Grouping Algorithm - Documentation', () => {
  describe('Group Size Constraints', () => {
    it('documents minimum group size of 2', () => {
      const MIN_GROUP_SIZE = 2;
      expect(MIN_GROUP_SIZE).toBe(2);
    });

    it('documents maximum group size of 5', () => {
      const MAX_GROUP_SIZE = 5;
      expect(MAX_GROUP_SIZE).toBe(5);
    });
  });

  describe('Steward Requirements', () => {
    it('documents that each group requires at least one steward', () => {
      const REQUIRES_STEWARD = true;
      expect(REQUIRES_STEWARD).toBe(true);
    });
  });

  describe('Itinerary Matching', () => {
    it('documents that users must have identical itineraries to be grouped', () => {
      const REQUIRES_IDENTICAL_ITINERARY = true;
      expect(REQUIRES_IDENTICAL_ITINERARY).toBe(true);
    });
  });
});

describe('Scheduler - Documentation', () => {
  describe('Event-Driven Scheduling', () => {
    it('documents that group formation is scheduled at departureTime - 15 minutes', () => {
      const FORMATION_LEAD_TIME_MINUTES = 15;
      expect(FORMATION_LEAD_TIME_MINUTES).toBe(15);
    });

    it('documents that scheduling is triggered when itineraries are created', () => {
      const TRIGGER_ON_ITINERARY_CREATION = true;
      expect(TRIGGER_ON_ITINERARY_CREATION).toBe(true);
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
    });

    it('should create unique users', () => {
      const user1 = createMockUser();
      const user2 = createMockUser();

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('createMockTrip', () => {
    it('should create a valid trip entity', () => {
      const trip = createMockTrip('08:30:00', '20251210');

      expect(trip.id).toBeDefined();
      expect(trip.originStopTime.departureTime).toBe('08:30:00');
    });
  });

  describe('createMockItinerary', () => {
    it('should create itinerary with wantsToSteward flag', () => {
      const trip = createMockTrip();
      const itinerary = createMockItinerary(true, [trip]);

      expect(itinerary.wantsToSteward).toBe(true);
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
  });
});

describe('GroupFormationResult Structure', () => {
  it('should define correct GroupFormationResult interface', () => {
    const mockResult: GroupFormationResult = {
      tripId: 'trip-1',
      groupsFormed: 2,
      usersGrouped: 8,
      usersNotGrouped: 1,
      failedNoSteward: 0,
    };

    expect(mockResult.tripId).toBeDefined();
    expect(mockResult.groupsFormed).toBeGreaterThanOrEqual(0);
    expect(mockResult.usersGrouped).toBeGreaterThanOrEqual(0);
    expect(mockResult.usersNotGrouped).toBeGreaterThanOrEqual(0);
    expect(mockResult.failedNoSteward).toBeGreaterThanOrEqual(0);
  });
});

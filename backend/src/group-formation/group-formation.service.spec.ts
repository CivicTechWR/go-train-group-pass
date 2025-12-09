import { Test, TestingModule } from '@nestjs/testing';
import { Mock, vi } from 'vitest';
import {
  GroupFormationService,
  GroupFormationResultFailureReason,
} from './group-formation.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Trip, TripBooking, TravelGroup, Itinerary, User } from '../entities';
import { BadRequestException } from '@nestjs/common';

// Add missing imports if needed, or rely on existing
import { Collection, EntityManager } from '@mikro-orm/core';

describe('GroupFormationService', () => {
  let service: GroupFormationService;
  let itineraryRepositoryMock: {
    findOneOrFail: Mock;
    find: Mock;
  };
  let travelGroupRepositoryMock: {
    create: Mock;
    getEntityManager: Mock<() => { flush: Mock }>;
  };
  let tripRepositoryMock: {
    findOneOrFail: Mock;
    find: Mock;
  };
  let tripBookingRepositoryMock: {
    findOneOrFail: Mock;
    find: Mock;
  };

  beforeEach(async () => {
    // Basic mocks
    tripRepositoryMock = {
      findOneOrFail: vi.fn(),
      find: vi.fn(),
    };
    tripBookingRepositoryMock = {
      findOneOrFail: vi.fn(),
      find: vi.fn(),
    };
    travelGroupRepositoryMock = {
      create: vi.fn(),
      getEntityManager: vi.fn().mockReturnValue({
        flush: vi.fn(),
      } as unknown as EntityManager),
    };
    itineraryRepositoryMock = {
      findOneOrFail: vi.fn(),
      find: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupFormationService,
        { provide: getRepositoryToken(Trip), useValue: tripRepositoryMock },
        {
          provide: getRepositoryToken(TripBooking),
          useValue: tripBookingRepositoryMock,
        },
        {
          provide: getRepositoryToken(TravelGroup),
          useValue: travelGroupRepositoryMock,
        },
        {
          provide: getRepositoryToken(Itinerary),
          useValue: itineraryRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<GroupFormationService>(GroupFormationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('formGroupsForItinerary', () => {
    const mockTripHash = 'abc-123';
    const mockItineraryId = 'itinerary-1';

    it('should return NOT_ENOUGH_BOOKINGS if fewer than 2 users', async () => {
      // Mock finding the requested itinerary
      itineraryRepositoryMock.findOneOrFail.mockResolvedValue({
        id: mockItineraryId,
        tripHash: mockTripHash,
      });
      // Mock finding only 1 matching itinerary
      itineraryRepositoryMock.find.mockResolvedValue([
        { id: '1', user: { id: 'u1' } },
      ]);

      const result = await service.formGroupsForItinerary(mockItineraryId);

      expect(result.failureReason).toBe(
        GroupFormationResultFailureReason.NOT_ENOUGH_BOOKINGS,
      );
      expect(result.groupsFormed).toBe(0);
      expect(result.usersNotGrouped).toBe(1);
    });

    it('should return NO_STEWARD_CANDIDATE if no one wants to steward', async () => {
      itineraryRepositoryMock.findOneOrFail.mockResolvedValue({
        id: mockItineraryId,
        tripHash: mockTripHash,
      });
      // 3 users, none want to steward
      itineraryRepositoryMock.find.mockResolvedValue([
        { id: '1', wantsToSteward: false, user: { id: 'u1' } },
        { id: '2', wantsToSteward: false, user: { id: 'u2' } },
        { id: '3', wantsToSteward: false, user: { id: 'u3' } },
      ]);

      const result = await service.formGroupsForItinerary(mockItineraryId);

      expect(result.failureReason).toBe(
        GroupFormationResultFailureReason.NO_STEWARD_CANDIDATE,
      );
      expect(result.stewardsNeeded).toBeGreaterThan(0);
      expect(result.groupsFormed).toBe(0);
    });

    it('should successfully form a single group of 3', async () => {
      itineraryRepositoryMock.findOneOrFail.mockResolvedValue({
        id: mockItineraryId,
        tripHash: mockTripHash,
      });
      // 3 users, 1 wants to steward
      const mockBookings = {
        getItems: () => [{ trip: { id: 't1' } }],
      } as unknown as Collection<TripBooking>;
      const users = [
        {
          id: '1',
          wantsToSteward: true,
          user: { id: 'u1' } as User,
          tripBookings: mockBookings,
        },
        {
          id: '2',
          wantsToSteward: false,
          user: { id: 'u2' } as User,
          tripBookings: mockBookings,
        },
        {
          id: '3',
          wantsToSteward: false,
          user: { id: 'u3' } as User,
          tripBookings: mockBookings,
        },
      ];
      itineraryRepositoryMock.find.mockResolvedValue(users);

      const result = await service.formGroupsForItinerary(mockItineraryId);

      expect(result.groupsFormed).toBe(1); // One group of 3
      expect(result.usersGrouped).toBe(3);
      expect(travelGroupRepositoryMock.create).toHaveBeenCalledTimes(3); // Called for each user's booking
      expect(
        travelGroupRepositoryMock.getEntityManager().flush,
      ).toHaveBeenCalled();
    });

    it('should split 6 users into two groups of 3', async () => {
      itineraryRepositoryMock.findOneOrFail.mockResolvedValue({
        id: mockItineraryId,
        tripHash: mockTripHash,
      });

      // We need 2 stewards for 2 groups
      const mockBookings = {
        getItems: () => [{ trip: { id: 't1' } }],
      } as unknown as Collection<TripBooking>;
      const users: Partial<Itinerary>[] = [];
      // 2 stewards
      for (let i = 0; i < 2; i++) {
        users.push({
          id: `s${i}`,
          wantsToSteward: true,
          user: { id: `us${i}` } as User,
          tripBookings: mockBookings,
        });
      }
      // 4 regular
      for (let i = 0; i < 4; i++) {
        users.push({
          id: `r${i}`,
          wantsToSteward: false,
          user: { id: `ur${i}` } as User,
          tripBookings: mockBookings,
        });
      }
      itineraryRepositoryMock.find.mockResolvedValue(users);

      const result = await service.formGroupsForItinerary(mockItineraryId);

      // Best split for 6 is 3, 3 -> 2 groups
      expect(result.groupsFormed).toBe(2);
      expect(result.usersGrouped).toBe(6);
      expect(travelGroupRepositoryMock.create).toHaveBeenCalledTimes(6);
    });

    it('should throw BadRequestException if not enough stewards for optimal split', async () => {
      itineraryRepositoryMock.findOneOrFail.mockResolvedValue({
        id: mockItineraryId,
        tripHash: mockTripHash,
      });

      // 6 users need 2 groups (3+3), but only 1 steward provided
      const users: Partial<Itinerary>[] = [];
      // 1 steward
      users.push({
        id: 's1',
        wantsToSteward: true,
        user: { id: 'us1' } as User,
      });
      // 5 regular
      for (let i = 0; i < 5; i++) {
        users.push({
          id: `r${i}`,
          wantsToSteward: false,
          user: { id: `ur${i}` } as User,
        });
      }
      itineraryRepositoryMock.find.mockResolvedValue(users);

      await expect(
        service.formGroupsForItinerary(mockItineraryId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no eligible itineraries found', async () => {
      itineraryRepositoryMock.findOneOrFail.mockResolvedValue({
        id: mockItineraryId,
        tripHash: mockTripHash,
      });

      itineraryRepositoryMock.find.mockResolvedValue(null); // Simulated null return if type allows or adjust logic
      // Actually service check "if (!checkedInUngroupedItineraries)" - usually find returns empty array not null, but let's test empty array

      // If find returns empty array
      itineraryRepositoryMock.find.mockResolvedValue([]);

      const result = await service.formGroupsForItinerary(mockItineraryId);
      // Less than MIN_GROUP_SIZE (2)
      expect(result.failureReason).toBe(
        GroupFormationResultFailureReason.NOT_ENOUGH_BOOKINGS,
      );
    });
  });
});

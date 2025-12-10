import { Test, TestingModule } from '@nestjs/testing';
import { ItinerariesService } from './itineraries.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { Itinerary } from '../entities/itinerary.entity';
import { TripBooking } from '../entities/trip_booking.entity';
import { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { TripBookingService } from '../trip-booking/trip-booking.service';
import { CreateItineraryDto } from '@go-train-group-pass/shared';
import { ItineraryStatus } from '../entities/itineraryStatusEnum';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

// Mock the @Transactional decorator to be a passthrough
vi.mock('@mikro-orm/core', async () => {
  const actual = await vi.importActual('@mikro-orm/core');
  return {
    ...actual,
    Transactional:
      () =>
      <T>(
        target: object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>,
      ) =>
        descriptor,
  };
});

describe('ItinerariesService', () => {
  let service: ItinerariesService;
  let itineraryRepo: {
    find: Mock;
    findOne: Mock;
    create: Mock;
    getEntityManager: Mock<() => { persist: Mock; flush: Mock }>;
    persist: Mock;
    flush: Mock;
  };
  let em: { persist: Mock; flush: Mock };
  let usersService: { findByAuthUserIdOrFail: Mock; findById: Mock };
  let tripBookingService: { create: Mock; getTripDetails: Mock };

  beforeEach(async () => {
    // Reset mocks for each test
    const mockEm = {
      persist: vi.fn(),
      flush: vi.fn(),
    };

    const mockRepository = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn((data: Record<string, unknown>) => ({
        ...data,
        id: 'mock-id',
      })),
      persist: vi.fn(),
      flush: vi.fn(),
      getEntityManager: vi.fn().mockReturnValue(mockEm),
    };

    const mockUsersService = {
      findByAuthUserIdOrFail: vi.fn(),
      findById: vi.fn(),
    };

    const mockTripBookingService = {
      create: vi.fn(),
      getTripDetails: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItinerariesService,
        { provide: getRepositoryToken(Itinerary), useValue: mockRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: TripBookingService, useValue: mockTripBookingService },
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    service = module.get<ItinerariesService>(ItinerariesService);
    itineraryRepo = module.get(getRepositoryToken(Itinerary));
    em = module.get(EntityManager);
    usersService = module.get(UsersService);
    tripBookingService = module.get(TripBookingService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user-uuid';
    const createItineraryDto: CreateItineraryDto = {
      segments: [
        {
          gtfsTripId: 'gtfs-trip-1',
          originStopTimeId: 'stop-1',
          destStopTimeId: 'stop-2',
        },
        {
          gtfsTripId: 'gtfs-trip-2',
          originStopTimeId: 'stop-2',
          destStopTimeId: 'stop-3',
        },
      ],
      wantsToSteward: true,
    };

    const mockUser = { id: userId, authUserId: 'auth-user-id' } as User;
    const mockTripBooking1 = {
      id: 'booking-1',
      trip: {
        originStopName: 'A',
        destinationStopName: 'B',
        departureTime: new Date(),
        arrivalTime: new Date(),
      },
    } as TripBooking;
    const mockTripBooking2 = {
      id: 'booking-2',
      trip: {
        originStopName: 'B',
        destinationStopName: 'C',
        departureTime: new Date(),
        arrivalTime: new Date(),
      },
    } as TripBooking;
    // Use the mock logic from repository create or define here if needed,
    // but the test expects service.create to return what we expect.
    // The previous test manually mocked create logic.
    // With current mockRepository.create implementation, it returns {...data, id: 'mock-id'}
    // We should make sure we respect that or override if strictly needed.

    it('should create an itinerary with trip bookings', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      tripBookingService.create
        .mockResolvedValueOnce(mockTripBooking1)
        .mockResolvedValueOnce(mockTripBooking2);

      tripBookingService.getTripDetails
        .mockReturnValueOnce({ orgStation: 'A', destStation: 'B' })
        .mockReturnValueOnce({ orgStation: 'B', destStation: 'C' });

      // Override the create mock implementation for this test to match what was there before
      // or adapt expectations. The previous mock returned `mockItinerary` object.
      // The new mock returns `{...data, id: 'mock-id'}`.
      // Let's stick to the new mock behavior which is more realistic (dynamic return based on input)
      // but we need to ensure the id matches what we expect or just expect any id.
      // The old test expected ID 'itinerary-1'. The new mock returns 'mock-id'.

      const result = await service.create(userId, createItineraryDto);

      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(tripBookingService.create).toHaveBeenCalledTimes(2);
      expect(tripBookingService.create).toHaveBeenCalledWith(
        userId,
        createItineraryDto.segments[0].gtfsTripId,
        createItineraryDto.segments[0].originStopTimeId,
        createItineraryDto.segments[0].destStopTimeId,
        1, // sequence
      );
      expect(tripBookingService.create).toHaveBeenCalledWith(
        userId,
        createItineraryDto.segments[1].gtfsTripId,
        createItineraryDto.segments[1].originStopTimeId,
        createItineraryDto.segments[1].destStopTimeId,
        2, // sequence
      );

      // Verification of EM usage instead of Repo usage inside the transaction
      expect(itineraryRepo.create).toHaveBeenCalledWith({
        user: mockUser,
        tripBookings: [mockTripBooking1, mockTripBooking2],
        wantsToSteward: createItineraryDto.wantsToSteward,
        status: ItineraryStatus.DRAFT,
      });

      // The service.create function calls `this.em.persistAndFlush(itinerary)`
      // In the old setup, `em` was mocked separately. In the new setup, `em` is also mocked.
      // The expected object passed to persistAndFlush depends on what repo.create returned.
      expect(em.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-id',
          user: mockUser,
          status: ItineraryStatus.DRAFT,
        }),
      );

      expect(result).toEqual({
        id: 'mock-id',
        trips: [
          { orgStation: 'A', destStation: 'B' },
          { orgStation: 'B', destStation: 'C' },
        ],
        stewarding: true,
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ItinerariesService } from './itineraries.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { Itinerary } from '../entities/itinerary.entity';
import { TripBooking } from '../entities/trip_booking.entity';
import { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { TripBookingService } from '../trip-booking/trip-booking.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItineraryStatus } from '../entities/itineraryStatusEnum';
import { vi, type Mock } from 'vitest';

describe('ItinerariesService', () => {
  let service: ItinerariesService;
  let itineraryRepo: {
    find: Mock;
    findOne: Mock;
    create: Mock;
  };
  let em: { persistAndFlush: Mock };
  let usersService: { findByAuthUserIdOrFail: Mock; findById: Mock };
  let tripBookingService: { create: Mock; getTripDetails: Mock };

  const mockRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    persist: vi.fn(),
    flush: vi.fn(),
  };

  const mockEm = {
    persistAndFlush: vi.fn(),
  };

  const mockUsersService = {
    findByAuthUserIdOrFail: vi.fn(),
    findById: vi.fn(),
  };

  const mockTripBookingService = {
    create: vi.fn(),
    getTripDetails: vi.fn(),
  };

  beforeEach(async () => {
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
    const mockItinerary = {
      id: 'itinerary-1',
      wantsToSteward: true,
    } as Itinerary;

    it('should create an itinerary with trip bookings', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockTripBookingService.create
        .mockResolvedValueOnce(mockTripBooking1)
        .mockResolvedValueOnce(mockTripBooking2);

      itineraryRepo.create.mockReturnValue(mockItinerary);

      mockTripBookingService.getTripDetails
        .mockReturnValueOnce({ orgStation: 'A', destStation: 'B' })
        .mockReturnValueOnce({ orgStation: 'B', destStation: 'C' });

      const result = await service.create(userId, createItineraryDto);

      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(tripBookingService.create).toHaveBeenCalledTimes(2);
      expect(tripBookingService.create).toHaveBeenCalledWith(
        userId,
        createItineraryDto.segments[0].gtfsTripId,
        createItineraryDto.segments[0].originStopTimeId,
        createItineraryDto.segments[0].destStopTimeId,
        0,
      );
      expect(tripBookingService.create).toHaveBeenCalledWith(
        userId,
        createItineraryDto.segments[1].gtfsTripId,
        createItineraryDto.segments[1].originStopTimeId,
        createItineraryDto.segments[1].destStopTimeId,
        1,
      );

      expect(itineraryRepo.create).toHaveBeenCalledWith({
        user: mockUser,
        tripBookings: [mockTripBooking1, mockTripBooking2],
        wantsToSteward: createItineraryDto.wantsToSteward,
        status: ItineraryStatus.DRAFT,
      });

      expect(em.persistAndFlush).toHaveBeenCalledWith(mockItinerary);

      expect(result).toEqual({
        id: mockItinerary.id,
        trips: [
          { orgStation: 'A', destStation: 'B' },
          { orgStation: 'B', destStation: 'C' },
        ],
        stewarding: true,
      });
    });
  });
});

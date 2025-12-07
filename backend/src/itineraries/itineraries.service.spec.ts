import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { Itinerary } from '../entities/itinerary.entity';
import { Trip } from '../entities/trip.entity';
import { TripBooking } from '../entities/trip_booking.entity';
import { GTFSTrip, GTFSStopTime, User } from '../entities';
import { ItineraryStatus } from '../entities/itineraryStatusEnum';
import { TripBookingStatus } from '../entities/tripBookingEnum';

describe('ItinerariesService', () => {
  let service: ItinerariesService;
  let mockItineraryRepository: {
    create: Mock;
    findOne: Mock;
  };
  let mockTripRepository: {
    create: Mock;
    findOne: Mock;
  };
  let mockTripBookingRepository: {
    create: Mock;
  };
  let mockGtfsTripRepository: {
    findOne: Mock;
  };
  let mockStopTimeRepository: {
    findOne: Mock;
  };
  let mockEntityManager: {
    persistAndFlush: Mock;
    refresh: Mock;
  };

  // Mock data
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    phoneNumber: '1234567890',
    authUserId: 'auth-123',
  } as User;

  const mockGtfsTrip = {
    id: 'gtfs-trip-uuid',
    trip_id: 'trip-001',
    serviceId: '20251121',
  };

  const mockOriginStopTime = {
    id: 'origin-stop-time-uuid',
    stopSequence: 1,
    departureTime: '08:00:00',
    arrivalTime: '08:00:00',
    stop: {
      id: 'origin-stop-uuid',
      stopId: 'KIT',
      stopName: 'Kitchener GO',
    },
  };

  const mockDestStopTime = {
    id: 'dest-stop-time-uuid',
    stopSequence: 10,
    departureTime: '10:00:00',
    arrivalTime: '10:00:00',
    stop: {
      id: 'dest-stop-uuid',
      stopId: 'UN',
      stopName: 'Union Station',
    },
  };

  const mockTrip = {
    id: 'trip-uuid',
    gtfsTrip: mockGtfsTrip,
    originStopTime: mockOriginStopTime,
    destinationStopTime: mockDestStopTime,
  };

  beforeEach(async () => {
    // Create mock repositories
    mockItineraryRepository = {
      create: vi.fn(),
      findOne: vi.fn(),
    };

    mockTripRepository = {
      create: vi.fn(),
      findOne: vi.fn(),
    };

    mockTripBookingRepository = {
      create: vi.fn(),
    };

    mockGtfsTripRepository = {
      findOne: vi.fn(),
    };

    mockStopTimeRepository = {
      findOne: vi.fn(),
    };

    mockEntityManager = {
      persistAndFlush: vi.fn(),
      refresh: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItinerariesService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: getRepositoryToken(Itinerary),
          useValue: mockItineraryRepository,
        },
        {
          provide: getRepositoryToken(Trip),
          useValue: mockTripRepository,
        },
        {
          provide: getRepositoryToken(TripBooking),
          useValue: mockTripBookingRepository,
        },
        {
          provide: getRepositoryToken(GTFSTrip),
          useValue: mockGtfsTripRepository,
        },
        {
          provide: getRepositoryToken(GTFSStopTime),
          useValue: mockStopTimeRepository,
        },
      ],
    }).compile();

    service = module.get<ItinerariesService>(ItinerariesService);

    // Reset mocks
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an itinerary with trip bookings for valid segments', async () => {
      // Setup mocks
      mockGtfsTripRepository.findOne.mockResolvedValue(mockGtfsTrip);
      mockStopTimeRepository.findOne
        .mockResolvedValueOnce(mockOriginStopTime) // origin
        .mockResolvedValueOnce(mockDestStopTime); // destination
      mockTripRepository.findOne.mockResolvedValue(null); // No existing trip
      mockTripRepository.create.mockReturnValue(mockTrip);

      const mockItinerary = {
        id: 'itinerary-uuid',
        status: ItineraryStatus.DRAFT,
        wantsToSteward: true,
        user: mockUser,
        tripBookings: {
          add: vi.fn(),
          getItems: vi.fn().mockReturnValue([
            {
              id: 'booking-uuid',
              sequence: 1,
              status: TripBookingStatus.PENDING,
              trip: mockTrip,
            },
          ]),
        },
        createdAt: new Date(),
      };
      mockItineraryRepository.create.mockReturnValue(mockItinerary);

      const mockTripBooking = {
        id: 'booking-uuid',
        sequence: 1,
        status: TripBookingStatus.PENDING,
        user: mockUser,
        itinerary: mockItinerary,
        trip: mockTrip,
      };
      mockTripBookingRepository.create.mockReturnValue(mockTripBooking);

      // Execute
      const result = await service.create(
        {
          segments: [
            {
              originStopId: 'KIT',
              destStopId: 'UN',
              gtfsTripId: 'trip-001',
            },
          ],
          wantsToSteward: true,
        },
        mockUser,
      );

      // Verify
      expect(mockGtfsTripRepository.findOne).toHaveBeenCalledWith({
        trip_id: 'trip-001',
      });
      expect(mockStopTimeRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockItineraryRepository.create).toHaveBeenCalledWith({
        status: ItineraryStatus.DRAFT,
        wantsToSteward: true,
        user: mockUser,
      });
      expect(mockTripBookingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sequence: 1,
          status: TripBookingStatus.PENDING,
          user: mockUser,
        }),
      );
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should reuse existing Trip entity when one exists', async () => {
      // Setup mocks
      mockGtfsTripRepository.findOne.mockResolvedValue(mockGtfsTrip);
      mockStopTimeRepository.findOne
        .mockResolvedValueOnce(mockOriginStopTime)
        .mockResolvedValueOnce(mockDestStopTime);
      mockTripRepository.findOne.mockResolvedValue(mockTrip); // Existing trip found

      const mockItinerary = {
        id: 'itinerary-uuid',
        status: ItineraryStatus.DRAFT,
        wantsToSteward: false,
        user: mockUser,
        tripBookings: {
          add: vi.fn(),
          getItems: vi.fn().mockReturnValue([]),
        },
        createdAt: new Date(),
      };
      mockItineraryRepository.create.mockReturnValue(mockItinerary);
      mockTripBookingRepository.create.mockReturnValue({});

      // Execute
      await service.create(
        {
          segments: [
            {
              originStopId: 'KIT',
              destStopId: 'UN',
              gtfsTripId: 'trip-001',
            },
          ],
          wantsToSteward: false,
        },
        mockUser,
      );

      // Verify trip was not created (reused existing)
      expect(mockTripRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when GTFS Trip not found', async () => {
      mockGtfsTripRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            segments: [
              {
                originStopId: 'KIT',
                destStopId: 'UN',
                gtfsTripId: 'invalid-trip',
              },
            ],
            wantsToSteward: false,
          },
          mockUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when origin stop not found on trip', async () => {
      mockGtfsTripRepository.findOne.mockResolvedValue(mockGtfsTrip);
      mockStopTimeRepository.findOne.mockResolvedValueOnce(null); // Origin not found

      await expect(
        service.create(
          {
            segments: [
              {
                originStopId: 'INVALID',
                destStopId: 'UN',
                gtfsTripId: 'trip-001',
              },
            ],
            wantsToSteward: false,
          },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when destination stop not found on trip', async () => {
      mockGtfsTripRepository.findOne.mockResolvedValue(mockGtfsTrip);
      mockStopTimeRepository.findOne
        .mockResolvedValueOnce(mockOriginStopTime)
        .mockResolvedValueOnce(null); // Destination not found

      await expect(
        service.create(
          {
            segments: [
              {
                originStopId: 'KIT',
                destStopId: 'INVALID',
                gtfsTripId: 'trip-001',
              },
            ],
            wantsToSteward: false,
          },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when origin comes after destination', async () => {
      const wrongOrderOrigin = { ...mockOriginStopTime, stopSequence: 10 };
      const wrongOrderDest = { ...mockDestStopTime, stopSequence: 1 };

      mockGtfsTripRepository.findOne.mockResolvedValue(mockGtfsTrip);
      mockStopTimeRepository.findOne
        .mockResolvedValueOnce(wrongOrderOrigin)
        .mockResolvedValueOnce(wrongOrderDest);

      await expect(
        service.create(
          {
            segments: [
              {
                originStopId: 'UN',
                destStopId: 'KIT',
                gtfsTripId: 'trip-001',
              },
            ],
            wantsToSteward: false,
          },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle multiple segments correctly', async () => {
      // Setup mocks for two segments (round trip)
      const mockGtfsTripOutbound = { ...mockGtfsTrip, trip_id: 'trip-001' };
      const mockGtfsTripReturn = {
        ...mockGtfsTrip,
        id: 'gtfs-trip-uuid-2',
        trip_id: 'trip-002',
      };

      mockGtfsTripRepository.findOne
        .mockResolvedValueOnce(mockGtfsTripOutbound)
        .mockResolvedValueOnce(mockGtfsTripReturn);

      mockStopTimeRepository.findOne
        // Outbound segment
        .mockResolvedValueOnce(mockOriginStopTime)
        .mockResolvedValueOnce(mockDestStopTime)
        // Return segment (swapped stops)
        .mockResolvedValueOnce({ ...mockDestStopTime, stopSequence: 1 })
        .mockResolvedValueOnce({ ...mockOriginStopTime, stopSequence: 10 });

      mockTripRepository.findOne.mockResolvedValue(null); // No existing trips

      const mockOutboundTrip = { ...mockTrip, id: 'outbound-trip' };
      const mockReturnTrip = { ...mockTrip, id: 'return-trip' };
      mockTripRepository.create
        .mockReturnValueOnce(mockOutboundTrip)
        .mockReturnValueOnce(mockReturnTrip);

      const mockItinerary = {
        id: 'itinerary-uuid',
        status: ItineraryStatus.DRAFT,
        wantsToSteward: true,
        user: mockUser,
        tripBookings: {
          add: vi.fn(),
          getItems: vi.fn().mockReturnValue([]),
        },
        createdAt: new Date(),
      };
      mockItineraryRepository.create.mockReturnValue(mockItinerary);

      let bookingSequence = 0;
      mockTripBookingRepository.create.mockImplementation(() => ({
        id: `booking-${++bookingSequence}`,
        sequence: bookingSequence,
      }));

      // Execute
      await service.create(
        {
          segments: [
            { originStopId: 'KIT', destStopId: 'UN', gtfsTripId: 'trip-001' },
            { originStopId: 'UN', destStopId: 'KIT', gtfsTripId: 'trip-002' },
          ],
          wantsToSteward: true,
        },
        mockUser,
      );

      // Verify two trips were created
      expect(mockTripRepository.create).toHaveBeenCalledTimes(2);

      // Verify two bookings were created with correct sequences
      expect(mockTripBookingRepository.create).toHaveBeenCalledTimes(2);
      expect(mockTripBookingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ sequence: 1 }),
      );
      expect(mockTripBookingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ sequence: 2 }),
      );
    });
  });

  describe('formatItineraryResponse', () => {
    it('should format itinerary response correctly', () => {
      const mockItinerary = {
        id: 'itinerary-uuid',
        status: ItineraryStatus.DRAFT,
        wantsToSteward: true,
        createdAt: new Date('2025-01-01'),
        tripBookings: {
          getItems: vi.fn().mockReturnValue([
            {
              id: 'booking-uuid',
              sequence: 1,
              status: TripBookingStatus.PENDING,
              trip: {
                id: 'trip-uuid',
                originStopTime: {
                  id: 'origin-st-uuid',
                  departureTime: '08:00:00',
                  stop: {
                    stopId: 'KIT',
                    stopName: 'Kitchener GO',
                  },
                },
                destinationStopTime: {
                  id: 'dest-st-uuid',
                  arrivalTime: '10:00:00',
                  stop: {
                    stopId: 'UN',
                    stopName: 'Union Station',
                  },
                },
              },
            },
          ]),
        },
      } as unknown as Itinerary;

      const result = service.formatItineraryResponse(mockItinerary);

      expect(result).toEqual({
        id: 'itinerary-uuid',
        status: ItineraryStatus.DRAFT,
        wantsToSteward: true,
        createdAt: new Date('2025-01-01'),
        tripBookings: [
          {
            id: 'booking-uuid',
            sequence: 1,
            status: TripBookingStatus.PENDING,
            trip: {
              id: 'trip-uuid',
              originStopTime: {
                id: 'origin-st-uuid',
                departureTime: '08:00:00',
                stop: {
                  stopId: 'KIT',
                  stopName: 'Kitchener GO',
                },
              },
              destinationStopTime: {
                id: 'dest-st-uuid',
                arrivalTime: '10:00:00',
                stop: {
                  stopId: 'UN',
                  stopName: 'Union Station',
                },
              },
            },
          },
        ],
      });
    });
  });
});

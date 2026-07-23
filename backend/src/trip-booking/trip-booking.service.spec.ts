import { Test, TestingModule } from '@nestjs/testing';
import { TripBookingService } from './trip-booking.service';
import { TripBooking } from '../entities';
import { UsersService } from '../users/users.service';
import { TripService } from '../trip/trip.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('TripBookingService', () => {
  let service: TripBookingService;

  const mockTripBookingRepo = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
    persistAndFlush: vi.fn(),
    getEntityManager: vi.fn().mockReturnValue({
      persistAndFlush: vi.fn(),
    }),
  };

  const mockUsersService = {
    findById: vi.fn(),
  };

  const mockTripService = {
    findOrCreate: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripBookingService,
        {
          provide: getRepositoryToken(TripBooking),
          useValue: mockTripBookingRepo,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: TripService,
          useValue: mockTripService,
        },
      ],
    }).compile();

    service = module.get<TripBookingService>(TripBookingService);
  });

  describe('create', () => {
    it('should return existing booking if found', async () => {
      const existingBooking = { id: 'booking-123' };
      mockTripBookingRepo.findOne.mockResolvedValue(existingBooking);
      mockUsersService.findById.mockResolvedValue({ id: 'user-123' });
      mockTripService.findOrCreate.mockResolvedValue({ id: 'trip-123' });

      const result = await service.findOrCreate(
        'user-123',
        'gtfs-trip-id',
        'origin-id',
        'dest-id',
      );

      expect(result).toBe(existingBooking);
      expect(mockTripBookingRepo.findOne).toHaveBeenCalled();
      expect(mockTripBookingRepo.upsert).not.toHaveBeenCalled();
    });

    it('should upsert booking if not found using onConflict: ignore', async () => {
      mockTripBookingRepo.findOne.mockResolvedValue(null);
      const user = { id: 'user-123' };
      const trip = { id: 'trip-123' };
      mockUsersService.findById.mockResolvedValue(user);
      mockTripService.findOrCreate.mockResolvedValue(trip);

      const upsertedBooking = { id: 'new-booking' };
      mockTripBookingRepo.upsert.mockResolvedValue(upsertedBooking);

      const result = await service.findOrCreate(
        'user-123',
        'gtfs-trip-id',
        'origin-id',
        'dest-id',
      );

      expect(result).toBe(upsertedBooking);
      expect(mockTripBookingRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user,
          trip,
          sequence: undefined,
          createdAt: expect.any(Date) as unknown as Date,
          updatedAt: expect.any(Date) as unknown as Date,
        }),
        {
          onConflictAction: 'ignore',
          onConflictFields: ['user', 'trip'],
          onConflictExcludeFields: ['id', 'createdAt', 'status'],
        },
      );
    });
  });
  describe('getTripDetails', () => {
    it('should return trip details using direct properties on Trip entity', () => {
      const tripBooking = {
        trip: {
          originStopName: 'Origin',
          destinationStopName: 'Dest',
          departureTime: new Date(),
          arrivalTime: new Date(),
          routeShortName: 'LW',
          id: 'trip-123',
          // Simulate missing deep relations which caused the crash
          originStopTime: undefined,
        },
      } as unknown as TripBooking;

      const result = service.getTripDetails(tripBooking);

      expect(result).toEqual({
        orgStation: 'Origin',
        destStation: 'Dest',
        departureTime: tripBooking.trip.departureTime,
        arrivalTime: tripBooking.trip.arrivalTime,
        routeShortName: 'LW',
        tripId: 'trip-123',
      });
    });
  });
});

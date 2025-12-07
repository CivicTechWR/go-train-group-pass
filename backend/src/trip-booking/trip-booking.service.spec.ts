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
    persistAndFlush: vi.fn(),
    getEntityManager: vi.fn().mockReturnValue({
      persistAndFlush: vi.fn(),
    }),
  };

  const mockUsersService = {
    findById: vi.fn(),
  };

  const mockTripService = {
    findOrCreateTrip: vi.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

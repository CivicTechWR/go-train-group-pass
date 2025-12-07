import { Test, TestingModule } from '@nestjs/testing';
import { ItinerariesService } from './itineraries.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { Itinerary } from '../entities/itinerary.entity';
import { Trip } from '../entities/trip.entity';
import { TripBooking } from '../entities/trip_booking.entity';
import { GTFSTrip } from '../entities/gtfs_trip.entity';
import { GTFSStopTime } from '../entities/gtfs_stop_times.entity';
import { User } from '../entities/user.entity';
import { vi } from 'vitest';

describe('ItinerariesService', () => {
  let service: ItinerariesService;

  const mockRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    persist: vi.fn(),
    flush: vi.fn(),
  };

  const mockEm = {
    transactional: vi.fn((cb) => cb(mockEm)),
    persist: vi.fn(),
    getReference: vi.fn(),
    flush: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItinerariesService,
        { provide: getRepositoryToken(Itinerary), useValue: mockRepository },
        { provide: getRepositoryToken(Trip), useValue: mockRepository },
        { provide: getRepositoryToken(TripBooking), useValue: mockRepository },
        { provide: getRepositoryToken(GTFSTrip), useValue: mockRepository },
        { provide: getRepositoryToken(GTFSStopTime), useValue: mockRepository },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    service = module.get<ItinerariesService>(ItinerariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

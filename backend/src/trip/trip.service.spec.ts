import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { GTFSStopTime, GTFSTrip, Trip } from '../entities';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('TripService', () => {
  let service: TripService;

  const mockRepository = {
    findOne: vi.fn(),
    findOneOrFail: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
    getEntityManager: vi.fn().mockReturnValue({
      persistAndFlush: vi.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: getRepositoryToken(GTFSTrip),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Trip),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(GTFSStopTime),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TripService>(TripService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreate', () => {
    it('should return existing trip if found', async () => {
      const existingTrip = { id: 'trip-123' };
      mockRepository.findOne.mockResolvedValue(existingTrip);

      const result = await service.findOrCreate(
        'gtfs-trip-id',
        'origin-id',
        'dest-id',
      );

      expect(result).toBe(existingTrip);
      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.upsert).not.toHaveBeenCalled();
    });

    it('should upsert trip if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const gtfsTrip = {
        id: 'gtfs-trip-id',
        serviceId: '20231225',
        route: { routeShortName: 'LW', routeLongName: 'Lakeshore West' },
      };
      const originStopTime = {
        id: 'origin-id',
        departureTime: '12:00:00',
        stop: { stopName: 'Origin' },
        trip: { id: 'gtfs-trip-id' },
      };
      const destStopTime = {
        id: 'dest-id',
        arrivalTime: '13:00:00',
        stop: { stopName: 'Dest' },
        trip: { id: 'gtfs-trip-id' },
      };

      mockRepository.findOneOrFail.mockImplementation(
        (idOrQuery: string | { id: string }) => {
          if (idOrQuery === 'gtfs-trip-id') return Promise.resolve(gtfsTrip);
          if (typeof idOrQuery !== 'string' && idOrQuery.id === 'origin-id')
            return Promise.resolve(originStopTime);
          if (typeof idOrQuery !== 'string' && idOrQuery.id === 'dest-id')
            return Promise.resolve(destStopTime);
          return Promise.reject(new Error('Not found'));
        },
      );

      const upsertedTrip = { id: 'new-trip-id' };
      mockRepository.upsert.mockResolvedValue(upsertedTrip);

      const result = await service.findOrCreate(
        'gtfs-trip-id',
        'origin-id',
        'dest-id',
      );

      expect(result).toBe(upsertedTrip);
      expect(mockRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          gtfsTrip: gtfsTrip,
          createdAt: expect.any(Date) as unknown as Date,
          updatedAt: expect.any(Date) as unknown as Date,
        }),
        {
          onConflictFields: [
            'gtfsTrip',
            'originStopTime',
            'destinationStopTime',
            'date',
          ],
          onConflictExcludeFields: ['id', 'createdAt'],
        },
      );
    });
  });
});

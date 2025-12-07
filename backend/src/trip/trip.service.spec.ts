import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { GTFSStopTime, GTFSTrip, Trip } from '../entities';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GTFSTimeString } from 'src/utils/isGTFSTimeString';

describe('TripService', () => {
  let service: TripService;

  const mockRepository = {
    findOne: vi.fn(),
    findOneOrFail: vi.fn(),
    create: vi.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('combineDateAndTime', () => {
    it('should correctly combine date and time in Toronto timezone (EST)', () => {
      // 2023-12-25 is in EST (UTC-5)
      const date = new Date(2023, 11, 25); // Dec 25, 2023
      const time = '12:00:00';
      const result = service.combineDateAndTime(date, time as GTFSTimeString);

      // 12:00 Toronto = 17:00 UTC
      expect(result.toISOString()).toBe('2023-12-25T17:00:00.000Z');
    });

    it('should correctly handle time > 24 hours', () => {
      // 2023-12-25
      const date = new Date(2023, 11, 25);
      const time = '25:30:00'; // 1:30 AM next day
      const result = service.combineDateAndTime(date, time as GTFSTimeString);

      // Dec 26 01:30 Toronto = Dec 26 06:30 UTC
      expect(result.toISOString()).toBe('2023-12-26T06:30:00.000Z');
    });

    it('should correctly combine date and time in Toronto timezone (EDT)', () => {
      // 2023-07-01 is in EDT (UTC-4)
      const date = new Date(2023, 6, 1); // July 1, 2023
      const time = '12:00:00';
      const result = service.combineDateAndTime(date, time as GTFSTimeString);

      // 12:00 Toronto (EDT) = 16:00 UTC
      expect(result.toISOString()).toBe('2023-07-01T16:00:00.000Z');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TripScheduleService } from './trip-schedule.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { TripSchedule } from '../entities/trip_schedule_entity';
import { BadRequestException } from '@nestjs/common';

describe('TripScheduleService', () => {
  let service: TripScheduleService;

  const mockTripScheduleRepo = {
    find: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripScheduleService,
        {
          provide: getRepositoryToken(TripSchedule),
          useValue: mockTripScheduleRepo,
        },
      ],
    }).compile();

    service = module.get<TripScheduleService>(TripScheduleService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTripSchedule', () => {
    const day = new Date('2023-10-27T10:00:00Z'); // Friday

    it('should throw BadRequestException if origin station is not supported', async () => {
      await expect(
        service.getTripSchedule('Invalid Station', 'Union Station GO', day),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if destination station is not supported', async () => {
      await expect(
        service.getTripSchedule('Kitchener GO', 'Invalid Station', day),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return trip details when stations are valid', async () => {
      const mockTrips = [
        {
          tripId: '1',
          startStopName: 'Kitchener GO',
          endStopName: 'Union Station GO',
          departureTime: '10:00:00',
          arrivalTime: '11:00:00',
          startStopTimeId: 'start-id',
          endStopTimeId: 'end-id',
        },
      ];
      mockTripScheduleRepo.find.mockResolvedValue(mockTrips);

      const result = await service.getTripSchedule(
        'Kitchener GO',
        'Union Station GO',
        day,
      );

      expect(mockTripScheduleRepo.find).toHaveBeenCalledWith({
        startStopName: 'Kitchener GO',
        endStopName: 'Union Station GO',
        serviceId: '20231027', // Based on the date provided
      });
      expect(result).toHaveLength(1);
      expect(result[0].orgStation).toBe('Kitchener GO');
      expect(result[0].destStation).toBe('Union Station GO');
      expect(result[0].tripCreationMetaData.tripId).toBe('1');
    });
  });

  describe('getKIToUnionRoundTripSchedule', () => {
    it('should return round trip schedules', async () => {
      const day = new Date('2023-10-27T10:00:00Z');

      const departureTripsMock = [
        {
          tripId: 'dep-1',
          startStopName: 'Kitchener GO',
          endStopName: 'Union Station GO',
          departureTime: new Date('2023-10-27T08:00:00Z'),
          arrivalTime: new Date('2023-10-27T09:00:00Z'),
          startStopTimeId: 's1',
          endStopTimeId: 'e1',
          orgStation: 'Kitchener GO',
          destStation: 'Union Station GO',
          tripCreationMetaData: {
            tripId: 'dep-1',
            departureStopTimeId: 's1',
            arrivalStopTimeId: 'e1',
          },
        },
      ];
      const returnTripsMock = [
        {
          tripId: 'ret-1',
          startStopName: 'Union Station GO',
          endStopName: 'Kitchener GO',
          departureTime: new Date('2023-10-27T17:00:00Z'),
          arrivalTime: new Date('2023-10-27T18:00:00Z'),
          startStopTimeId: 's2',
          endStopTimeId: 'e2',
          orgStation: 'Union Station GO',
          destStation: 'Kitchener GO',
          tripCreationMetaData: {
            tripId: 'ret-1',
            departureStopTimeId: 's2',
            arrivalStopTimeId: 'e2',
          },
        },
      ];

      const getTripScheduleSpy = vi
        .spyOn(service, 'getTripSchedule')
        .mockResolvedValueOnce(departureTripsMock)
        .mockResolvedValueOnce(returnTripsMock);

      const result = await service.getKIToUnionRoundTripSchedule(day);

      expect(getTripScheduleSpy).toHaveBeenNthCalledWith(
        1,
        'Kitchener GO',
        'Union Station GO',
        day,
      );
      expect(getTripScheduleSpy).toHaveBeenNthCalledWith(
        2,
        'Union Station GO',
        'Kitchener GO',
        day,
      );

      expect(result.departureTrips).toEqual(departureTripsMock);
      expect(result.returnTrips).toEqual(returnTripsMock);
    });
  });
});

import { TripScheduleDetailsDto } from '@go-train-group-pass/shared';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodValidationPipe } from 'nestjs-zod';
import { TripScheduleController } from './trip-schedule.controller';
import { TripScheduleService } from './trip-schedule.service';

describe('TripScheduleController (Integration)', () => {
  let app: NestFastifyApplication;

  const mockTripScheduleService = {
    getTripSchedule: vi.fn(),
    getKIToUnionRoundTripSchedule: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripScheduleController],
      providers: [
        {
          provide: TripScheduleService,
          useValue: mockTripScheduleService,
        },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    // Apply the same pipe as in AppModule to ensure validation logic is tested
    app.useGlobalPipes(new ZodValidationPipe());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('GET /trip-schedule/search', () => {
    it('should return 200 and call service with correct params when input is valid', async () => {
      const mockResult = [
        {
          orgStation: 'Kitchener GO',
          destStation: 'Union Station GO',
          departureTime: new Date('2025-12-09T08:00:00Z'),
          arrivalTime: new Date('2025-12-09T09:30:00Z'),
          tripCreationMetaData: {
            tripId: '1',
            arrivalStopTimeId: '2',
            departureStopTimeId: '3',
          },
        },
      ];
      mockTripScheduleService.getTripSchedule.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'GET',
        url: '/trip-schedule/search',
        query: {
          orgStation: 'Kitchener GO',
          destStation: 'Union Station GO',
          date: '2025-12-09',
        },
      });

      expect(response.statusCode).toBe(200);
      // Verify serialization if needed, or just that it matches expected structure
      const payload = JSON.parse(response.payload) as TripScheduleDetailsDto[];
      expect(payload).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            orgStation: 'Kitchener GO',
          }),
        ]),
      );

      expect(mockTripScheduleService.getTripSchedule).toHaveBeenCalledWith(
        'Kitchener GO',
        'Union Station GO',
        new Date('2025-12-09'),
      );
    });

    it('should return 400 Bad Request when date is invalid', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/trip-schedule/search',
        query: {
          orgStation: 'Kitchener GO',
          destStation: 'Union Station GO',
          date: 'not-a-date',
        },
      });

      expect(response.statusCode).toBe(400);
      // Ensure service was NOT called
      expect(mockTripScheduleService.getTripSchedule).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request when missing required params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/trip-schedule/search',
        query: {
          orgStation: 'Kitchener GO',
          // destStation is missing
          date: '2025-12-09',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /trip-schedule/search/round-trip-kitchener-union', () => {
    it('should return 200 and call service', async () => {
      const mockResult = {
        departureTrips: [],
        returnTrips: [],
      };
      mockTripScheduleService.getKIToUnionRoundTripSchedule.mockResolvedValue(
        mockResult,
      );

      const response = await app.inject({
        method: 'GET',
        url: '/trip-schedule/search/round-trip-kitchener-union',
        query: {
          date: '2025-12-09',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(
        mockTripScheduleService.getKIToUnionRoundTripSchedule,
      ).toHaveBeenCalledWith(new Date('2025-12-09'));
    });
  });
});

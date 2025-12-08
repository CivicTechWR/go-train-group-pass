import { Test, TestingModule } from '@nestjs/testing';
import { TripScheduleService } from './trip-schedule.service';

describe('TripScheduleService', () => {
  let service: TripScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TripScheduleService],
    }).compile();

    service = module.get<TripScheduleService>(TripScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TripScheduleController } from './trip-schedule.controller';

describe('TripScheduleController', () => {
  let controller: TripScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripScheduleController],
    }).compile();

    controller = module.get<TripScheduleController>(TripScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

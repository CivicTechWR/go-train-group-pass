import { Test, TestingModule } from '@nestjs/testing';
import { TripBookingController } from './trip-booking.controller';

describe('TripBookingController', () => {
  let controller: TripBookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripBookingController],
    }).compile();

    controller = module.get<TripBookingController>(TripBookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

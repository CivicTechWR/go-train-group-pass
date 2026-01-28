import { Test, TestingModule } from '@nestjs/testing';
import { TripBookingController } from './trip-booking.controller';
import { TripBookingService } from './trip-booking.service';
import { vi as jest } from 'vitest';

describe('TripBookingController', () => {
  let controller: TripBookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripBookingController],
      controllers: [TripBookingController],
      providers: [
        {
          provide: TripBookingService,
          useValue: {
            checkIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TripBookingController>(TripBookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

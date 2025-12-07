import { Test, TestingModule } from '@nestjs/testing';
import { TripBookingService } from './trip-booking.service';

describe('TripBookingService', () => {
  let service: TripBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TripBookingService],
    }).compile();

    service = module.get<TripBookingService>(TripBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

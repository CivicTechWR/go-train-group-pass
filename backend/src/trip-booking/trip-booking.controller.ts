import { Body, Controller, Post } from '@nestjs/common';
import { TripBookingService } from './trip-booking.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Trip Booking')
@Controller('trip-booking')
export class TripBookingController {
  constructor(private readonly tripBookingService: TripBookingService) {}

  @Post('check-in')
  @ApiResponse({
    status: 201,
    description: 'Trip booking checked in successfully',
  })
  async checkIn(@Body('id') id: string): Promise<void> {
    await this.tripBookingService.checkIn(id);
  }
}

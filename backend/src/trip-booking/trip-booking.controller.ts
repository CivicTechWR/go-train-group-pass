import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { TripBookingService } from './trip-booking.service';
import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../modules/auth/auth.guard';
import type { RequestWithUser } from '../modules/auth/auth.guard';

@ApiTags('Trip Booking')
@Controller('trip-booking')
export class TripBookingController {
  constructor(private readonly tripBookingService: TripBookingService) {}

  @Post('check-in')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Trip booking checked in successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - you do not own this trip booking',
  })
  async checkIn(
    @Body('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    if (!req.user) {
      throw new Error('User not found in request');
    }
    await this.tripBookingService.checkIn(id, req.user.id);
  }
}

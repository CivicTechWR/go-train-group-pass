import { Module } from '@nestjs/common';
import { TripBookingService } from './trip-booking.service';
import { TripService } from 'src/trip/trip.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TripBooking, User } from 'src/entities';
import { TripModule } from 'src/trip/trip.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([TripBooking, User]),
    TripModule
  ],
  providers: [TripBookingService],
  exports: [TripBookingService],
})
export class TripBookingModule { }

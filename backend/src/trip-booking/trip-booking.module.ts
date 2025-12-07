import { Module } from '@nestjs/common';
import { TripBookingService } from './trip-booking.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GTFSTrip, TripBooking } from '../entities';
import { TripModule } from '../trip/trip.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([TripBooking, GTFSTrip]),
    TripModule,
    UsersModule,
  ],
  providers: [TripBookingService],
  exports: [TripBookingService],
})
export class TripBookingModule {}

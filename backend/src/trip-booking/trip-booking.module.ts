import { Module } from '@nestjs/common';
import { TripBookingService } from './trip-booking.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GTFSTrip, TripBooking } from '../entities';
import { TripModule } from '../trip/trip.module';
import { UsersModule } from '../users/users.module';
import { TripBookingController } from './trip-booking.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([TripBooking, GTFSTrip]),
    TripModule,
    UsersModule,
  ],
  providers: [TripBookingService],
  exports: [TripBookingService],
  controllers: [TripBookingController],
})
export class TripBookingModule {}

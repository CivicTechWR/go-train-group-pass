import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ItinerariesController } from './itineraries.controller';
import { ItinerariesService } from './itineraries.service';
import { AuthModule } from '../modules/auth/auth.module';
import { Itinerary } from '../entities/itinerary.entity';
import { Trip } from '../entities/trip.entity';
import { TripBooking } from '../entities/trip_booking.entity';
import { GTFSTrip, GTFSStopTime } from '../entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Itinerary,
      Trip,
      TripBooking,
      GTFSTrip,
      GTFSStopTime,
    ]),
    AuthModule,
  ],
  controllers: [ItinerariesController],
  providers: [ItinerariesService],
  exports: [ItinerariesService],
})
export class ItinerariesModule {}

import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ItinerariesController } from './itineraries.controller';
import { ItinerariesService } from './itineraries.service';
import { Itinerary } from '../entities/itinerary.entity';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { TripBookingModule } from 'src/trip-booking/trip-booking.module';
import { AggregatedItinerary } from 'src/entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([Itinerary, AggregatedItinerary]),
    UsersModule,
    AuthModule,
    TripBookingModule,
  ],
  controllers: [ItinerariesController],
  providers: [ItinerariesService],
})
export class ItinerariesModule {}

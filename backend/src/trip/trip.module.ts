import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { GTFSStopTime, GTFSTrip, Trip } from 'src/entities';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([GTFSTrip, Trip, GTFSStopTime])],
  providers: [TripService],
  exports: [TripService],
})
export class TripModule {}

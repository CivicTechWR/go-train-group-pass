import { Module } from '@nestjs/common';
import { TripScheduleController } from './trip-schedule.controller';
import { TripScheduleService } from './trip-schedule.service';
import { TripSchedule } from 'src/entities/trip_schedule_entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([TripSchedule])],
  controllers: [TripScheduleController],
  providers: [TripScheduleService],
})
export class TripScheduleModule {}

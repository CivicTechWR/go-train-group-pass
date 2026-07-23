import { Module } from '@nestjs/common';
import { TripScheduleController } from './trip-schedule.controller';
import { TripScheduleService } from './trip-schedule.service';
import { TripSchedule } from 'src/entities/trip_schedule_entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [MikroOrmModule.forFeature([TripSchedule]), AuthModule],
  controllers: [TripScheduleController],
  providers: [TripScheduleService],
})
export class TripScheduleModule {}

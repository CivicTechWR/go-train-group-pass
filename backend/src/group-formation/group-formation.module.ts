import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { GroupFormationService } from './group-formation.service';
import { GroupFormationController } from './group-formation.controller';
import { GroupFormationScheduler } from './group-formation.scheduler';
import { Trip, TripBooking, TravelGroup, Itinerary, User } from '../entities';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    MikroOrmModule.forFeature([
      Trip,
      TripBooking,
      TravelGroup,
      Itinerary,
      User,
    ]),
    AuthModule,
  ],
  controllers: [GroupFormationController],
  providers: [GroupFormationService, GroupFormationScheduler],
  exports: [GroupFormationService],
})
export class GroupFormationModule {}

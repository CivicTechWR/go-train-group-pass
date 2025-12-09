import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GroupFormationService } from './group-formation.service';
import { GroupFormationController } from './group-formation.controller';
import { GroupFormationScheduler } from './group-formation.scheduler';
import { Trip, TripBooking, TravelGroup, Itinerary, User } from '../entities';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MikroOrmModule.forFeature([
      Trip,
      TripBooking,
      TravelGroup,
      Itinerary,
      User,
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [GroupFormationController],
  providers: [GroupFormationService, GroupFormationScheduler],
  exports: [GroupFormationService, GroupFormationScheduler],
})
export class GroupFormationModule {}

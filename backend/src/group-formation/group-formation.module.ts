import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GroupFormationService } from './group-formation.service';
import { GroupFormationController } from './group-formation.controller';
import { Trip, TripBooking, TravelGroup, Itinerary, User } from '../entities';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
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
  providers: [GroupFormationService],
  exports: [GroupFormationService],
})
export class GroupFormationModule {}

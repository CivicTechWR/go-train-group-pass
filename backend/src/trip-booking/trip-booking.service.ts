import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TripBooking, User } from 'src/entities';
import { TripService } from 'src/trip/trip.service';
import { UserRepository } from 'src/users/users.repository';
import { CreateTripBookingDto } from './dto/createTripBookingDto';
import { TripBookingStatus } from 'src/entities/tripBookingEnum';

@Injectable()
export class TripBookingService {
  constructor(
    @InjectRepository(TripBooking)
    private readonly tripBookingRepo: EntityRepository<TripBooking>,
    @InjectRepository(User)
    private readonly userRepo: UserRepository,
    private readonly tripService: TripService,
  ) { }
  async create(
    userId: string,
    gtfsTripId: string,
    originStopId: string,
    destStopId: string,
    sequence?: number,
  ): Promise<TripBooking> {
    const user = await this.userRepo.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const trip = await this.tripService.findOrCreateTrip(
      gtfsTripId,
      originStopId,
      destStopId,
    );
    const existingTripBooking = await this.tripBookingRepo.findOne({
      user,
      trip,
      status: TripBookingStatus.PENDING,
      sequence,
    });
    if (existingTripBooking) {
      return existingTripBooking;
    }
    const tripBooking = this.tripBookingRepo.create({
      user,
      trip,
      status: TripBookingStatus.PENDING,
      sequence,
    });
    await this.tripBookingRepo.getEntityManager().persistAndFlush(tripBooking);
    return tripBooking;
  }
}

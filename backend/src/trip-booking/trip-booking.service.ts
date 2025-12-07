import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TripBooking } from '../entities';
import { TripService } from '../trip/trip.service';
import { TripBookingStatus } from '../entities/tripBookingEnum';
import { TripDetailsDto } from '@go-train-group-pass/shared';
import { UsersService } from '../users/users.service';
@Injectable()
export class TripBookingService {
  constructor(
    @InjectRepository(TripBooking)
    private readonly tripBookingRepo: EntityRepository<TripBooking>,
    private readonly userService: UsersService,
    private readonly tripService: TripService,
  ) {}
  async create(
    userId: string,
    gtfsTripId: string,
    originStopTimeId: string,
    destStopTimeId: string,
    sequence?: number,
  ): Promise<TripBooking> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const trip = await this.tripService.findOrCreateTrip(
      gtfsTripId,
      originStopTimeId,
      destStopTimeId,
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

  getTripDetails(tripBooking: TripBooking): TripDetailsDto {
    return {
      orgStation: tripBooking.trip.originStopName,
      destStation: tripBooking.trip.destinationStopName,
      departureTime: tripBooking.trip.departureTime,
      arrivalTime: tripBooking.trip.arrivalTime,
    };
  }
}

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
  ) { }

  async checkIn(id: string) {
    const tripBooking = await this.tripBookingRepo.findOneOrFail({ id });
    tripBooking.status = TripBookingStatus.CHECKED_IN;
    await this.tripBookingRepo.getEntityManager().flush();
  }

  async findOrCreate(
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
    const trip = await this.tripService.findOrCreate(
      gtfsTripId,
      originStopTimeId,
      destStopTimeId,
    );

    // Optimization: check existence first
    const existingTripBooking = await this.tripBookingRepo.findOne(
      {
        user,
        trip,
        sequence,
      },
      {
        populate: ['*'],
      },
    );
    if (existingTripBooking) {
      return existingTripBooking;
    }

    // Use upsert to safe-guard against race conditions
    // strictly use onConflictAction: 'ignore' so we don't reset the status of an existing booking
    // e.g. if status is CONFIRMED, we don't want to set it back to PENDING by accident
    return await this.tripBookingRepo.upsert(
      {
        user,
        trip,
        status: TripBookingStatus.PENDING,
        sequence,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        onConflictAction: 'ignore',
        onConflictFields: ['user', 'trip'],
        onConflictExcludeFields: ['id', 'createdAt', 'status'],
      },
    );
  }

  getTripDetails(tripBooking: TripBooking): TripDetailsDto {
    return {
      orgStation: tripBooking.trip.originStopName,
      destStation: tripBooking.trip.destinationStopName,
      departureTime: tripBooking.trip.departureTime,
      arrivalTime: tripBooking.trip.arrivalTime,
      routeShortName: tripBooking.trip.routeShortName,
      tripId: tripBooking.trip.id,
      sequence: tripBooking.sequence ?? undefined,
      bookingId: tripBooking.id,
      isCheckedIn: tripBooking.status === TripBookingStatus.CHECKED_IN,
    };

  }
}

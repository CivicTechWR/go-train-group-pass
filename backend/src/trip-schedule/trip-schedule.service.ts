import {
  RoundTripDto,
  TripScheduleDetailsDto,
} from '@go-train-group-pass/shared';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TripSchedule } from 'src/entities/trip_schedule_entity';
import { getDateTimeFromServiceIdGTFSTimeString } from 'src/utils/getDateTimeFromServiceIdGTFSTimeString';

@Injectable()
export class TripScheduleService {
  constructor(
    @InjectRepository(TripSchedule)
    private readonly tripScheduleRepo: EntityRepository<TripSchedule>,
  ) {}
  public async getKIToUnionRoundTripSchedule(
    dateString: string,
  ): Promise<RoundTripDto> {
    const departureTrips = await this.getTripSchedule(
      'Kitchener GO',
      'Union Station GO',
      dateString,
    );
    const returnTrips = await this.getTripSchedule(
      'Union Station GO',
      'Kitchener GO',
      dateString,
    );
    return {
      departureTrips,
      returnTrips,
    };
  }
  public async getTripSchedule(
    orgStation: string,
    destStation: string,
    dateString: string,
  ): Promise<TripScheduleDetailsDto[]> {
    // Extract serviceId directly from ISO date string (YYYY-MM-DD)
    // This avoids timezone-related issues with Date object methods
    const serviceId = dateString.replace(/-/g, '');
    const trips = await this.tripScheduleRepo.find({
      startStopName: orgStation,
      endStopName: destStation,
      serviceId,
    });

    return trips.map((trip) => ({
      orgStation,
      destStation,
      departureTime: getDateTimeFromServiceIdGTFSTimeString(
        serviceId,
        trip.departureTime,
      ),
      arrivalTime: getDateTimeFromServiceIdGTFSTimeString(
        serviceId,
        trip.arrivalTime,
      ),
      tripCreationMetaData: {
        tripId: trip.tripId,
        departureStopTimeId: trip.startStopTimeId,
        arrivalStopTimeId: trip.endStopTimeId,
      },
    }));
  }
}

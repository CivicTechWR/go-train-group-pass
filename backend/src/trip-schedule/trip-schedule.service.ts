import { TripScheduleDetailsDto } from '@go-train-group-pass/shared';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { TripSchedule } from 'src/entities/trip_schedule_entity';
import { getDateTimeFromServiceIdGTFSTimeString } from 'src/utils/getDateTimeFromServiceIdGTFSTimeString';

@Injectable()
export class TripScheduleService {
  constructor(
    @InjectRepository(TripSchedule)
    private readonly tripScheduleRepo: EntityRepository<TripSchedule>,
  ) {}
  async getTripSchedule(
    orgStation: string,
    destStation: string,
    day: Date,
  ): Promise<TripScheduleDetailsDto[]> {
    const supportedTrips = ['Kitchener GO', 'Union Station GO'];
    if (!supportedTrips.includes(orgStation)) {
      throw new Error('Org station not supported');
    }
    if (!supportedTrips.includes(destStation)) {
      throw new Error('Destination station not supported');
    }
    // convert date to service id
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day.getDate()).padStart(2, '0');
    const serviceId = `${year}${month}${dayStr}`;
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
        // Ensure these mappings are correct (arrival mapped to start?)
        arrivalStopTimeId: trip.startStopTimeId,
        departureStopTimeId: trip.endStopTimeId,
      },
    }));
  }
}

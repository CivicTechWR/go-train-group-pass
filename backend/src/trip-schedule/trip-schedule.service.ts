import {
  RoundTripDto,
  TripScheduleDetailsDto,
} from '@go-train-group-pass/shared';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, BadRequestException } from '@nestjs/common';
import { TripSchedule } from 'src/entities/trip_schedule_entity';
import { getDateTimeFromServiceIdGTFSTimeString } from 'src/utils/getDateTimeFromServiceIdGTFSTimeString';

@Injectable()
export class TripScheduleService {
  constructor(
    @InjectRepository(TripSchedule)
    private readonly tripScheduleRepo: EntityRepository<TripSchedule>,
  ) {}
  async getKIToUnionRoundTripSchedule(day: Date): Promise<RoundTripDto> {
    const departureTrips = await this.getTripSchedule(
      'Kitchener GO',
      'Union Station GO',
      day,
    );
    const returnTrips = await this.getTripSchedule(
      'Union Station GO',
      'Kitchener GO',
      day,
    );
    return {
      departureTrips,
      returnTrips,
    };
  }
  async getTripSchedule(
    orgStation: string,
    destStation: string,
    day: Date,
  ): Promise<TripScheduleDetailsDto[]> {
    const supportedTrips = ['Kitchener GO', 'Union Station GO'];
    if (!supportedTrips.includes(orgStation)) {  
        throw new BadRequestException('Orgigin station not supported');  
    }  
    if (!supportedTrips.includes(destStation)) {  
        throw new BadRequestException('Destination station not supported');  
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
        departureStopTimeId: trip.startStopTimeId,
        arrivalStopTimeId: trip.endStopTimeId,
      },
    }));
  }
}

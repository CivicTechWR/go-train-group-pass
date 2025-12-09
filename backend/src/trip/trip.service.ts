import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GTFSStopTime, GTFSTrip, Trip } from '../entities';
import { gtfsDateStringToDate } from '../utils/gtfsDateStringToDate';
import { GTFSTimeString } from 'src/utils/isGTFSTimeString';
import { fromZonedTime } from 'date-fns-tz';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(GTFSTrip)
    private readonly gtfsTripRepo: EntityRepository<GTFSTrip>,
    @InjectRepository(Trip)
    private readonly tripRepo: EntityRepository<Trip>,
    @InjectRepository(GTFSStopTime)
    private readonly gtfstopTimeRepo: EntityRepository<GTFSStopTime>,
  ) {}
  async findOrCreateTrip(
    gtfsTripId: string,
    originStopTimeId: string,
    destStopTimeId: string,
  ): Promise<Trip> {
    const existingTrip = await this.tripRepo.findOne({
      gtfsTrip: gtfsTripId,
      originStopTime: originStopTimeId,
      destinationStopTime: destStopTimeId,
    });
    if (existingTrip) {
      return existingTrip;
    }

    const gtfsTrip = await this.gtfsTripRepo.findOneOrFail(gtfsTripId, {
      populate: ['route'],
    });
    const originStopTime = await this.gtfstopTimeRepo.findOneOrFail(
      {
        id: originStopTimeId,
      },
      { populate: ['stop'] },
    );
    const destStopTime = await this.gtfstopTimeRepo.findOneOrFail(
      {
        id: destStopTimeId,
      },
      { populate: ['stop'] },
    );

    // Theoretically, this should never happen. Confirm that the stop times belong to the trip
    if (
      gtfsTrip.id !== originStopTime.trip.id ||
      gtfsTrip.id !== destStopTime.trip.id
    ) {
      throw new BadRequestException(
        'Trip and/or stop times do not belong to the same trip',
      );
    }
    const date = gtfsDateStringToDate(gtfsTrip.serviceId);
    const arrivalTime = this.combineDateAndTime(date, destStopTime.arrivalTime);
    const departureTime = this.combineDateAndTime(
      date,
      originStopTime.departureTime,
    );

    // Use upsert to handle race conditions where concurrent requests might try to create the same trip
    // If the trip was created by another request between the findOne checks, this will return the existing one
    // We can safely update/overwrite because the trip data is deterministic based on GTFS data
    return await this.tripRepo.upsert(
      {
        gtfsTrip,
        originStopTime,
        destinationStopTime: destStopTime,
        date,
        originStopName: originStopTime.stop.stopName,
        destinationStopName: destStopTime.stop.stopName,
        routeShortName: gtfsTrip.route.routeShortName,
        routeLongName: gtfsTrip.route.routeLongName,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        onConflictFields: [
          'gtfsTrip',
          'originStopTime',
          'destinationStopTime',
          'date',
        ],
        onConflictExcludeFields: ['id', 'createdAt'],
      },
    );
  }
  combineDateAndTime(date: Date, timeString: GTFSTimeString): Date {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    // GTFS times can exceed 24 hours (e.g., 25:30:00 meant 1:30 AM the next day)
    const extraDays = Math.floor(hours / 24);
    const normalizedHours = hours % 24;

    const resultDate = new Date(date);
    resultDate.setDate(resultDate.getDate() + extraDays);

    const year = resultDate.getFullYear();
    const month = String(resultDate.getMonth() + 1).padStart(2, '0');
    const day = String(resultDate.getDate()).padStart(2, '0');
    const hoursStr = String(normalizedHours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    // Construct valid ISO string without timezone info
    const isoString = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:${secondsStr}`;

    // Convert from Toronto time to UTC
    return fromZonedTime(isoString, 'America/Toronto');
  }
}

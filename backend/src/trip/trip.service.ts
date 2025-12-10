import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GTFSStopTime, GTFSTrip, Trip } from '../entities';
import { gtfsDateStringToDate } from '../utils/gtfsDateStringToDate';
import { getDateTimeFromServiceIdGTFSTimeString } from 'src/utils/getDateTimeFromServiceIdGTFSTimeString';

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
  async findOrCreate(
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
    const arrivalTime = getDateTimeFromServiceIdGTFSTimeString(
      gtfsTrip.serviceId,
      destStopTime.arrivalTime,
    );
    const departureTime = getDateTimeFromServiceIdGTFSTimeString(
      gtfsTrip.serviceId,
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
}

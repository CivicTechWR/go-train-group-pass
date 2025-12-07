import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { GTFSStopTime, GTFSTrip, Trip } from 'src/entities';
import { gtfsDateStringToDate } from 'src/utils/gtfsDateStringToDate';

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
    originStopId: string,
    destStopId: string,
  ): Promise<Trip> {
    const existingTrip = await this.tripRepo.findOne({
      gtfsTrip: gtfsTripId,
      originStopTime: originStopId,
      destinationStopTime: destStopId,
    });
    if (existingTrip) {
      return existingTrip;
    }
    const gtfsTrip = await this.gtfsTripRepo.findOneOrFail(gtfsTripId, {
      populate: ['route'],
    });
    const originStopTime = await this.gtfstopTimeRepo.findOneOrFail(
      { trip: gtfsTripId, stop: originStopId },
      { populate: ['stop'] },
    );
    const destStopTime = await this.gtfstopTimeRepo.findOneOrFail(
      { trip: gtfsTripId, stop: destStopId },
      { populate: ['stop'] },
    );

    const date = gtfsDateStringToDate(gtfsTrip.serviceId);
    const trip = this.tripRepo.create({
      gtfsTrip,
      originStopTime,
      destinationStopTime: destStopTime,
      date,
      originStopName: originStopTime.stop.stopName,
      destinationStopName: destStopTime.stop.stopName,
      routeShortName: gtfsTrip.route.routeShortName,
      routeLongName: gtfsTrip.route.routeLongName,
      departureTime: originStopTime.departureTime,
      arrivalTime: destStopTime.arrivalTime,
    });
    await this.tripRepo.getEntityManager().persistAndFlush(trip);
    return trip;
  }
}

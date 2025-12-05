import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { GTFSStopTime } from '../entities';
import { RoundTripQueryDto } from './dto/round-trip.dto';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

@Controller('round_trip')
@ApiTags('GTFS - Round Trip')
export class RoundTripController {
  constructor(
    @InjectRepository(GTFSStopTime)
    private readonly stopTimeRepository: EntityRepository<GTFSStopTime>,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'Returns stop times for origin and destination stops',
  })
  async getRoundTrip(@Query() query: RoundTripQueryDto) {
    const targetDate = new Date(query.date);

    const orgStopTimes = await this.stopTimeRepository.find(
      {
        stop: { stopid: query.orgStopId },
        trip: {
          calendarDate: {
            date: targetDate,
          },
        },
      },
      {
        populate: ['trip', 'stop'],
        orderBy: { departureTime: 'ASC' },
      },
    );

    const destStopTimes = await this.stopTimeRepository.find(
      {
        stop: { stopid: query.destStopId },
        trip: {
          calendarDate: {
            date: targetDate,
          },
        },
      },
      {
        populate: ['trip', 'stop'],
        orderBy: { departureTime: 'ASC' },
      },
    );

    return {
      orgStopTimes: orgStopTimes.map((st) => ({
        id: st.id,
        trip_id: st.trip.trip_id,
        arrival_time: st.arrivalTime as unknown as string,
        departure_time: st.departureTime as unknown as string,
        stop_id: st.stop.stopid,
      })),
      destStopTimes: destStopTimes.map((st) => ({
        id: st.id,
        trip_id: st.trip.trip_id,
        arrival_time: st.arrivalTime as unknown as string,
        departure_time: st.departureTime as unknown as string,
        stop_id: st.stop.stopid,
      })),
    };
  }
}

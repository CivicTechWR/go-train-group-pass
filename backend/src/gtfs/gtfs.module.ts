import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { GtfsService } from './gtfs.service';
import {
  Agency,
  GTFSRoute,
  GTFSStop,
  GTFSTrip,
  GTFSStopTime,
  GTFSCalendarDate,
} from '../entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Agency,
      GTFSRoute,
      GTFSStop,
      GTFSTrip,
      GTFSStopTime,
      GTFSCalendarDate,
    ]),
  ],
  providers: [GtfsService],
  exports: [GtfsService],
})
export class GtfsModule {}

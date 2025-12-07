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
import { ConfigModule } from '@nestjs/config';

import { GtfsController } from './gtfs.controller';
import { GTFSFeedInfo } from 'src/entities/gtfs_feed_info.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Agency,
      GTFSRoute,
      GTFSStop,
      GTFSTrip,
      GTFSStopTime,
      GTFSCalendarDate,
      GTFSFeedInfo,
    ]),
    ConfigModule,
  ],
  controllers: [GtfsController],
  providers: [GtfsService],
  exports: [GtfsService],
})
export class GtfsModule {}

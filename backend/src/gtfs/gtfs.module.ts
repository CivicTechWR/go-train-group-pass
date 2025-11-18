import { Module } from '@nestjs/common';

import { GtfsService } from './gtfs.service';

@Module({
  imports: [],
  providers: [GtfsService],
  exports: [GtfsService],
})
export class GtfsModule {}

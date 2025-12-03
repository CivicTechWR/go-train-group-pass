import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GtfsService } from './gtfs.service';

@Module({
  imports: [ConfigModule],
  providers: [GtfsService],
  exports: [GtfsService],
})
export class GtfsModule {}

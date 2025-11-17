import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GtfsService } from './gtfs.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [GtfsService],
  exports: [GtfsService],
})
export class GtfsModule {}

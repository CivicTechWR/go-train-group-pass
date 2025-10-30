import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Index,
} from '@mikro-orm/core';
import { GTFSCalendarDate, GTFSStopTime } from '.';
import { GTFSRoute } from './gtfs_route.entity';

@Entity({ tableName: 'gtfs_trips' })
@Index({ name: 'idx_trips_route', properties: ['route'] })
@Index({ name: 'idx_trips_calendar_date', properties: ['calendarDate'] })
export class GTFSTrip {
  @PrimaryKey()
  id!: string;

  @ManyToOne(() => GTFSCalendarDate)
  calendarDate!: GTFSCalendarDate;

  @Property({ nullable: true })
  tripHeadsign?: string;

  @Property({ nullable: true })
  tripShortName?: string;

  @Property({ nullable: true })
  directionId?: number;

  @Property({ nullable: true })
  blockId?: string;

  @Property({ nullable: true })
  shapeId?: string;

  @Property({ nullable: true })
  wheelchairAccessible?: number;

  @Property({ nullable: true })
  bikesAllowed?: number;

  @ManyToOne(() => GTFSRoute)
  route!: GTFSRoute;

  @OneToMany(() => GTFSStopTime, (stopTime) => stopTime.trip)
  stopTimes = new Collection<GTFSStopTime>(this);
}

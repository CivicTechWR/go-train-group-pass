import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Index,
} from '@mikro-orm/core';
import { GTFSCalendarDate, StopTime } from '.';
import { Route } from './gtfs_route.entity';

@Entity()
@Index({ name: 'idx_trips_route', properties: ['route'] })
@Index({ name: 'idx_trips_calendar_date', properties: ['calendarDate'] })
export class Trip {
  @PrimaryKey()
  tripId!: string;

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

  @ManyToOne(() => Route)
  route!: Route;

  @OneToMany(() => StopTime, (stopTime) => stopTime.trip)
  stopTimes = new Collection<StopTime>(this);
}

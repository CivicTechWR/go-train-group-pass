import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { Agency } from './gtfs_agency.entity';
import { GTFSCalendarDate } from './gtfs_calendar_date.entity';
import { GTFSRoute } from './gtfs_route.entity';
import { GTFSStop } from './gtfs_stop.entity';
import { GTFSStopTime } from './gtfs_stop_times.entity';
import { GTFSTrip } from './gtfs_trip.entity';

@Entity({ tableName: 'gtfs_feed_info' })
@Unique({ properties: ['feedVersion'] })
export class GTFSFeedInfo {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property()
  feedPublisherName!: string;

  @Property()
  feedPublisherUrl!: string;

  @Property()
  feedLang!: string;

  @Property()
  feedStartDate!: Date;

  @Property()
  feedEndDate!: Date;

  @Property()
  feedVersion!: string;

  @Property()
  isActive: boolean = false;

  @OneToMany(
    () => GTFSCalendarDate,
    (calendarDate) => calendarDate.GTFSFeedInfo,
    {
      orphanRemoval: true,
    },
  )
  calendarDates = new Collection<GTFSCalendarDate>(this);

  @OneToMany(() => GTFSRoute, (route) => route.GTFSFeedInfo, {
    orphanRemoval: true,
  })
  routes = new Collection<GTFSRoute>(this);

  @OneToMany(() => GTFSStop, (stop) => stop.GTFSFeedInfo, {
    orphanRemoval: true,
  })
  stops = new Collection<GTFSStop>(this);

  @OneToMany(() => GTFSTrip, (trip) => trip.GTFSFeedInfo, {
    orphanRemoval: true,
  })
  trips = new Collection<GTFSTrip>(this);

  @OneToMany(() => GTFSStopTime, (stopTime) => stopTime.GTFSFeedInfo, {
    orphanRemoval: true,
  })
  stopTimes = new Collection<GTFSStopTime>(this);

  @OneToMany(() => Agency, (agency) => agency.GTFSFeedInfo, {
    orphanRemoval: true,
  })
  agencies = new Collection<Agency>(this);
}

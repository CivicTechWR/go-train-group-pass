import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Index,
} from '@mikro-orm/core';
import { GTFSStopTime } from '.';
import { GTFSRoute } from './gtfs_route.entity';
import { BaseEntity } from './base';
import { randomUUID } from 'crypto';
import { GTFSFeedInfo } from './gtfs_feed_info.entity';

@Entity({ tableName: 'gtfs_trips' })
@Index({ name: 'idx_trips_route', properties: ['route'] })
@Index({ name: 'idx_trips_service_id', properties: ['serviceId'] })
export class GTFSTrip extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property()
  trip_id!: string;

  @Property()
  serviceId!: string;

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

  @ManyToOne(() => GTFSFeedInfo)
  GTFSFeedInfo!: GTFSFeedInfo;
}

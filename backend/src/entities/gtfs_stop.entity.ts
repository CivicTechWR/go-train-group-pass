import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  ManyToOne,
} from '@mikro-orm/core';
import { GTFSStopTime } from '.';
import { randomUUID } from 'crypto';
import { GTFSFeedInfo } from './gtfs_feed_info.entity';
import { BaseEntity } from './base';

@Entity({ tableName: 'gtfs_stops' })
export class GTFSStop extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property()
  stopid!: string;

  @Property()
  stopName!: string;

  @Property({ nullable: true })
  stopDesc?: string;

  @Property({ type: 'decimal', precision: 10, scale: 6 })
  stopLat!: number;

  @Property({ type: 'decimal', precision: 10, scale: 6 })
  stopLon!: number;

  @Property({ nullable: true })
  zoneId?: string;

  @Property({ nullable: true })
  stopUrl?: string;

  @Property({ nullable: true })
  locationType?: number;

  @Property({ nullable: true })
  parentStation?: string;

  @Property({ nullable: true })
  wheelchairBoarding?: number;

  @OneToMany(() => GTFSStopTime, (stopTime: GTFSStopTime) => stopTime.stop)
  stopTimes = new Collection<GTFSStopTime>(this);

  @ManyToOne(() => GTFSFeedInfo)
  GTFSFeedInfo!: GTFSFeedInfo;
}

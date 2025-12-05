import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
  Unique,
} from '@mikro-orm/core';
import { GTFSStop, GTFSTrip } from '.';
import { BaseEntity } from './base';
import type { GTFSTimeString } from '../utils/isGTFSTimeString';
import { GTFSTimeType } from '../database/types/GTFSTimeType';
import { randomUUID } from 'crypto';
import { GTFSFeedInfo } from './gtfs_feed_info.entity';

@Entity({ tableName: 'gtfs_stop_times' })
@Index({ name: 'idx_stop_times_stop', properties: ['stop'] })
@Index({
  name: 'idx_stop_times_stop_departure',
  properties: ['stop', 'departureTime'],
})
@Unique({ properties: ['trip', 'stopSequence', 'GTFSFeedInfo'] })
export class GTFSStopTime extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property()
  stopSequence!: number;

  @Property({ type: GTFSTimeType })
  arrivalTime!: GTFSTimeString;

  @Property({ type: GTFSTimeType })
  departureTime!: GTFSTimeString;

  @Property({ nullable: true })
  stopHeadsign?: string;

  @Property({ nullable: true })
  pickupType?: number;

  @Property({ nullable: true })
  dropOffType?: number;

  @Property({
    type: 'decimal',
    nullable: true,
  })
  shapeDistTraveled?: number;

  @Property({ nullable: true })
  timepoint?: number;

  @ManyToOne(() => GTFSStop)
  stop!: GTFSStop;

  @ManyToOne(() => GTFSTrip)
  trip!: GTFSTrip;

  @ManyToOne(() => GTFSFeedInfo, { deleteRule: 'cascade' })
  GTFSFeedInfo!: GTFSFeedInfo;
}

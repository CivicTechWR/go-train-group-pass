import {
  Entity,
  PrimaryKey,
  Property,
  Index,
  ManyToOne,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { GTFSFeedInfo } from './gtfs_feed_info.entity';
import { BaseEntity } from './base';

@Entity({ tableName: 'gtfs_calendar_dates' })
@Index({ name: 'idx_calendar_dates_date', properties: ['date'] })
export class GTFSCalendarDate extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property()
  serviceId!: string;

  @Property({ type: 'date' })
  date!: Date;

  @Property()
  exceptionType!: number; // 1=added, 2=removed

  @ManyToOne(() => GTFSFeedInfo)
  GTFSFeedInfo!: GTFSFeedInfo;
}

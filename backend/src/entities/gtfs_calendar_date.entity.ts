import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from './base';

@Entity({ tableName: 'gtfs_calendar_dates' })
@Index({ name: 'idx_calendar_dates_date', properties: ['date'] })
export class GTFSCalendarDate extends BaseEntity {
  @PrimaryKey()
  serviceId!: string;

  @PrimaryKey({ type: 'date' })
  date!: Date;

  @Property()
  exceptionType!: number; // 1=added, 2=removed
}

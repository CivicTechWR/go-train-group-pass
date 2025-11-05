import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

@Entity()
@Index({ name: 'idx_calendar_dates_date', properties: ['date'] })
export class GTFSCalendarDate {
  @PrimaryKey()
  serviceId!: string;

  @PrimaryKey({ type: 'date' })
  date!: Date;

  @Property()
  exceptionType!: number; // 1=added, 2=removed
}

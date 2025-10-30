import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

@Entity({ tableName: 'calendar_dates' })
@Index({ name: 'idx_calendar_dates_date', properties: ['date'] })
export class CalendarDate {
  @PrimaryKey({ fieldName: 'service_id' })
  serviceId!: string;

  @PrimaryKey({ fieldName: 'date', type: 'date' })
  date!: Date;

  @Property({ fieldName: 'exception_type' })
  exceptionType!: number; // 1=added, 2=removed
}
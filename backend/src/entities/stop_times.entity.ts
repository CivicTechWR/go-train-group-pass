import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core';
import { Stop, Trip } from '.';


@Entity({ tableName: 'stop_times' })
@Index({ name: 'idx_stop_times_stop', properties: ['stopId'] })
@Index({ name: 'idx_stop_times_stop_departure', properties: ['stopId', 'departureTime'] })
export class StopTime {
  @PrimaryKey({ fieldName: 'trip_id' })
  tripId!: string;

  @PrimaryKey({ fieldName: 'stop_sequence' })
  stopSequence!: number;

  @Property({ fieldName: 'stop_id' })
  stopId!: string;

  @Property({ fieldName: 'arrival_time' })
  arrivalTime!: string; // Keep as string for times like "25:30:00"

  @Property({ fieldName: 'departure_time' })
  departureTime!: string;

  @Property({ fieldName: 'stop_headsign', nullable: true })
  stopHeadsign?: string;

  @Property({ fieldName: 'pickup_type', nullable: true })
  pickupType?: number;

  @Property({ fieldName: 'drop_off_type', nullable: true })
  dropOffType?: number;

  @Property({ type: 'decimal', fieldName: 'shape_dist_traveled', nullable: true })
  shapeDistTraveled?: number;

  @Property({ fieldName: 'timepoint', nullable: true })
  timepoint?: number;

  @ManyToOne(() => Trip)
  trip!: Trip;

  @ManyToOne(() => Stop)
  stop!: Stop;
}
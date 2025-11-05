import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
} from '@mikro-orm/core';
import { Stop, Trip } from '.';

@Entity()
@Index({ name: 'idx_stop_times_stop', properties: ['stopId'] })
@Index({
  name: 'idx_stop_times_stop_departure',
  properties: ['stopId', 'departureTime'],
})
export class StopTime {
  @PrimaryKey()
  tripId!: string;

  @PrimaryKey()
  stopSequence!: number;

  @Property()
  stopId!: string;

  @Property()
  arrivalTime!: string; // Keep as string for times like "25:30:00"

  @Property()
  departureTime!: string;

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

  @ManyToOne(() => Trip)
  trip!: Trip;

  @ManyToOne(() => Stop)
  stop!: Stop;
}

import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
} from '@mikro-orm/core';
import { GTFSStop, GTFSTrip } from '.';
import { GTFSTimeType } from '../database/types/GTFSTimeType';

@Entity({ tableName: 'gtfs_stop_times' })
@Index({ name: 'idx_stop_times_stop', properties: ['stop'] })
@Index({
  name: 'idx_stop_times_stop_departure',
  properties: ['stop', 'departureTime'],
})
export class GTFSStopTime {
  @PrimaryKey()
  id!: string;

  @PrimaryKey()
  stopSequence!: number;

  @Property()
  arrivalTime!: GTFSTimeType;

  @Property()
  departureTime!: GTFSTimeType;

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
}

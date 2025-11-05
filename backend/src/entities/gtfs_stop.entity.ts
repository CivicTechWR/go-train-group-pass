import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { StopTime } from '.';

@Entity()
export class Stop {
  @PrimaryKey()
  stopId!: string;

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

  @Property({ fieldName: 'location_type', nullable: true })
  locationType?: number;

  @Property({ fieldName: 'parent_station', nullable: true })
  parentStation?: string;

  @Property({ fieldName: 'wheelchair_boarding', nullable: true })
  wheelchairBoarding?: number;

  @OneToMany(() => StopTime, (stopTime: StopTime) => stopTime.stop)
  stopTimes = new Collection<StopTime>(this);
}

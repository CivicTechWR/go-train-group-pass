import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { StopTime } from '.';

@Entity({ tableName: 'stops' })
export class Stop {
  @PrimaryKey({ fieldName: 'stop_id' })
  stopId!: string;

  @Property({ fieldName: 'stop_name' })
  stopName!: string;

  @Property({ fieldName: 'stop_desc', nullable: true })
  stopDesc?: string;

  @Property({ type: 'decimal', fieldName: 'stop_lat', precision: 10, scale: 6 })
  stopLat!: number;

  @Property({ type: 'decimal', fieldName: 'stop_lon', precision: 10, scale: 6 })
  stopLon!: number;

  @Property({ fieldName: 'zone_id', nullable: true })
  zoneId?: string;

  @Property({ fieldName: 'stop_url', nullable: true })
  stopUrl?: string;

  @Property({ fieldName: 'location_type', nullable: true })
  locationType?: number;

  @Property({ fieldName: 'parent_station', nullable: true })
  parentStation?: string;

  @Property({ fieldName: 'wheelchair_boarding', nullable: true })
  wheelchairBoarding?: number;

  @OneToMany(() => StopTime, stopTime => stopTime.stop)
  stopTimes = new Collection<StopTime>(this);
}
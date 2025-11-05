import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Index,
} from '@mikro-orm/core';
import { StopTime } from '.';
import { Route } from './gtfs_route.entity';

@Entity()
@Index({ name: 'idx_trips_route', properties: ['routeId'] })
@Index({ name: 'idx_trips_service', properties: ['serviceId'] })
export class Trip {
  @PrimaryKey({ fieldName: 'trip_id' })
  tripId!: string;

  @Property({ fieldName: 'route_id' })
  routeId!: string;

  @Property({ fieldName: 'service_id' })
  serviceId!: string;

  @Property({ fieldName: 'trip_headsign', nullable: true })
  tripHeadsign?: string;

  @Property({ fieldName: 'trip_short_name', nullable: true })
  tripShortName?: string;

  @Property({ fieldName: 'direction_id', nullable: true })
  directionId?: number;

  @Property({ fieldName: 'block_id', nullable: true })
  blockId?: string;

  @Property({ fieldName: 'shape_id', nullable: true })
  shapeId?: string;

  @Property({ fieldName: 'wheelchair_accessible', nullable: true })
  wheelchairAccessible?: number;

  @Property({ fieldName: 'bikes_allowed', nullable: true })
  bikesAllowed?: number;

  @ManyToOne(() => Route)
  route!: Route;

  @OneToMany(() => StopTime, (stopTime) => stopTime.trip)
  stopTimes = new Collection<StopTime>(this);
}

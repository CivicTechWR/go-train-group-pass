import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { Trip } from './gtfs_trip.entitity';

@Entity()
export class Route {
  @PrimaryKey()
  id!: string;

  @Property({ nullable: true })
  agencyId?: string;

  @Property()
  routeShortName!: string;

  @Property()
  routeLongName!: string;

  @Property({ nullable: true })
  routeDesc?: string;

  @Property()
  routeType!: number; // 0=Tram, 1=Subway, 2=Rail, 3=Bus

  @Property({ nullable: true })
  routeUrl?: string;

  @Property({ nullable: true })
  routeColor?: string;

  @Property({ nullable: true })
  routeTextColor?: string;

  @OneToMany(() => Trip, (trip: Trip) => trip.route)
  trips = new Collection<Trip>(this);
}

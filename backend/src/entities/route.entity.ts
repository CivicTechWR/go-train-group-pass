import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { Trip } from './trip.entitity';

@Entity({ tableName: 'routes' })
export class Route {
  @PrimaryKey({ fieldName: 'route_id' })
  routeId!: string;

  @Property({ fieldName: 'agency_id', nullable: true })
  agencyId?: string;

  @Property({ fieldName: 'route_short_name' })
  routeShortName!: string;

  @Property({ fieldName: 'route_long_name' })
  routeLongName!: string;

  @Property({ fieldName: 'route_desc', nullable: true })
  routeDesc?: string;

  @Property({ fieldName: 'route_type' })
  routeType!: number; // 0=Tram, 1=Subway, 2=Rail, 3=Bus

  @Property({ fieldName: 'route_url', nullable: true })
  routeUrl?: string;

  @Property({ fieldName: 'route_color', nullable: true })
  routeColor?: string;

  @Property({ fieldName: 'route_text_color', nullable: true })
  routeTextColor?: string;

  @OneToMany(() => Trip, trip => trip.route)
  trips = new Collection<Trip>(this);
}
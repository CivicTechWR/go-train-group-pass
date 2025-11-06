import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { GTFSTrip } from './gtfs_trip.entitity';
import { Agency } from './gtfs_agency.entity';

@Entity({ tableName: 'gtfs_routes' })
export class GTFSRoute {
  @PrimaryKey()
  routeId!: string;

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

  @ManyToOne(() => Agency, { nullable: true })
  agency?: Agency;

  @OneToMany(() => GTFSTrip, (trip: GTFSTrip) => trip.route)
  trips = new Collection<GTFSTrip>(this);
}

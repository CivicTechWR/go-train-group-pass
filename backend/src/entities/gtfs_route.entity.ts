import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Unique,
} from '@mikro-orm/core';
import { GTFSTrip } from './gtfs_trip.entity';
import { Agency } from './gtfs_agency.entity';
import { randomUUID } from 'crypto';
import { GTFSFeedInfo } from './gtfs_feed_info.entity';
import { BaseEntity } from './base';

@Entity({ tableName: 'gtfs_routes' })
@Unique({ properties: ['route_id', 'GTFSFeedInfo'] })
export class GTFSRoute extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property()
  route_id!: string;

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

  @ManyToOne(() => GTFSFeedInfo, { deleteRule: 'cascade' })
  GTFSFeedInfo!: GTFSFeedInfo;
}

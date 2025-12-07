import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Collection,
  Unique,
  OneToMany,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { GTFSTrip } from './gtfs_trip.entity';
import { GTFSStopTime } from './gtfs_stop_times.entity';
import { TripBooking } from './trip_booking.entity';
import { BaseEntity } from './base';

@Entity()
@Unique({
  properties: ['gtfsTrip', 'originStopTime', 'destinationStopTime', 'date'],
})
export class Trip extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @ManyToOne(() => GTFSTrip)
  gtfsTrip!: GTFSTrip;

  @ManyToOne(() => GTFSStopTime)
  originStopTime!: GTFSStopTime;

  @ManyToOne(() => GTFSStopTime)
  destinationStopTime!: GTFSStopTime;

  //I guess a trip can have multiple dates, for this specific purpose they are only ever on the same day. Could consider refactoring if we want to support group passes that aren't based off the day like the original use case
  @Property({ type: 'date' })
  date: Date;

  @Property()
  originStopName: string;

  @Property()
  destinationStopName: string;

  @Property()
  routeShortName: string;

  @Property()
  routeLongName: string;

  @Property()
  departureTime: Date;

  @Property()
  arrivalTime: Date;

  @OneToMany(() => TripBooking, (booking) => booking.trip)
  bookings = new Collection<TripBooking>(this);
}

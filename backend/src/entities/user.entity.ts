import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { Itinerary } from './itinerary.entity';
import { TravelGroup } from './travel_group.entity';
import { TripBooking } from './trip_booking.entity';
import { randomUUID } from 'crypto';
import { Payment } from '.';
import { BaseEntity } from './base';

@Entity({tableName: 'users'})
export class User extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property({ type: 'string', length: 255 })
  name: string;

  @Property({ type: 'string', length: 255, unique: true })
  email: string;

  @Property({ type: 'string', length: 20, nullable: true })
  phoneNumber?: string;

  @OneToMany(() => Itinerary, (itinerary) => itinerary.user)
  itineraries = new Collection<Itinerary>(this);

  @OneToMany(() => TripBooking, (booking) => booking.user)
  tripBookings = new Collection<TripBooking>(this);

  @OneToMany(() => TravelGroup, (group) => group.steward)
  stewardedGroups = new Collection<TravelGroup>(this);

  @OneToMany(() => Payment, (payment) => payment.paidByUser)
  paymentsMarkedAsPaid = new Collection<Payment>(this);

  @Property({ unique: true, type: 'uuid' })
  authUserId!: string;

  @Property({ nullable: true, type: 'timestamp', onCreate: () => new Date() })
  lastSignInAt?: Date;
}

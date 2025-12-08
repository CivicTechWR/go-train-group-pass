import {
  PrimaryKey,
  Property,
  Enum,
  ManyToOne,
  OneToMany,
  Collection,
  Entity,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { Itinerary } from './itinerary.entity';
import { TravelGroup } from './travel_group.entity';
import { Trip } from './trip.entity';
import { User } from './user.entity';
import { Payment, TicketPurchase, TripBookingStatusLog } from '.';
import { TripBookingStatus } from './tripBookingEnum';
import { BaseEntity } from './base';

@Entity()
export class TripBooking extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property({ type: 'number', nullable: true })
  sequence?: number; // Only relevant if part of an itinerary

  @Property({ type: 'datetime', nullable: true })
  checkedInAt?: Date;

  @Enum({
    items: () => TripBookingStatus,
    default: TripBookingStatus.PENDING,
  })
  status: TripBookingStatus = TripBookingStatus.PENDING;

  @Property({ type: 'boolean', default: false })
  isConfirmedBySteward?: boolean = false;

  @Property({ type: 'datetime', nullable: true })
  confirmedAt?: Date;

  @Property({ type: 'boolean', default: false })
  memberPresent?: boolean = false;

  @ManyToOne(() => User, {
    index: true,
  })
  user: User;

  // optional since someone can join a trip without an itinerary
  @ManyToOne(() => Itinerary, {
    nullable: true,
    index: true,
  })
  itinerary?: Itinerary;

  @ManyToOne(() => Trip, {
    index: true,
  })
  trip: Trip;

  @ManyToOne(() => TravelGroup, {
    nullable: true,
    index: true,
  })
  group?: TravelGroup;

  @OneToMany(() => Payment, (payment) => payment.tripBooking)
  payments = new Collection<Payment>(this);

  @OneToMany(() => TicketPurchase, (purchase) => purchase.stewardTripBooking)
  stewardedTicketPurchases = new Collection<TicketPurchase>(this);

  @OneToMany(() => TripBookingStatusLog, (log) => log.tripBooking)
  statusLogs = new Collection<TripBookingStatusLog>(this);
}

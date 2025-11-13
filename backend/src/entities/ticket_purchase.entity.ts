import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { Payment, TravelGroup, TripBooking } from '.';
import { BaseEntity } from './base';

@Entity()
export class TicketPurchase extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Property({ type: 'number' })
  groupSize: number;

  @Property({ type: 'datetime' })
  purchasedAt: Date;

  @Property({ type: 'string', length: 500, nullable: true })
  ticketImageUrl?: string;

  @ManyToOne(() => TravelGroup, {
    index: true,
  })
  group: TravelGroup;

  @ManyToOne(() => TripBooking, {
    index: true,
  })
  stewardTripBooking: TripBooking;

  @OneToMany(() => Payment, (payment) => payment.ticketPurchase)
  payments = new Collection<Payment>(this);
}

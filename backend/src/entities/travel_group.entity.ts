import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import {
  User,
  Trip,
  TripBooking,
  TicketPurchase,
  TravelGroupStatusLog,
} from '.';
import { TravelGroupStatus } from './travelGroupEnum';
import { BaseEntity } from './base';

@Entity()
export class TravelGroup extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property({ type: 'number' })
  groupNumber: number;

  @Property({ type: 'datetime', nullable: true })
  finalizedAt?: Date;

  @Enum({
    items: () => TravelGroupStatus,
    default: TravelGroupStatus.FORMING,
  })
  status: TravelGroupStatus = TravelGroupStatus.FORMING;

  @ManyToOne(() => Trip, {
    index: true,
  })
  trip: Trip;

  @ManyToOne(() => User, {
    index: true,
  })
  steward: User;

  @OneToMany(() => TripBooking, (booking) => booking.group)
  tripBookings = new Collection<TripBooking>(this);

  @OneToMany(() => TicketPurchase, (purchase) => purchase.group)
  ticketPurchases = new Collection<TicketPurchase>(this);

  @OneToMany(() => TravelGroupStatusLog, (log) => log.travelGroup)
  statusLogs = new Collection<TravelGroupStatusLog>(this);

  @Property({ persist: false })
  get members(): User[] {
    return this.tripBookings.getItems().map((booking) => booking.user);
  }
}

import {
  Entity,
  PrimaryKey,
  Property,
  OneToOne,
  ManyToOne,
} from '@mikro-orm/core';
import { TicketPurchase } from './ticket_purchase.entity';
import { TripBooking } from './trip_booking.entity';
import { User } from './user.entity';
import { randomUUID } from 'crypto';
import { PaymentCalculation } from '.';

@Entity()
export class Payment {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amountOwed: number;

  @OneToOne(() => PaymentCalculation, (calc) => calc.payment)
  calculation: PaymentCalculation;

  @Property({ type: 'boolean', default: false })
  isPaid: boolean = false;

  @Property({ type: 'datetime', nullable: true })
  markedPaidAt?: Date;

  @ManyToOne(() => TripBooking, {
    index: true,
  })
  tripBooking: TripBooking;

  @ManyToOne(() => TicketPurchase, {
    nullable: true,
    index: true,
  })
  ticketPurchase?: TicketPurchase;

  @ManyToOne(() => User, {
    nullable: true,
    index: true,
  })
  markedPaidBy?: User;

  @ManyToOne(() => User, {
    nullable: true,
    index: true,
  })
  paidByUser?: User;
}

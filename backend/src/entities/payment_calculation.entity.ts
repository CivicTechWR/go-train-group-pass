import { Entity, PrimaryKey, Property, OneToOne } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

import { Payment } from './payment.entity';

@Entity()
export class PaymentCalculation {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Property({ type: 'string', length: 50 })
  calculationVersion: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalTicketCost: number;

  @Property({ type: 'number' })
  groupSize: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseAmount?: number;

  @OneToOne(() => Payment, (payment) => payment.calculation, {
    owner: true,
  })
  payment: Payment;
}

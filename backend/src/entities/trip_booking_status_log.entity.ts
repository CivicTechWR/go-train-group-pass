import { Entity, ManyToOne } from '@mikro-orm/core';
import { TripBooking } from '.';
import { TripBookingStatus } from './tripBookingEnum';
import { BaseStatusLog } from './base_status_log';

@Entity()
export class TripBookingStatusLog extends BaseStatusLog<TripBookingStatus> {
  @ManyToOne(() => TripBooking, { inversedBy: 'statusLogs' })
  tripBooking: TripBooking;
}

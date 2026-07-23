import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from './user.entity';
import { ItineraryStatusLog, TripBooking } from '.';
import { BaseEntity } from './base';
import { randomUUID } from 'crypto';
import { ItineraryStatus } from './itineraryStatusEnum';

@Entity()
export class Itinerary extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @Enum({ items: () => ItineraryStatus, default: ItineraryStatus.DRAFT })
  status: ItineraryStatus = ItineraryStatus.DRAFT;

  @Property({ type: 'boolean', default: false })
  wantsToSteward: boolean;

  @Property({ nullable: true })
  tripHash?: string;

  @ManyToOne(() => User, {
    index: true,
  })
  user!: User;

  @OneToMany(() => TripBooking, (booking: TripBooking) => booking.itinerary, {
    nullable: true,
  })
  tripBookings = new Collection<TripBooking>(this);

  @OneToMany(() => ItineraryStatusLog, (log) => log.itinerary)
  statusLogs = new Collection<ItineraryStatusLog>(this);
}

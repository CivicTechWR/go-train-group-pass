import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  wrap,
  Unique,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { fromZonedTime } from 'date-fns-tz';
import { GTFSTrip } from './gtfs_trip.entity';
import { GTFSStopTime } from './gtfs_stop_times.entity';
import { BaseEntity } from './base';

@Entity()
@Unique({ properties: ['gtfsTrip', 'originStopTime', 'destinationStopTime'] })
export class Trip extends BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string = randomUUID();

  @ManyToOne(() => GTFSTrip)
  gtfsTrip!: GTFSTrip;

  @ManyToOne(() => GTFSStopTime)
  originStopTime!: GTFSStopTime;

  @ManyToOne(() => GTFSStopTime)
  destinationStopTime!: GTFSStopTime;

  @Property({ persist: false })
  get date(): Date | undefined {
    if (!wrap(this.gtfsTrip).isInitialized()) {
      return undefined;
    }
    const s = this.gtfsTrip.serviceId;
    const isoDate = `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}T00:00:00`;
    return fromZonedTime(isoDate, 'America/Toronto');
  }
}

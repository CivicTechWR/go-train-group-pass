import { Entity, PrimaryKey, Property, ManyToOne, wrap } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { GTFSTrip } from './gtfs_trip.entity';
import { GTFSStopTime } from './gtfs_stop_times.entity';

@Entity()
export class Trip {
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
    // Parse YYYYMMDD from serviceId
    const s = this.gtfsTrip.serviceId;
    const year = parseInt(s.substring(0, 4), 10);
    const month = parseInt(s.substring(4, 6), 10) - 1; // JS months are 0-indexed
    const day = parseInt(s.substring(6, 8), 10);
    return new Date(year, month, day);
  }
}

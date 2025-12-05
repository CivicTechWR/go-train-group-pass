import { Entity, ManyToOne } from '@mikro-orm/core';
import { TravelGroup } from './travel_group.entity';
import { TravelGroupStatus } from './travelGroupEnum';
import { BaseStatusLog } from './base_status_log';

@Entity()
export class TravelGroupStatusLog extends BaseStatusLog<TravelGroupStatus> {
  @ManyToOne(() => TravelGroup, {
    inversedBy: 'statusLogs',
  })
  travelGroup: TravelGroup;
}

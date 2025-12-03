import { Entity, ManyToOne, Index } from '@mikro-orm/core';
import { Itinerary } from '.';
import { ItineraryStatus } from './itineraryStatusEnum';
import { BaseStatusLog } from './base_status_log';

@Entity()
@Index({ properties: ['itinerary'] })
export class ItineraryStatusLog extends BaseStatusLog<ItineraryStatus> {
  @ManyToOne(() => Itinerary, {
    fieldName: 'itineraryId',
    inversedBy: 'statusLogs',
  })
  itinerary: Itinerary;
}

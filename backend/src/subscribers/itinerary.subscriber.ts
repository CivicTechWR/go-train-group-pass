import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';
import { createHash } from 'crypto';
import { Itinerary } from '../entities/itinerary.entity';

export class ItinerarySubscriber implements EventSubscriber<Itinerary> {
  getSubscribedEntities(): EntityName<Itinerary>[] {
    return [Itinerary];
  }

  beforeCreate(args: EventArgs<Itinerary>) {
    this.updateTripHash(args.entity);
  }

  beforeUpdate(args: EventArgs<Itinerary>) {
    this.updateTripHash(args.entity);
  }

  private updateTripHash(itinerary: Itinerary): void {
    if (
      itinerary.tripBookings.isInitialized() &&
      itinerary.tripBookings.length > 0
    ) {
      const items = itinerary.tripBookings.getItems();
      const sortedBookings = items.sort(
        (a, b) => (a.sequence || 0) - (b.sequence || 0),
      );

      const tripIds = sortedBookings
        .map((b) => b.trip?.id)
        .filter(Boolean)
        .join(',');

      if (tripIds && tripIds.length > 0) {
        itinerary.tripHash = createHash('md5').update(tripIds).digest('hex');
      }
    }
  }
}

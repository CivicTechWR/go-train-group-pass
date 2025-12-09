import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';
import { Itinerary } from '../entities/itinerary.entity';
import { createHash } from 'crypto';

export class ItinerarySubscriber implements EventSubscriber<Itinerary> {
  getSubscribedEntities(): EntityName<Itinerary>[] {
    return [Itinerary];
  }

  beforeCreate(args: EventArgs<Itinerary>): void {
    this.updateTripHash(args.entity);
  }

  beforeUpdate(args: EventArgs<Itinerary>): void {
    this.updateTripHash(args.entity);
  }

  private updateTripHash(itinerary: Itinerary): void {
    if (
      itinerary.tripBookings.isInitialized() &&
      itinerary.tripBookings.length > 0
    ) {
      // Sort bookings by sequence
      const sortedBookings = itinerary.tripBookings
        .getItems()
        .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

      const tripIds = sortedBookings.map((b) => b.trip.id).join(',');
      itinerary.tripHash = createHash('md5').update(tripIds).digest('hex');
    }
  }
}

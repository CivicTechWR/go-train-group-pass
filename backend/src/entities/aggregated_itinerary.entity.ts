import { Entity, Property } from '@mikro-orm/core';
import { TripDetailsSchema } from '@go-train-group-pass/shared';
import z from 'zod';

@Entity({
  expression: `
    WITH itinerary_sequences AS (
      SELECT
        tb.itinerary_id,
        i.user_id,
        STRING_AGG(tb.trip_id::text, ',' ORDER BY tb.sequence) as trip_sequence,
        json_agg(
            json_build_object(
                'tripId', t.id,
                'orgStation', t.origin_stop_name,
                'destStation', t.destination_stop_name,
                'departureTime', t.departure_time,
                'arrivalTime', t.arrival_time,
                'routeShortName', t.route_short_name,
                'sequence', tb.sequence
            ) ORDER BY tb.sequence
        ) as trip_details
      FROM "go-train-group-pass".trip_booking tb
      JOIN "go-train-group-pass".itinerary i ON i.id = tb.itinerary_id
      JOIN "go-train-group-pass".trip t ON t.id = tb.trip_id
      WHERE tb.itinerary_id IS NOT NULL
      GROUP BY tb.itinerary_id, i.user_id
    )
    SELECT
      md5(trip_sequence) as id,
      trip_sequence,
      COUNT(DISTINCT user_id)::integer as user_count,
      CAST(MAX(CAST(trip_details AS text)) AS json) as trip_details
    FROM itinerary_sequences
    GROUP BY trip_sequence
  `,
})
export class AggregatedItinerary {
  @Property()
  id: string;

  @Property()
  tripSequence: string;

  @Property()
  userCount: number;

  @Property({ type: 'json' })
  tripDetails: z.infer<typeof TripDetailsSchema>[];
}

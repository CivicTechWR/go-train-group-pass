import { Entity, Property, Embeddable, Embedded } from '@mikro-orm/core';

@Embeddable()
export class TripDetail {
  @Property()
  orgStation: string;

  @Property()
  destStation: string;

  @Property()
  departureTime: Date;

  @Property()
  arrivalTime: Date;

  @Property()
  routeShortName: string;

  @Property()
  tripId: string;

  @Property()
  sequence: number;
}

@Entity({
  expression: `
    WITH clustered_itineraries AS (
      SELECT
        trip_hash,
        COUNT(DISTINCT user_id)::integer as user_count,
        MAX(id::text)::uuid as sample_itinerary_id
      FROM "go-train-group-pass".itinerary
      WHERE trip_hash IS NOT NULL
      GROUP BY trip_hash
    )
    SELECT
      ci.trip_hash as id,
      ci.user_count,
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
    FROM clustered_itineraries ci
    JOIN "go-train-group-pass".trip_booking tb ON tb.itinerary_id = ci.sample_itinerary_id
    JOIN "go-train-group-pass".trip t ON t.id = tb.trip_id
    GROUP BY ci.trip_hash, ci.user_count
  `,
})
export class AggregatedItinerary {
  @Property()
  id: string;

  @Property()
  tripSequence: string;

  @Property()
  userCount: number;

  @Embedded(() => TripDetail, { array: true, persist: false })
  tripDetails: TripDetail[] = [];
}

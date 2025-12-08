import { Entity, Property } from '@mikro-orm/core';
import type { GTFSTimeString } from 'src/utils/isGTFSTimeString';

@Entity({
  expression: `
    SELECT
      f.id as "feed_id",
      t.id as "trip_id",
      r.id as "route_id",
      r.route_short_name as "route_short_name",
      r.route_long_name as "route_long_name",
      st1.departure_time as "departure_time",
      st2.arrival_time as "arrival_time",
      t.service_id as "service_id",
      s1.stop_name as "start_stop_name",
      s2.stop_name as "end_stop_name",
      cd.date as "date",
      st1.id as "start_stop_time_id",
      st2.id as "end_stop_time_id"
    FROM "go-train-group-pass".gtfs_trips t
    JOIN "go-train-group-pass".gtfs_feed_info f ON t.gtfsfeed_info_id = f.id
    JOIN "go-train-group-pass".gtfs_routes r ON t.route_id = r.id
    JOIN "go-train-group-pass".gtfs_stop_times st1 ON t.id = st1.trip_id
    JOIN "go-train-group-pass".gtfs_stop_times st2 ON t.id = st2.trip_id
    JOIN "go-train-group-pass".gtfs_stops s1 ON st1.stop_id = s1.id
    JOIN "go-train-group-pass".gtfs_stops s2 ON st2.stop_id = s2.id
    JOIN "go-train-group-pass".gtfs_calendar_dates cd ON t.service_id = cd.service_id
    WHERE st1.stop_sequence < st2.stop_sequence
      AND cd.exception_type = 1 and f.is_active = true
  `,
})
export class TripSchedule {
  @Property()
  tripId!: string;

  @Property()
  routeId!: string;

  @Property()
  routeShortName!: string;

  @Property()
  routeLongName!: string;

  @Property()
  departureTime!: GTFSTimeString;

  @Property()
  arrivalTime!: GTFSTimeString;

  @Property()
  serviceId!: string;

  @Property()
  startStopName!: string;

  @Property()
  endStopName!: string;

  @Property()
  date!: string;

  @Property()
  startStopTimeId!: string;

  @Property()
  endStopTimeId!: string;
}

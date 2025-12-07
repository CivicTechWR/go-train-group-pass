import { Entity, Property } from '@mikro-orm/core';

@Entity({
  expression: `
    SELECT
      t.id as "tripId",
      r.id as "routeId",
      r.route_short_name as "routeShortName",
      r.route_long_name as "routeLongName",
      st1.departure_time as "departureTime",
      st2.arrival_time as "arrivalTime",
      t.service_id as "serviceId",
      s1.stop_name as "startStopName",
      s2.stop_name as "endStopName",
      cd.date as "date",
      st1.id as "startStopTime_id",
      st2.id as "endStopTime_id"
    FROM gtfs_trips t
    JOIN gtfs_routes r ON t.route_id = r.id
    JOIN gtfs_stop_times st1 ON t.id = st1.trip_id
    JOIN gtfs_stop_times st2 ON t.id = st2.trip_id
    JOIN gtfs_stops s1 ON st1.stop_id = s1.id
    JOIN gtfs_stops s2 ON st2.stop_id = s2.id
    JOIN gtfs_calendar_dates cd ON t.service_id = cd.service_id
    WHERE st1.stop_sequence < st2.stop_sequence
      AND cd.exception_type = 1
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
  departureTime!: string;

  @Property()
  arrivalTime!: string;

  @Property()
  serviceId!: string;

  @Property()
  startStopName!: string;

  @Property()
  endStopName!: string;

  @Property()
  date!: string;

  @Property()
  startStopTimeId: string;

  @Property()
  endStopTimeId: string;
}

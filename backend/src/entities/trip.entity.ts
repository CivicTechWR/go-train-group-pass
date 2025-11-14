import { Entity, Property } from '@mikro-orm/core';

@Entity({
  expression: `
    SELECT 
      t.id as trip_id,
      t.trip_id as gtfs_trip_id,
      r.route_short_name,
      origin_stop.stop_name as origin_station,
      dest_stop.stop_name as destination_station,
      origin_st.departure_time,
      dest_st.arrival_time
    FROM trips t
    INNER JOIN routes r ON t.route_id = r.id
    INNER JOIN stop_times origin_st ON t.id = origin_st.trip_id
    INNER JOIN stops origin_stop ON origin_st.stop_id = origin_stop.id
    INNER JOIN stop_times dest_st ON t.id = dest_st.trip_id
    INNER JOIN stops dest_stop ON dest_st.stop_id = dest_stop.id
    WHERE origin_st.stop_sequence = 1
      AND dest_st.stop_sequence = (
        SELECT MAX(st.stop_sequence) 
        FROM stop_times st 
        WHERE st.trip_id = t.id
      )
  `,
})
export class Trip {
  @Property()
  gtfsTripId!: string;

  @Property()
  routeShortName!: string;

  @Property()
  originStation!: string;

  @Property()
  destinationStation!: string;

  @Property()
  departureTime!: string;

  @Property()
  arrivalTime!: string;
}

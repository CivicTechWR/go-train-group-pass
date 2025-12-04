import { RequiredEntityData } from '@mikro-orm/core';
import { GTFSTimeType } from 'src/database/types/GTFSTimeType';
import { GTFSStopTime } from 'src/entities';

export interface GTFSAgencyImport {
  agency_id: string | null | undefined;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_lang: string | null | undefined;
  agency_phone: string | null | undefined;
  agency_fare_url: string | null | undefined;
}

export interface GTFSCalendarDatesImport {
  service_id: string;
  exception_type: string;
  date: Date;
}

export interface GTFSRoutesImport {
  route_id: string | null | undefined;
  route_short_name: string;
  route_long_name: string;
  route_desc: string | null | undefined;
  route_type: string;
  route_url: string | null | undefined;
  route_color: string | null | undefined;
  route_text_color: string | null | undefined;
  agency_id: string | null | undefined;
}

export interface GTFSStopsImport {
  stop_id: string | null | undefined;
  stop_name: string;
  stop_desc: string | null | undefined;
  stop_lat: string;
  stop_lon: string;
  zone_id: string | null | undefined;
  stop_url: string | null | undefined;
  location_type: string | null | undefined;
  parent_station: string | null | undefined;
  wheelchair_boarding: string | null | undefined;
}

export interface GTFSTripsImport {
  trip_id: string | null | undefined;
  trip_headsign: string | null | undefined;
  trip_short_name: string | null | undefined;
  direction_id: string | null | undefined;
  block_id: string | null | undefined;
  shape_id: string | null | undefined;
  wheelchair_accessible: string | null | undefined;
  bikes_allowed: string | null | undefined;
  route_id: string | null | undefined;
  service_id: string | null | undefined;
}

export interface GTFSStopTimesImport {
  trip_id: string | null | undefined;
  arrival_time:
    | GTFSTimeType
    | RequiredEntityData<GTFSTimeType, GTFSStopTime, false>;
  departure_time:
    | GTFSTimeType
    | RequiredEntityData<GTFSTimeType, GTFSStopTime, false>;
  stop_headsign: string | null | undefined;
  pickup_type: string | null | undefined;
  stop_sequence: string;
  drop_off_type: string | null | undefined;
  shape_dist_traveled: string | null | undefined;
  timepoint: string | null | undefined;
  stop_id: string | null | undefined;
}

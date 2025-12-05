import { z } from 'zod';
import { gtfsTimeRegex, GTFSTimeString } from '../utils/isGTFSTimeString';

// Helper to handle empty strings as undefined
// If the value is an empty string, it becomes undefined.
// If it's missing entirely from the object, it's also undefined (via .optional()).
const optionalString = z
  .string()
  .optional()
  .transform((val) => (val === '' ? undefined : val));
const requiredString = z.string().min(1);

export const GTFSTimeSchema = z
  .string()
  .regex(gtfsTimeRegex, 'Invalid GTFS time format (H:MM:SS or HH:MM:SS)')
  .transform((val) => val as GTFSTimeString);

export const GTFSAgencySchema = z.object({
  agency_id: optionalString,
  agency_name: requiredString,
  agency_url: requiredString,
  agency_timezone: requiredString,
  agency_lang: requiredString,
  agency_phone: requiredString,
  agency_fare_url: requiredString,
});

export const GTFSCalendarDateSchema = z.object({
  service_id: requiredString,
  date: requiredString.regex(/^\d{8}$/, 'Invalid date format (YYYYMMDD)'),
  exception_type: requiredString.regex(
    /^[12]$/,
    'Invalid exception_type (1 or 2)',
  ),
});

export const GTFSRouteSchema = z.object({
  route_id: requiredString,
  route_short_name: requiredString,
  route_long_name: requiredString,
  route_desc: optionalString,
  route_type: requiredString,
  route_url: optionalString,
  route_color: optionalString,
  route_text_color: optionalString,
  agency_id: optionalString,
});

export const GTFSStopSchema = z.object({
  stop_id: requiredString,
  stop_name: requiredString,
  stop_desc: optionalString,
  stop_lat: requiredString,
  stop_lon: requiredString,
  zone_id: optionalString,
  stop_url: optionalString,
  location_type: optionalString,
  parent_station: optionalString,
  wheelchair_boarding: optionalString,
});

export const GTFSTripSchema = z.object({
  trip_id: requiredString,
  route_id: requiredString,
  service_id: requiredString,
  trip_headsign: requiredString,
  trip_short_name: optionalString,
  direction_id: optionalString,
  block_id: optionalString,
  shape_id: optionalString,
  wheelchair_accessible: optionalString,
  bikes_allowed: optionalString,
});

export const GTFSStopTimeSchema = z.object({
  trip_id: requiredString,
  arrival_time: GTFSTimeSchema,
  departure_time: GTFSTimeSchema,
  stop_id: requiredString,
  stop_sequence: requiredString,
  stop_headsign: optionalString,
  pickup_type: optionalString,
  drop_off_type: optionalString,
  shape_dist_traveled: optionalString,
  timepoint: optionalString,
});

export const GTFSFeedInfoSchema = z.object({
  feed_publisher_name: requiredString,
  feed_publisher_url: requiredString,
  feed_lang: requiredString,
  feed_start_date: requiredString,
  feed_end_date: requiredString,
  feed_version: requiredString,
});

export type GTFSAgencyImport = z.infer<typeof GTFSAgencySchema>;
export type GTFSCalendarDateImport = z.infer<typeof GTFSCalendarDateSchema>;
export type GTFSRouteImport = z.infer<typeof GTFSRouteSchema>;
export type GTFSStopImport = z.infer<typeof GTFSStopSchema>;
export type GTFSTripImport = z.infer<typeof GTFSTripSchema>;
export type GTFSStopTimeImport = z.infer<typeof GTFSStopTimeSchema>;
export type GTFSFeedInfoImport = z.infer<typeof GTFSFeedInfoSchema>;

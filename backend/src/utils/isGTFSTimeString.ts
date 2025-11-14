/** Since transit services can end past midnight, this time is often represented as going past the 24 hour cycle - like 25.
 *  This function checks if a string is a valid GTFS time string because we cannot use regular datetime.
 */

/**
 * A branded type for a GTFS time string (e.g., "25:10:00").
 * It is a 'string' at runtime but treated as a unique type
 * by the TypeScript compiler.
 */
export type GTFSTimeString = string & { readonly __brand: 'GtfsTimeString' };

/**
 * A simple regex to validate the HH:MM:SS format.
 * (e.g., "25", "48").
 */
const gtfsTimeRegex = /^\d{2}:\d{2}:\d{2}$/;

/**
 * This checks if the value is a string and matches the
 * GTFS time format (e.g., "25:30:00").
 *
 * @param value The value to check.
 * @returns True if the value is a GtfsTimeString, false otherwise.
 */
export function isGtfsTimeString(value: unknown): value is GTFSTimeString {
  // 1. Check if it's a string
  if (typeof value !== 'string') {
    return false;
  }

  // 2. Check if it matches the GTFS time format
  return gtfsTimeRegex.test(value);
}

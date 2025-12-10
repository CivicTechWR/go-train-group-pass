import { gtfsDateStringToDate } from './gtfsDateStringToDate';
import { GTFSTimeString } from './isGTFSTimeString';
import { createDateTimeInTransitTimezone } from './date.utils';

export function getDateTimeFromServiceIdGTFSTimeString(
  serviceID: string,
  timeString: GTFSTimeString,
): Date {
  // 1. Get the base date in the transit timezone (UTC timestamp for 00:00 Transit Time)
  const baseDate = gtfsDateStringToDate(serviceID);

  const [hours, minutes, seconds] = timeString.split(':').map(Number);

  const extraDays = Math.floor(hours / 24);
  const normalizedHours = hours % 24;

  // Use UTC date methods to increment the day while preserving the time-of-day (00:00:00)
  // which represents "Start of Day" in the Transit Timezone (as mapped by baseDate).
  const targetDate = new Date(baseDate);
  targetDate.setUTCDate(targetDate.getUTCDate() + extraDays);

  const hoursStr = String(normalizedHours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  const normalizedTimeString = `${hoursStr}:${minutesStr}:${secondsStr}`;

  return createDateTimeInTransitTimezone(targetDate, normalizedTimeString);
}

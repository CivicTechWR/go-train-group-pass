import { gtfsDateStringToDate } from './gtfsDateStringToDate';
import { GTFSTimeString } from './isGTFSTimeString';
import { fromZonedTime } from 'date-fns-tz';

export function getDateTimeFromServiceIdGTFSTimeString(
  serviceID: string,
  timeString: GTFSTimeString,
): Date {
  const date = gtfsDateStringToDate(serviceID);
  const [hours, minutes, seconds] = timeString.split(':').map(Number);

  // GTFS times can exceed 24 hours (e.g., 25:30:00 meant 1:30 AM the next day)
  const extraDays = Math.floor(hours / 24);
  const normalizedHours = hours % 24;

  const resultDate = new Date(date);
  resultDate.setDate(resultDate.getDate() + extraDays);

  const year = resultDate.getFullYear();
  const month = String(resultDate.getMonth() + 1).padStart(2, '0');
  const day = String(resultDate.getDate()).padStart(2, '0');
  const hoursStr = String(normalizedHours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');

  // Construct valid ISO string without timezone info
  const isoString = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:${secondsStr}`;

  // Convert from Toronto time to UTC
  return fromZonedTime(isoString, 'America/Toronto');
}

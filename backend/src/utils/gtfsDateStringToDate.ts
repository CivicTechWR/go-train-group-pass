import { createDateInTransitTimezone } from './date.utils';

export function gtfsDateStringToDate(dateStr: string): Date {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  // Format as YYYY-MM-DD
  const formattedDateStr = `${year}-${month}-${day}`;

  return createDateInTransitTimezone(formattedDateStr);
}

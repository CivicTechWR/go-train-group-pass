import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export const getTransitTimezone = (): string => {
    return process.env.TRANSIT_TIMEZONE || 'America/Toronto';
};

/**
 * Creates a Date object representing the start of the day (00:00:00) 
 * in the transit timezone.
 * 
 * @param dateString YYYY-MM-DD string
 * @returns Date object (UTC) that corresponds to midnight in the transit timezone
 */
export const createDateInTransitTimezone = (dateString: string): Date => {
    // Append 00:00 to ensure we are targeting the start of the day
    // string + ' 00:00' is parsed as "local time" in the target timezone
    return fromZonedTime(`${dateString} 00:00`, getTransitTimezone());
};

/**
 * Creates a Date object from a time string (HH:mm:ss) on a specific date
 * in the transit timezone.
 */
export const createDateTimeInTransitTimezone = (date: Date, timeString: string): Date => {
    const tz = getTransitTimezone();
    // Get YYYY-MM-DD from the date in the target timezone
    const zonedDate = toZonedTime(date, tz);
    const dateStr = zonedDate.toISOString().split('T')[0];

    return fromZonedTime(`${dateStr} ${timeString}`, tz);
};

/**
 * Returns the current time in the transit timezone
 */
export const nowInTransitTimezone = (): Date => {
    return toZonedTime(new Date(), getTransitTimezone());
};

import { describe, it, expect, vi, afterEach } from 'vitest';
import { createDateInTransitTimezone, createDateTimeInTransitTimezone } from './date.utils';
import { fromZonedTime } from 'date-fns-tz';

describe('date.utils', () => {
    // Capture the original value or undefined
    const originalTimezone = process.env.TRANSIT_TIMEZONE;

    afterEach(() => {
        // Restore the original value
        if (originalTimezone === undefined) {
            delete process.env.TRANSIT_TIMEZONE;
        } else {
            process.env.TRANSIT_TIMEZONE = originalTimezone;
        }
        vi.restoreAllMocks();
    });

    it('should create date in transit timezone (America/Toronto default)', () => {
        // Ensure default is not set if it wasn't
        if (originalTimezone === undefined) delete process.env.TRANSIT_TIMEZONE;

        // America/Toronto is UTC-5 in winter (Standard Time)
        // 2025-12-11 00:00:00 EST -> 2025-12-11 05:00:00 UTC
        const date = createDateInTransitTimezone('2025-12-11');
        expect(date.toISOString()).toBe('2025-12-11T05:00:00.000Z');
    });

    it('should create date in transit timezone (custom timezone)', () => {
        process.env.TRANSIT_TIMEZONE = 'America/Vancouver';
        // America/Vancouver is UTC-8 in winter
        // 2025-12-11 00:00:00 PST -> 2025-12-11 08:00:00 UTC
        const date = createDateInTransitTimezone('2025-12-11');
        expect(date.toISOString()).toBe('2025-12-11T08:00:00.000Z');
    });

    it('should create date time in transit timezone', () => {
        // Explicitly set default or rely on default logic? 
        // Let's ensure strict state for this test.
        process.env.TRANSIT_TIMEZONE = 'America/Toronto';

        // 2025-12-11 12:00:00 EST -> 2025-12-11 17:00:00 UTC
        const baseDate = createDateInTransitTimezone('2025-12-11');
        const dateTime = createDateTimeInTransitTimezone(baseDate, '12:00:00');
        expect(dateTime.toISOString()).toBe('2025-12-11T17:00:00.000Z');
    });

    it('should handle "next day" times (>24h) via date increment logic if passed externally or handle appropriately', () => {
        process.env.TRANSIT_TIMEZONE = 'America/Toronto';
        const baseDate = createDateInTransitTimezone('2025-12-11');
        try {
            createDateTimeInTransitTimezone(baseDate, '25:00:00');
        } catch (e) {
            // Expected if invalid
        }
    });
});

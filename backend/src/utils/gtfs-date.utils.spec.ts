import { describe, it, expect, afterEach } from 'vitest';
import { gtfsDateStringToDate } from './gtfsDateStringToDate';
import { getDateTimeFromServiceIdGTFSTimeString } from './getDateTimeFromServiceIdGTFSTimeString';
import { GTFSTimeString } from './isGTFSTimeString';

describe('GTFS Date Utilities - Timezone Awareness', () => {
  const originalTimezone = process.env.TRANSIT_TIMEZONE;

  afterEach(() => {
    // Restore the original value
    if (originalTimezone === undefined) {
      delete process.env.TRANSIT_TIMEZONE;
    } else {
      process.env.TRANSIT_TIMEZONE = originalTimezone;
    }
  });

  describe('gtfsDateStringToDate', () => {
    it('should convert GTFS date string to Date using default timezone (America/Toronto)', () => {
      delete process.env.TRANSIT_TIMEZONE;
      
      // GTFS format: "20251211"
      // Should become 2025-12-11 00:00:00 in America/Toronto
      // America/Toronto is UTC-5 in winter (EST)
      // So the UTC time should be 2025-12-11 05:00:00Z
      const result = gtfsDateStringToDate('20251211');
      expect(result.toISOString()).toBe('2025-12-11T05:00:00.000Z');
    });

    it('should convert GTFS date string to Date using custom timezone', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Vancouver';
      
      // America/Vancouver is UTC-8 in winter (PST)
      // 2025-12-11 00:00:00 PST -> 2025-12-11 08:00:00 UTC
      const result = gtfsDateStringToDate('20251211');
      expect(result.toISOString()).toBe('2025-12-11T08:00:00.000Z');
    });

    it('should convert GTFS date string during DST transition', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Toronto';
      
      // June 15, 2025 is during DST (EDT, UTC-4)
      // 2025-06-15 00:00:00 EDT -> 2025-06-15 04:00:00 UTC
      const result = gtfsDateStringToDate('20250615');
      expect(result.toISOString()).toBe('2025-06-15T04:00:00.000Z');
    });

    it('should handle different date formats correctly', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Toronto';
      
      const result1 = gtfsDateStringToDate('20250101'); // Jan 1
      expect(result1.toISOString()).toBe('2025-01-01T05:00:00.000Z');
      
      const result2 = gtfsDateStringToDate('20251231'); // Dec 31
      expect(result2.toISOString()).toBe('2025-12-31T05:00:00.000Z');
    });
  });

  describe('getDateTimeFromServiceIdGTFSTimeString', () => {
    it('should convert service ID and time string using default timezone', () => {
      delete process.env.TRANSIT_TIMEZONE;
      
      // Service ID: "20251211", Time: "12:30:00"
      // Should become 2025-12-11 12:30:00 in America/Toronto (EST)
      // America/Toronto is UTC-5 in winter
      // So the UTC time should be 2025-12-11 17:30:00Z
      const result = getDateTimeFromServiceIdGTFSTimeString('20251211', '12:30:00' as GTFSTimeString);
      expect(result.toISOString()).toBe('2025-12-11T17:30:00.000Z');
    });

    it('should convert service ID and time string using custom timezone', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Vancouver';
      
      // America/Vancouver is UTC-8 in winter (PST)
      // 2025-12-11 12:30:00 PST -> 2025-12-11 20:30:00 UTC
      const result = getDateTimeFromServiceIdGTFSTimeString('20251211', '12:30:00' as GTFSTimeString);
      expect(result.toISOString()).toBe('2025-12-11T20:30:00.000Z');
    });

    it('should handle midnight correctly', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Toronto';
      
      // 2025-12-11 00:00:00 EST -> 2025-12-11 05:00:00 UTC
      const result = getDateTimeFromServiceIdGTFSTimeString('20251211', '00:00:00' as GTFSTimeString);
      expect(result.toISOString()).toBe('2025-12-11T05:00:00.000Z');
    });

    it('should handle next-day service (25:00:00) correctly', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Toronto';
      
      // GTFS allows times >= 24:00 to indicate service that crosses midnight
      // "20251211" with "25:00:00" means 01:00:00 on 2025-12-12
      // 2025-12-12 01:00:00 EST -> 2025-12-12 06:00:00 UTC
      const result = getDateTimeFromServiceIdGTFSTimeString('20251211', '25:00:00' as GTFSTimeString);
      expect(result.toISOString()).toBe('2025-12-12T06:00:00.000Z');
    });

    it('should handle next-day service (26:30:45) correctly', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Toronto';
      
      // "20251211" with "26:30:45" means 02:30:45 on 2025-12-12
      // 2025-12-12 02:30:45 EST -> 2025-12-12 07:30:45 UTC
      const result = getDateTimeFromServiceIdGTFSTimeString('20251211', '26:30:45' as GTFSTimeString);
      expect(result.toISOString()).toBe('2025-12-12T07:30:45.000Z');
    });

    it('should handle two-day-later service (48:00:00) correctly', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Toronto';
      
      // "20251211" with "48:00:00" means 00:00:00 on 2025-12-13
      // 2025-12-13 00:00:00 EST -> 2025-12-13 05:00:00 UTC
      const result = getDateTimeFromServiceIdGTFSTimeString('20251211', '48:00:00' as GTFSTimeString);
      expect(result.toISOString()).toBe('2025-12-13T05:00:00.000Z');
    });

    it('should handle late evening times correctly', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Toronto';
      
      // 2025-12-11 23:59:59 EST -> 2025-12-12 04:59:59 UTC
      const result = getDateTimeFromServiceIdGTFSTimeString('20251211', '23:59:59' as GTFSTimeString);
      expect(result.toISOString()).toBe('2025-12-12T04:59:59.000Z');
    });

    it('should handle times during DST transition', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Toronto';
      
      // June 15, 2025 is during DST (EDT, UTC-4)
      // 2025-06-15 12:30:00 EDT -> 2025-06-15 16:30:00 UTC
      const result = getDateTimeFromServiceIdGTFSTimeString('20250615', '12:30:00' as GTFSTimeString);
      expect(result.toISOString()).toBe('2025-06-15T16:30:00.000Z');
    });

    it('should handle next-day service during DST correctly', () => {
      process.env.TRANSIT_TIMEZONE = 'America/Toronto';
      
      // June 15, 2025 is during DST (EDT, UTC-4)
      // "20250615" with "25:30:00" means 01:30:00 on 2025-06-16
      // 2025-06-16 01:30:00 EDT -> 2025-06-16 05:30:00 UTC
      const result = getDateTimeFromServiceIdGTFSTimeString('20250615', '25:30:00' as GTFSTimeString);
      expect(result.toISOString()).toBe('2025-06-16T05:30:00.000Z');
    });
  });

  describe('Integration: Multiple timezone scenarios', () => {
    it('should produce consistent results across different timezones', () => {
      // Test with America/Toronto
      process.env.TRANSIT_TIMEZONE = 'America/Toronto';
      const toronto1 = getDateTimeFromServiceIdGTFSTimeString('20251211', '12:00:00' as GTFSTimeString);
      const toronto2 = getDateTimeFromServiceIdGTFSTimeString('20251211', '25:00:00' as GTFSTimeString);
      
      // Test with America/Vancouver
      process.env.TRANSIT_TIMEZONE = 'America/Vancouver';
      const vancouver1 = getDateTimeFromServiceIdGTFSTimeString('20251211', '12:00:00' as GTFSTimeString);
      const vancouver2 = getDateTimeFromServiceIdGTFSTimeString('20251211', '25:00:00' as GTFSTimeString);
      
      // Vancouver is 3 hours behind Toronto in winter
      // So all Vancouver times should be 3 hours later in UTC
      expect(vancouver1.getTime() - toronto1.getTime()).toBe(3 * 60 * 60 * 1000);
      expect(vancouver2.getTime() - toronto2.getTime()).toBe(3 * 60 * 60 * 1000);
    });

    it('should ensure all operations respect TRANSIT_TIMEZONE', () => {
      process.env.TRANSIT_TIMEZONE = 'Europe/London';
      
      // Europe/London is UTC+0 in winter (GMT)
      // 2025-12-11 12:30:00 GMT -> 2025-12-11 12:30:00 UTC
      const result = getDateTimeFromServiceIdGTFSTimeString('20251211', '12:30:00' as GTFSTimeString);
      expect(result.toISOString()).toBe('2025-12-11T12:30:00.000Z');
    });
  });
});

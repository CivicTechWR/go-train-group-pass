import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import JSZip from 'jszip';
import {
  Agency,
  GTFSRoute,
  GTFSStop,
  GTFSTrip,
  GTFSStopTime,
  GTFSCalendarDate,
} from '../entities';
import { EntityManager } from '@mikro-orm/postgresql';

interface GtfsFiles {
  [filename: string]: string;
}

@Injectable()
export class GtfsService {
  private readonly logger = new Logger(GtfsService.name);
  private latestGtfsFiles: GtfsFiles = {};
  private isDownloading = false;
  private etag?: string;
  private lastModified?: string;

  // 30s timeout; tune as needed
  private axiosOptions = {
    responseType: 'arraybuffer' as const,
    timeout: 30_000,
    headers: {},
  };

  private gtfsUrl: string;

  constructor(
    private readonly em: EntityManager,
    private readonly configService?: ConfigService,
  ) {
    this.gtfsUrl =
      this.configService?.get<string>('GTFS_URL') ||
      'https://assets.metrolinx.com/raw/upload/Documents/Metrolinx/Open%20Data/GO-GTFS.zip';
  }

  async downloadGtfs(): Promise<GtfsFiles | null> {
    if (this.isDownloading) {
      this.logger.log('Download already in progress; skipping concurrent run.');
      return null;
    }

    this.isDownloading = true;
    try {
      const headers: Record<string, string> = {};
      if (this.etag) headers['If-None-Match'] = this.etag;
      if (this.lastModified) headers['If-Modified-Since'] = this.lastModified;

      this.logger.log('Downloading GTFS zip file...');
      const resp = await axios.get<ArrayBuffer>(this.gtfsUrl, {
        ...this.axiosOptions,
        headers,
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
      });

      // Explicitly assert the type since axios types are not fully compatible with strict mode
      const status = resp.status;
      const responseHeaders = resp.headers as Record<
        string,
        string | undefined
      >;
      const data = resp.data;

      if (status === 304) {
        this.logger.log(
          'GTFS not modified (304). Keeping existing in-memory files.',
        );
        return this.getLatestGtfsFiles(); // returns defensive copy
      }

      // Save ETag / Last-Modified for conditional requests
      if (responseHeaders['etag']) {
        this.etag = String(responseHeaders['etag']);
      }

      if (responseHeaders['last-modified']) {
        this.lastModified = String(responseHeaders['last-modified']);
      }

      this.logger.log(
        `Downloaded GTFS zip (${status}).
        
        Extracting...`,
      );

      const buffer = Buffer.from(data);
      const zip = await JSZip.loadAsync(buffer);

      const files: GtfsFiles = {};
      for (const [name, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          // small scale: load as string. If large, consider streaming or selective files.
          files[name] = await file.async('string');
        }
      }

      this.latestGtfsFiles = files;
      this.logger.log(
        `Downloaded and extracted ${Object.keys(files).length} GTFS files to memory`,
      );
      return this.getLatestGtfsFiles();
    } catch (err: unknown) {
      this.logger.error('Failed to download or extract GTFS zip', err);
      return null;
    } finally {
      this.isDownloading = false;
    }
  }

  // Return a defensive shallow copy to avoid external mutation
  getLatestGtfsFiles(): GtfsFiles {
    return { ...this.latestGtfsFiles };
  }

  /**
   * Download GTFS data and import it into the database
   */
  async downloadAndImportToDatabase(): Promise<void> {
    this.logger.log('Starting GTFS download and database import...');

    // 1. Download the files
    const files = await this.downloadGtfs();
    if (!files) {
      throw new Error('Failed to download GTFS files');
    }

    // 2. Parse CSV files into objects
    const parsedData = {
      agencies: this.parseCSV(files['agency.txt']),
      calendarDates: this.parseCSV(files['calendar_dates.txt']),
      routes: this.parseCSV(files['routes.txt']),
      stops: this.parseCSV(files['stops.txt']),
      trips: this.parseCSV(files['trips.txt']),
      stopTimes: this.parseCSV(files['stop_times.txt']),
    };

    // 3. Clear old data
    this.logger.log('Clearing existing GTFS data from database...');
    await this.clearGTFSData();

    // 4. Import into database
    this.logger.log('Importing GTFS data into database...');
    await this.importAgencies(parsedData.agencies);
    await this.importCalendarDates(parsedData.calendarDates);
    await this.importRoutes(parsedData.routes);
    await this.importStops(parsedData.stops);
    await this.importTrips(parsedData.trips);
    await this.importStopTimes(parsedData.stopTimes);

    this.logger.log('GTFS import to database completed successfully!');
  }

  /**
   * Parse CSV string into array of objects
   */
  private parseCSV(content: string | undefined): any[] {
    if (!content) return [];

    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]);
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = this.parseCSVLine(lines[i]);
      const obj: any = {};

      headers.forEach((header, index) => {
        obj[header] = values[index] || undefined;
      });

      result.push(obj);
    }

    return result;
  }

  /**
   * Parse a single CSV line, handling quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Clear all GTFS data from database
   */
  private async clearGTFSData(): Promise<void> {
    await this.em.nativeDelete(GTFSStopTime, {});
    await this.em.nativeDelete(GTFSTrip, {});
    await this.em.nativeDelete(GTFSStop, {});
    await this.em.nativeDelete(GTFSRoute, {});
    await this.em.nativeDelete(GTFSCalendarDate, {});
    await this.em.nativeDelete(Agency, {});
  }

  /**
   * Import agencies into database
   */
  private async importAgencies(agencies: any[]): Promise<void> {
    if (!agencies.length) return;

    this.logger.log(`Importing ${agencies.length} agencies...`);
    const batchSize = 100;

    for (let i = 0; i < agencies.length; i += batchSize) {
      const batch = agencies.slice(i, i + batchSize);
      const entities = batch.map((row) =>
        this.em.create(Agency, {
          id: row.agency_id,
          agencyName: row.agency_name,
          agencyUrl: row.agency_url,
          agencyTimezone: row.agency_timezone,
          agencyLang: row.agency_lang,
          agencyPhone: row.agency_phone,
        }),
      );
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Import calendar dates into database
   */
  private async importCalendarDates(calendarDates: any[]): Promise<void> {
    if (!calendarDates.length) return;

    this.logger.log(`Importing ${calendarDates.length} calendar dates...`);
    const batchSize = 500;

    for (let i = 0; i < calendarDates.length; i += batchSize) {
      const batch = calendarDates.slice(i, i + batchSize);
      const entities = batch.map((row) => {
        const dateStr = row.date.toString();
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        const date = new Date(year, month, day);

        return this.em.create(GTFSCalendarDate, {
          serviceId: row.service_id,
          date: date,
          exceptionType: parseInt(row.exception_type),
        });
      });
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Import routes into database
   */
  private async importRoutes(routes: any[]): Promise<void> {
    if (!routes.length) return;

    this.logger.log(`Importing ${routes.length} routes...`);
    const batchSize = 100;

    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      const entities = await Promise.all(
        batch.map(async (row) => {
          const agency = row.agency_id
            ? await this.em.findOne(Agency, { id: row.agency_id })
            : null;

          return this.em.create(GTFSRoute, {
            id: row.route_id,
            routeShortName: row.route_short_name,
            routeLongName: row.route_long_name,
            routeDesc: row.route_desc,
            routeType: parseInt(row.route_type),
            routeUrl: row.route_url,
            routeColor: row.route_color,
            routeTextColor: row.route_text_color,
            agency: agency || undefined,
          });
        }),
      );
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Import stops into database
   */
  private async importStops(stops: any[]): Promise<void> {
    if (!stops.length) return;

    this.logger.log(`Importing ${stops.length} stops...`);
    const batchSize = 500;

    for (let i = 0; i < stops.length; i += batchSize) {
      const batch = stops.slice(i, i + batchSize);
      const entities = batch.map((row) =>
        this.em.create(GTFSStop, {
          id: row.stop_id,
          stopName: row.stop_name,
          stopDesc: row.stop_desc,
          stopLat: parseFloat(row.stop_lat),
          stopLon: parseFloat(row.stop_lon),
          zoneId: row.zone_id,
          stopUrl: row.stop_url,
          locationType: row.location_type
            ? parseInt(row.location_type)
            : undefined,
          parentStation: row.parent_station,
          wheelchairBoarding: row.wheelchair_boarding
            ? parseInt(row.wheelchair_boarding)
            : undefined,
        }),
      );
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Import trips into database
   */
  private async importTrips(trips: any[]): Promise<void> {
    if (!trips.length) return;

    this.logger.log(`Importing ${trips.length} trips...`);
    const batchSize = 500;

    for (let i = 0; i < trips.length; i += batchSize) {
      const batch = trips.slice(i, i + batchSize);
      const entities = await Promise.all(
        batch.map(async (row) => {
          const route = await this.em.findOne(GTFSRoute, { id: row.route_id });
          const calendarDate = await this.em.findOne(GTFSCalendarDate, {
            serviceId: row.service_id,
          });

          return this.em.create(GTFSTrip, {
            id: row.trip_id,
            calendarDate: calendarDate!,
            tripHeadsign: row.trip_headsign,
            tripShortName: row.trip_short_name,
            directionId: row.direction_id
              ? parseInt(row.direction_id)
              : undefined,
            blockId: row.block_id,
            shapeId: row.shape_id,
            wheelchairAccessible: row.wheelchair_accessible
              ? parseInt(row.wheelchair_accessible)
              : undefined,
            bikesAllowed: row.bikes_allowed
              ? parseInt(row.bikes_allowed)
              : undefined,
            route: route!,
          });
        }),
      );
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Import stop times into database
   */
  private async importStopTimes(stopTimes: any[]): Promise<void> {
    if (!stopTimes.length) return;

    this.logger.log(`Importing ${stopTimes.length} stop times...`);
    const batchSize = 1000;

    for (let i = 0; i < stopTimes.length; i += batchSize) {
      const batch = stopTimes.slice(i, i + batchSize);
      const entities = await Promise.all(
        batch.map(async (row) => {
          const trip = await this.em.findOne(GTFSTrip, { id: row.trip_id });
          const stop = await this.em.findOne(GTFSStop, { id: row.stop_id });

          return this.em.create(GTFSStopTime, {
            id: row.trip_id,
            stopSequence: parseInt(row.stop_sequence),
            arrivalTime: row.arrival_time,
            departureTime: row.departure_time,
            stopHeadsign: row.stop_headsign,
            pickupType: row.pickup_type ? parseInt(row.pickup_type) : undefined,
            dropOffType: row.drop_off_type
              ? parseInt(row.drop_off_type)
              : undefined,
            shapeDistTraveled: row.shape_dist_traveled
              ? parseFloat(row.shape_dist_traveled)
              : undefined,
            timepoint: row.timepoint ? parseInt(row.timepoint) : undefined,
            stop: stop!,
            trip: trip!,
          });
        }),
      );
      await this.em.persistAndFlush(entities);
    }
  }
}

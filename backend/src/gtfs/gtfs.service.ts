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
  GTFSFeedInfo,
} from '../entities';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  GTFSAgencyImport,
  GTFSCalendarDatesImport,
  GTFSRoutesImport,
  GTFSStopsImport,
  GTFSStopTimesImport,
  GTFSTripsImport,
} from './gtfs-import.types';

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
    @InjectRepository(Agency)
    private readonly agencyRepository: EntityRepository<Agency>,
    @InjectRepository(GTFSRoute)
    private readonly routeRepository: EntityRepository<GTFSRoute>,
    @InjectRepository(GTFSStop)
    private readonly stopRepository: EntityRepository<GTFSStop>,
    @InjectRepository(GTFSTrip)
    private readonly tripRepository: EntityRepository<GTFSTrip>,
    @InjectRepository(GTFSStopTime)
    private readonly stopTimeRepository: EntityRepository<GTFSStopTime>,
    @InjectRepository(GTFSCalendarDate)
    private readonly calendarDateRepository: EntityRepository<GTFSCalendarDate>,
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
   * Parse CSV string into array of objects
   */
  private parseCSV(
    content: string | undefined,
  ): { [key: string]: string | undefined }[] {
    if (!content) return [];

    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]);
    const result: { [key: string]: string | undefined }[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = this.parseCSVLine(lines[i]);
      const obj: { [key: string]: string | undefined } = {};

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
   * Import agencies into database
   */
  private async importAgencies(agencies: GTFSAgencyImport[]): Promise<void> {
    if (!agencies.length) return;

    this.logger.log(`Importing ${agencies.length} agencies...`);
    const batchSize = 100;
    const agencyRepo = this.em.getRepository(Agency);

    for (let i = 0; i < agencies.length; i += batchSize) {
      const batch = agencies.slice(i, i + batchSize);
      const entities = batch.map((row) =>
        agencyRepo.create({
          agencyId: row.agency_id ?? '',
          agencyName: row.agency_name,
          agencyUrl: row.agency_url,
          agencyTimezone: row.agency_timezone,
          agencyLang: row.agency_lang ?? undefined,
          agencyPhone: row.agency_phone ?? undefined,
        }),
      );
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Import calendar dates into database
   */
  private async importCalendarDates(
    calendarDates: GTFSCalendarDatesImport[],
    feedInfo: GTFSFeedInfo,
  ): Promise<void> {
    if (!calendarDates.length) return;

    this.logger.log(`Importing ${calendarDates.length} calendar dates...`);
    const batchSize = 500;
    const calendarDateRepo = this.em.getRepository(GTFSCalendarDate);

    for (let i = 0; i < calendarDates.length; i += batchSize) {
      const batch = calendarDates.slice(i, i + batchSize);
      const entities = batch.map((row) => {
        const dateStr = row.date.toString();
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        const date = new Date(year, month, day);

        return calendarDateRepo.create({
          serviceId: row.service_id,
          date: date,
          exceptionType: parseInt(row.exception_type),
          GTFSFeedInfo: feedInfo,
        });
      });
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Import routes into database
   */
  private async importRoutes(
    routes: GTFSRoutesImport[],
    feedInfo: GTFSFeedInfo,
  ): Promise<void> {
    if (!routes.length) return;

    this.logger.log(`Importing ${routes.length} routes...`);
    const batchSize = 100;
    const routeRepo = this.em.getRepository(GTFSRoute);
    const agencyRepo = this.em.getRepository(Agency);

    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      const entities = await Promise.all(
        batch.map(async (row) => {
          const agency = row.agency_id
            ? await agencyRepo.findOne({ agencyId: row.agency_id })
            : null;

          return routeRepo.create({
            route_id: row.route_id ?? '',
            routeShortName: row.route_short_name,
            routeLongName: row.route_long_name,
            routeDesc: row.route_desc ?? undefined,
            routeType: parseInt(row.route_type),
            routeUrl: row.route_url ?? undefined,
            routeColor: row.route_color ?? undefined,
            routeTextColor: row.route_text_color ?? undefined,
            agency: agency ?? undefined,
            GTFSFeedInfo: feedInfo,
          });
        }),
      );
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Import stops into database
   */
  private async importStops(
    stops: GTFSStopsImport[],
    feedInfo: GTFSFeedInfo,
  ): Promise<void> {
    if (!stops.length) return;

    this.logger.log(`Importing ${stops.length} stops...`);
    const batchSize = 500;
    const stopRepo = this.em.getRepository(GTFSStop);

    for (let i = 0; i < stops.length; i += batchSize) {
      const batch = stops.slice(i, i + batchSize);
      const entities = batch.map((row) =>
        stopRepo.create({
          stopid: row.stop_id ?? '',
          stopName: row.stop_name,
          stopDesc: row.stop_desc ?? undefined,
          stopLat: parseFloat(row.stop_lat),
          stopLon: parseFloat(row.stop_lon),
          zoneId: row.zone_id ?? undefined,
          stopUrl: row.stop_url ?? undefined,
          locationType: row.location_type
            ? parseInt(row.location_type)
            : undefined,
          parentStation: row.parent_station ?? undefined,
          wheelchairBoarding: row.wheelchair_boarding
            ? parseInt(row.wheelchair_boarding)
            : undefined,
          GTFSFeedInfo: feedInfo,
        }),
      );
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Import trips into database
   */
  private async importTrips(
    trips: GTFSTripsImport[],
    feedInfo: GTFSFeedInfo,
  ): Promise<void> {
    if (!trips.length) return;

    this.logger.log(`Importing ${trips.length} trips...`);
    const batchSize = 500;
    const tripRepo = this.em.getRepository(GTFSTrip);
    const routeRepo = this.em.getRepository(GTFSRoute);
    const calendarDateRepo = this.em.getRepository(GTFSCalendarDate);

    for (let i = 0; i < trips.length; i += batchSize) {
      const batch = trips.slice(i, i + batchSize);
      const entities = await Promise.all(
        batch.map(async (row) => {
          const route = await routeRepo.findOne({
            route_id: row.route_id ?? '',
          });
          const calendarDate = await calendarDateRepo.findOne({
            serviceId: row.service_id ?? '',
          });

          return tripRepo.create({
            trip_id: row.trip_id ?? '',
            calendarDate: calendarDate!,
            tripHeadsign: row.trip_headsign ?? undefined,
            tripShortName: row.trip_short_name ?? undefined,
            directionId: row.direction_id
              ? parseInt(row.direction_id)
              : undefined,
            blockId: row.block_id ?? undefined,
            shapeId: row.shape_id ?? undefined,
            wheelchairAccessible: row.wheelchair_accessible
              ? parseInt(row.wheelchair_accessible)
              : undefined,
            bikesAllowed: row.bikes_allowed
              ? parseInt(row.bikes_allowed)
              : undefined,
            route: route!,
            GTFSFeedInfo: feedInfo,
          });
        }),
      );
      await this.em.persistAndFlush(entities);
    }
  }

  /**
   * Import stop times into database
   */
  private async importStopTimes(
    stopTimes: GTFSStopTimesImport[],
    feedInfo: GTFSFeedInfo,
  ): Promise<void> {
    if (!stopTimes.length) return;

    this.logger.log(`Importing ${stopTimes.length} stop times...`);
    const batchSize = 1000;
    const stopTimeRepo = this.em.getRepository(GTFSStopTime);
    const tripRepo = this.em.getRepository(GTFSTrip);
    const stopRepo = this.em.getRepository(GTFSStop);

    for (let i = 0; i < stopTimes.length; i += batchSize) {
      const batch = stopTimes.slice(i, i + batchSize);
      const entities = await Promise.all(
        batch.map(async (row) => {
          const trip = await tripRepo.findOne({ trip_id: row.trip_id ?? '' });
          const stop = await stopRepo.findOne({ stopid: row.stop_id ?? '' });

          return stopTimeRepo.create({
            stop_time_id: `${row.trip_id ?? ''}_${row.stop_sequence}`,
            stopSequence: parseInt(row.stop_sequence),
            arrivalTime: row.arrival_time,
            departureTime: row.departure_time,
            stopHeadsign: row.stop_headsign ?? undefined,
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
            GTFSFeedInfo: feedInfo,
          });
        }),
      );
      await this.em.persistAndFlush(entities);
    }
  }
}

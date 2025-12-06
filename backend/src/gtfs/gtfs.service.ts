import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ZodType } from 'zod';
import {
  Agency,
  GTFSRoute,
  GTFSStop,
  GTFSTrip,
  GTFSStopTime,
  GTFSCalendarDate,
} from '../entities';
import {
  CreateRequestContext,
  EntityManager,
  EntityRepository,
} from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';

import {
  GTFSAgencyImport,
  GTFSAgencySchema,
  GTFSCalendarDateImport,
  GTFSCalendarDateSchema,
  GTFSFeedInfoSchema,
  GTFSRouteImport,
  GTFSRouteSchema,
  GTFSStopImport,
  GTFSStopSchema,
  GTFSStopTimeImport,
  GTFSStopTimeSchema,
  GTFSTripImport,
  GTFSTripSchema,
} from './gtfs.schemas';
import { GTFSFeedInfo } from 'src/entities/gtfs_feed_info.entity';
import { parseCsvWithSchema } from 'src/utils/parseCSVWithZod';
import { gtfsDateStringToDate } from 'src/utils/gtfsDateStringToDate';

interface GtfsFiles {
  [filename: string]: string;
}

export enum DownloadAndImportGTFSDataResult {
  FEED_EXISTS = 'FEED_EXISTS',
  FEED_UPDATED = 'FEED_UPDATED',
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
    @InjectRepository(GTFSFeedInfo)
    private readonly feedInfoRepository: EntityRepository<GTFSFeedInfo>,
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

      const extractDir = path.join(os.tmpdir(), 'gtfs-data');
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
      }

      const files: GtfsFiles = {};
      for (const [name, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          const filePath = path.join(extractDir, name);
          const content = await file.async('nodebuffer');
          fs.writeFileSync(filePath, content);
          files[name] = filePath;
        }
      }

      this.latestGtfsFiles = files;
      this.logger.log(
        `Downloaded and extracted ${Object.keys(files).length} GTFS files to ${extractDir}`,
      );
      return this.getLatestGtfsFiles();
    } catch (err: unknown) {
      this.logger.error('Failed to download or extract GTFS zip', err);
    } finally {
      this.isDownloading = false;
    }
    return this.getLatestGtfsFiles();
  }

  getLatestGtfsFiles(): GtfsFiles {
    return { ...this.latestGtfsFiles };
  }

  @CreateRequestContext()
  async downloadAndImportToDatabase() {
    const files = await this.downloadGtfs();
    if (!files) return;

    const {
      feedInfoData,
      agencyData,
      calendarDatesData,
      routeData,
      stopData,
      tripData,
      stopTimeData,
    } = this.validateAllFiles(files);
    if (feedInfoData.length === 0) {
      throw new Error('No feed info found in GTFS zip');
    }
    if (feedInfoData.length > 1) {
      throw new Error(
        'Supporting more than one feed info per upload is not supported',
      );
    }

    const validatedFeed = feedInfoData[0];
    const feedInfo = await this.feedInfoRepository.findOne({
      feedVersion: validatedFeed.feed_version,
    });

    if (feedInfo && feedInfo.isActive) {
      this.logger.log(
        `Feed info already exists for version ${validatedFeed.feed_version}`,
      );
      return DownloadAndImportGTFSDataResult.FEED_EXISTS;
    }

    if (feedInfo && !feedInfo.isActive) {
      this.logger.log(
        `Feed info already exists for version ${validatedFeed.feed_version} but is inactive; assuming corruption and re-importing.`,
      );
      await this.feedInfoRepository.nativeDelete(feedInfo);
    }

    const newFeed = this.feedInfoRepository.create({
      feedPublisherName: validatedFeed.feed_publisher_name,
      feedPublisherUrl: validatedFeed.feed_publisher_url,
      feedLang: validatedFeed.feed_lang,
      feedStartDate: gtfsDateStringToDate(validatedFeed.feed_start_date), // "20251201"
      feedEndDate: gtfsDateStringToDate(validatedFeed.feed_end_date), // "20260101"
      feedVersion: validatedFeed.feed_version,
      isActive: false,
    });

    await this.feedInfoRepository.getEntityManager().persistAndFlush(newFeed);
    this.logger.log(`Created new Feed Version: ID ${newFeed.id}`);

    try {
      const agencyMap = await this.importAgencies(agencyData, newFeed);
      await this.importCalendarDates(calendarDatesData, newFeed);
      const routeMap = await this.importRoutes(routeData, newFeed, agencyMap);
      const stopMap = await this.importStops(stopData, newFeed);
      const tripMap = await this.importTrips(tripData, newFeed, routeMap);
      await this.importStopTimes(stopTimeData, newFeed, stopMap, tripMap);
    } catch (err) {
      this.logger.error('Error during GTFS import; rolling back.', err);
      if (newFeed && newFeed.id) {
        this.logger.log(`Cleaning up broken feed ${newFeed.id}...`);
        // using native delete because it's faster
        await this.feedInfoRepository.nativeDelete(newFeed);
      }
      throw err;
    }

    this.logger.log(`Import Complete. Marking Feed ${newFeed.id} as active.`);
    newFeed.isActive = true;
    await this.feedInfoRepository.getEntityManager().persistAndFlush(newFeed);
    return DownloadAndImportGTFSDataResult.FEED_UPDATED;
  }

  private validateAllFiles(files: GtfsFiles) {
    const feedInfoData = this.validateFile(
      files,
      'feed_info.txt',
      GTFSFeedInfoSchema,
    );

    if (!feedInfoData.length) throw new Error('No feed_info found!');
    if (feedInfoData.length > 1)
      throw new Error(
        'Supporting more than one feed info per upload is not supported',
      );

    const agencyData = this.validateFile(files, 'agency.txt', GTFSAgencySchema);
    const calendarDatesData = this.validateFile(
      files,
      'calendar_dates.txt',
      GTFSCalendarDateSchema,
    );
    const routeData = this.validateFile(files, 'routes.txt', GTFSRouteSchema);
    const stopData = this.validateFile(files, 'stops.txt', GTFSStopSchema);
    const tripData = this.validateFile(files, 'trips.txt', GTFSTripSchema);
    const stopTimeData = this.validateFile(
      files,
      'stop_times.txt',
      GTFSStopTimeSchema,
    );

    return {
      feedInfoData,
      agencyData,
      calendarDatesData,
      routeData,
      stopData,
      tripData,
      stopTimeData,
    };
  }

  private validateFile<T>(
    files: GtfsFiles,
    filename: string,
    schema: ZodType<T>,
  ): T[] {
    this.logger.log(`Parsing ${filename}...`);
    const { validRows, errors } = parseCsvWithSchema(files[filename], schema);
    if (errors.length) {
      throw new Error(`Error parsing ${filename}`);
    }
    return validRows;
  }

  /**
   * Import agencies into database
   */
  private async importAgencies(
    agencies: GTFSAgencyImport[],
    feedInfo: GTFSFeedInfo,
  ): Promise<Map<string, string>> {
    const agencyMap = new Map<string, string>();
    if (!agencies.length) return agencyMap;

    this.logger.log(`Importing ${agencies.length} agencies...`);
    const batchSize = 100;

    for (let i = 0; i < agencies.length; i += batchSize) {
      const batch = agencies.slice(i, i + batchSize);
      const entities = batch.map((row) =>
        this.agencyRepository.create({
          agencyName: row.agency_name,
          agencyUrl: row.agency_url,
          agencyTimezone: row.agency_timezone,
          agencyLang: row.agency_lang,
          agencyPhone: row.agency_phone,
          agencyId: row.agency_id || '',
          GTFSFeedInfo: feedInfo,
        }),
      );
      await this.agencyRepository.getEntityManager().persistAndFlush(entities);
      entities.forEach((entity) => agencyMap.set(entity.agencyId, entity.id));
    }
    return agencyMap;
  }

  /**
   * Import calendar dates into database
   */
  private async importCalendarDates(
    calendarDates: GTFSCalendarDateImport[],
    feedInfo: GTFSFeedInfo,
  ): Promise<void> {
    if (!calendarDates.length) return;

    this.logger.log(`Importing ${calendarDates.length} calendar dates...`);
    const batchSize = 500;

    for (let i = 0; i < calendarDates.length; i += batchSize) {
      const batch = calendarDates.slice(i, i + batchSize);
      const entities = batch.map((row) => {
        const dateStr = row.date.toString();
        return this.calendarDateRepository.create({
          serviceId: row.service_id,
          date: gtfsDateStringToDate(dateStr),
          exceptionType: parseInt(row.exception_type),
          GTFSFeedInfo: feedInfo,
        });
      });
      await this.calendarDateRepository
        .getEntityManager()
        .persistAndFlush(entities);
    }
  }

  /**
   * Import routes into database
   */
  private async importRoutes(
    routes: GTFSRouteImport[],
    feedInfo: GTFSFeedInfo,
    agencyMap: Map<string, string>,
  ): Promise<Map<string, string>> {
    const routeMap = new Map<string, string>();
    if (!routes.length) return routeMap;

    this.logger.log(`Importing ${routes.length} routes...`);
    const batchSize = 100;

    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);

      const entities = batch.map((row) => {
        const agencyId = row.agency_id || '';
        const agencyPk = agencyMap.get(agencyId);
        if (!agencyPk) {
          throw new Error(
            `Agency ID '${agencyId}' not found for route ${row.route_id}`,
          );
        }

        return this.routeRepository.create({
          routeShortName: row.route_short_name,
          routeLongName: row.route_long_name,
          routeDesc: row.route_desc,
          routeType: parseInt(row.route_type),
          routeUrl: row.route_url,
          routeColor: row.route_color,
          routeTextColor: row.route_text_color,
          agency: this.agencyRepository.getReference(agencyPk),
          GTFSFeedInfo: feedInfo,
          route_id: row.route_id || '',
        });
      });

      await this.routeRepository.getEntityManager().persistAndFlush(entities);
      entities.forEach((entity) => routeMap.set(entity.route_id, entity.id));
    }
    return routeMap;
  }

  /**
   * Import stops into database
   */
  private async importStops(
    stops: GTFSStopImport[],
    feedInfo: GTFSFeedInfo,
  ): Promise<Map<string, string>> {
    const stopMap = new Map<string, string>();
    if (!stops.length) return stopMap;

    this.logger.log(`Importing ${stops.length} stops...`);
    const batchSize = 500;

    for (let i = 0; i < stops.length; i += batchSize) {
      const batch = stops.slice(i, i + batchSize);
      const entities = batch.map((row) =>
        this.stopRepository.create({
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
          GTFSFeedInfo: feedInfo,
          stopId: row.stop_id || '',
        }),
      );
      await this.stopRepository.getEntityManager().persistAndFlush(entities);
      entities.forEach((entity) => stopMap.set(entity.stopId, entity.id));
    }
    return stopMap;
  }

  /**
   * Import trips into database
   */
  private async importTrips(
    trips: GTFSTripImport[],
    feedInfo: GTFSFeedInfo,
    routeMap: Map<string, string>,
  ): Promise<Map<string, string>> {
    const tripMap = new Map<string, string>();
    if (!trips.length) return tripMap;

    this.logger.log(`Importing ${trips.length} trips...`);
    const batchSize = 500;

    for (let i = 0; i < trips.length; i += batchSize) {
      const batch = trips.slice(i, i + batchSize);
      const entities = batch.map((row) => {
        const routePk = routeMap.get(row.route_id);
        if (!routePk)
          throw new Error(
            `Route ID '${row.route_id}' not found for trip ${row.trip_id}`,
          );

        return this.tripRepository.create({
          serviceId: row.service_id,
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
          route: this.routeRepository.getReference(routePk),
          trip_id: row.trip_id,
          GTFSFeedInfo: feedInfo,
        });
      });

      await this.tripRepository.getEntityManager().persistAndFlush(entities);
      entities.forEach((entity) => tripMap.set(entity.trip_id, entity.id));
    }
    return tripMap;
  }

  /**
   * Import stop times into database
   */
  private async importStopTimes(
    stopTimes: GTFSStopTimeImport[],
    newFeed: GTFSFeedInfo,
    stopMap: Map<string, string>,
    tripMap: Map<string, string>,
  ): Promise<void> {
    if (!stopTimes.length) return;

    this.logger.log(`Importing ${stopTimes.length} stop times...`);
    const batchSize = 5000;
    for (let i = 0; i < stopTimes.length; i += batchSize) {
      const batch = stopTimes.slice(i, i + batchSize);
      const stopTimeEntities: GTFSStopTime[] = batch.map((row) => {
        const stopPk = stopMap.get(row.stop_id);
        const tripPk = tripMap.get(row.trip_id);

        if (!stopPk)
          throw new Error(`Stop ID '${row.stop_id}' not found for stop time`);
        if (!tripPk)
          throw new Error(`Trip ID '${row.trip_id}' not found for stop time`);

        return {
          stopSequence: parseInt(row.stop_sequence),
          arrivalTime: row.arrival_time,
          departureTime: row.departure_time,
          stopHeadsign: row.stop_headsign,
          pickupType: row.pickup_type ? parseInt(row.pickup_type) : undefined,
          dropOffType: row.drop_off_type
            ? parseInt(row.drop_off_type)
            : undefined,
          stop: this.stopRepository.getReference(stopPk),
          trip: this.tripRepository.getReference(tripPk),
          GTFSFeedInfo: newFeed,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      await this.stopTimeRepository.insertMany(stopTimeEntities);
    }
  }
}

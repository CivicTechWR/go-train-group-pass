import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import axios, { AxiosResponse } from 'axios';
import JSZip from 'jszip';

interface GtfsFiles {
  [filename: string]: string;
}

@Injectable()
export class GtfsService implements OnModuleInit {
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

  constructor(private readonly configService: ConfigService) {
    this.gtfsUrl =
      this.configService.get<string>('GTFS_URL') ||
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
      const resp: AxiosResponse<ArrayBuffer> = await axios.get(this.gtfsUrl, {
        ...this.axiosOptions,
        headers,
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
      });

      if (resp.status === 304) {
        this.logger.log(
          'GTFS not modified (304). Keeping existing in-memory files.',
        );
        return this.getLatestGtfsFiles(); // returns defensive copy
      }

      // Save ETag / Last-Modified for conditional requests
      if (resp.headers['etag']) {
        this.etag = String(resp.headers['etag']);
      }

      if (resp.headers['last-modified']) {
        this.lastModified = String(resp.headers['last-modified']);
      }

      this.logger.log(
        `Downloaded GTFS zip (${resp.status}).
        
        Extracting...`,
      );

      const buffer = Buffer.from(resp.data);
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
    } catch (err) {
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

  async onModuleInit() {
    try {
      await this.downloadGtfs();
    } catch (err) {
      // downloadGtfs already catches and logs; this is defensive
      this.logger.error('Initial GTFS load failed', err);
    }
  }

  // run at minute 0 every 6 hours: 00:00, 06:00, 12:00, 18:00
  @Cron('0 */6 * * *')
  async handleCron() {
    // Don't await if you want the cron to fire non-blocking; here we await to ensure lock behavior:
    await this.downloadGtfs();
  }
}

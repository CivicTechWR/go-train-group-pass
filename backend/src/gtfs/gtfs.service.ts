import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import JSZip from 'jszip';

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
}

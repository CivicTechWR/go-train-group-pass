import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import JSZip from 'jszip';

@Injectable()
export class GtfsService implements OnModuleInit {
  private readonly logger = new Logger(GtfsService.name);
  private latestGtfsFiles: Record<string, string> = {};

  async downloadGtfs(): Promise<Record<string, string>> {
    const url =
      'https://assets.metrolinx.com/raw/upload/Documents/Metrolinx/Open%20Data/GO-GTFS.zip';
    this.logger.log('Downloading GTFS zip file...');
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    this.logger.log('Downloaded zip, extracting...');
    const buffer = Buffer.from(response.data);
    const zip = await JSZip.loadAsync(buffer);
    const files: Record<string, string> = {};
    for (const [name, file] of Object.entries(zip.files)) {
      if (!file.dir) {
        files[name] = await file.async('string');
      }
    }
    this.latestGtfsFiles = files;
    this.logger.log(
      `Downloaded and extracted ${Object.keys(files).length} GTFS files to memory`,
    );
    return files;
  }

  getLatestGtfsFiles(): Record<string, string> {
    return this.latestGtfsFiles;
  }

  async onModuleInit() {
    await this.downloadGtfs();
  }

  @Cron('0 */6 * * *')
  async handleCron() {
    await this.downloadGtfs();
  }
}

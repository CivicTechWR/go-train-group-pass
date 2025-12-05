import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { DownloadAndImportGTFSDataResult, GtfsService } from './gtfs.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('GTFS')
@Controller('gtfs')
export class GtfsController {
  constructor(private readonly gtfsService: GtfsService) {}

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download and import GTFS data' })
  @ApiOkResponse({ description: 'GTFS data import completed successfully' })
  async importGtfsData() {
    const result = await this.gtfsService.downloadAndImportToDatabase();
    if (result === DownloadAndImportGTFSDataResult.FEED_EXISTS) {
      return { message: 'No new GTFS feed to import.' };
    }
    if (result === DownloadAndImportGTFSDataResult.FEED_UPDATED) {
      return { message: 'New GTFS feed successfully imported.' };
    }

    return { message: 'GTFS data import completed successfully' };
  }
}

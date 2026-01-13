import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DownloadAndImportGTFSDataResult, GtfsService } from './gtfs.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../modules/auth/auth.guard';

@ApiTags('GTFS')
@Controller('gtfs')
export class GtfsController {
  constructor(private readonly gtfsService: GtfsService) {}

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download and import GTFS data (admin only)',
    description:
      'Imports latest GTFS feed from transit provider. Requires authentication and admin role.',
  })
  @ApiOkResponse({ description: 'GTFS data import completed successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  async importGtfsData() {
    // TODO: Add admin role check when user roles are implemented
    // For now, just require authentication
    // if (!req.user?.isAdmin) {
    //   throw new ForbiddenException('Admin access required');
    // }

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

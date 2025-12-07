import { Controller, Post, Get, UseGuards, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  GroupFormationService,
  GroupFormationRunResult,
} from './group-formation.service';
import { AuthGuard } from '../modules/auth/auth.guard';

/**
 * Controller for manually triggering group formation.
 * Provides an endpoint for administrative or testing purposes.
 */
@ApiTags('Group Formation')
@Controller('group-formation')
export class GroupFormationController {
  private readonly logger = new Logger(GroupFormationController.name);

  constructor(private readonly groupFormationService: GroupFormationService) {}

  /**
   * Manually trigger group formation.
   * This endpoint is protected and requires authentication.
   *
   * POST /group-formation/trigger
   */
  @Post('trigger')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Manually trigger group formation for departing trips',
  })
  @ApiResponse({
    status: 200,
    description: 'Group formation completed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async triggerGroupFormation(): Promise<GroupFormationRunResult> {
    this.logger.log('Manual group formation triggered via API');

    const result = await this.groupFormationService.formGroups();

    this.logger.log(
      `Manual group formation completed: ${result.totalGroupsFormed} groups formed`,
    );

    return result;
  }

  /**
   * Health check / status endpoint for group formation.
   * Returns basic info about the service.
   *
   * GET /group-formation/status
   */
  @Get('status')
  @ApiOperation({ summary: 'Get group formation service status' })
  @ApiResponse({
    status: 200,
    description: 'Service status',
  })
  getStatus(): { status: string; message: string } {
    return {
      status: 'ok',
      message: 'Group formation service is running',
    };
  }
}

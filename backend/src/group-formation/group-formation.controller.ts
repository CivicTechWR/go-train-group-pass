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
 * Provides endpoints for administrative or testing purposes.
 *
 * All endpoints are protected by authentication.
 * The trigger endpoint should be used sparingly as it performs database-intensive operations.
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
   * Note: This performs the same operation as the scheduled cron job.
   * Use sparingly to avoid overloading the database.
   *
   * POST /group-formation/trigger
   */
  @Post('trigger')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Manually trigger group formation for departing trips',
    description:
      'Immediately runs the group formation algorithm for trips departing within the configured window. ' +
      'Use sparingly as this is a database-intensive operation. ' +
      'The same operation runs automatically via cron job every minute.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Group formation completed successfully. Returns detailed results and metrics.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid token required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during group formation',
  })
  async triggerGroupFormation(): Promise<GroupFormationRunResult> {
    this.logger.log('[API] Manual group formation triggered');

    const result = await this.groupFormationService.formGroups();

    this.logger.log(
      `[API] Manual group formation completed: ` +
        `groups=${result.totalGroupsFormed}, ` +
        `duration=${result.metrics.runDurationMs}ms`,
    );

    return result;
  }

  /**
   * Health check / status endpoint for group formation.
   * Returns basic info about the service and configuration.
   *
   * GET /group-formation/status
   */
  @Get('status')
  @ApiOperation({
    summary: 'Get group formation service status',
    description:
      'Returns the current status of the group formation service including configuration info.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service status and configuration',
  })
  getStatus(): {
    status: string;
    message: string;
    info: {
      schedulerEnabled: boolean;
      cronSchedule: string;
      departureWindowMinutes: number;
      groupSizeRange: string;
    };
  } {
    return {
      status: 'ok',
      message: 'Group formation service is running',
      info: {
        schedulerEnabled: process.env.GROUP_FORMATION_ENABLED !== 'false',
        cronSchedule: process.env.GROUP_FORMATION_CRON_SCHEDULE ?? '* * * * *',
        departureWindowMinutes: parseInt(
          process.env.GROUP_FORMATION_WINDOW_MINUTES ?? '15',
          10,
        ),
        groupSizeRange: `${process.env.GROUP_FORMATION_MIN_SIZE ?? '2'}-${process.env.GROUP_FORMATION_MAX_SIZE ?? '5'}`,
      },
    };
  }
}

import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  GroupFormationService,
  GroupFormationResult,
} from './group-formation.service';
import { AuthGuard } from '../modules/auth/auth.guard';
import { Serialize } from '../common/decorators/serialize.decorator';
import {
  GroupFormationResponseSchema,
  GroupFormationResultSchema,
} from '@go-train-group-pass/shared';

/**
 * Controller for group formation operations.
 * Provides endpoints to trigger group formation for specific itineraries or trips.
 */
@ApiTags('Group Formation')
@Controller('group-formation')
export class GroupFormationController {
  private readonly logger = new Logger(GroupFormationController.name);

  constructor(private readonly groupFormationService: GroupFormationService) {}

  /**
   * Trigger group formation for a specific itinerary.
   * Should be called when it's time to lock in groups (e.g., 15 mins before departure).
   */
  @Post('itinerary/:itineraryId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Trigger group formation for a specific itinerary',
    description:
      'Forms groups for all trips in the specified itinerary. ' +
      'Should be called at the appropriate time before departure.',
  })
  @ApiParam({
    name: 'itineraryId',
    description: 'The ID of the itinerary to form groups for',
  })
  @ApiResponse({
    status: 200,
    description: 'Group formation completed for the itinerary',
  })
  @ApiResponse({
    status: 400,
    description: 'Not enough eligible bookings or stewards to form groups',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Itinerary not found' })
  @Serialize(GroupFormationResponseSchema)
  async formGroupsForItinerary(
    @Param('itineraryId') itineraryId: string,
  ): Promise<{ results: GroupFormationResult[] }> {
    this.logger.log(`Group formation triggered for itinerary ${itineraryId}`);

    const results =
      await this.groupFormationService.formGroupsForItinerary(itineraryId);

    const totalGroupsFormed = results.reduce(
      (sum, r) => sum + r.groupsFormed,
      0,
    );

    if (totalGroupsFormed === 0) {
      const reason =
        results.find((r) => r.failureReason)?.failureReason ??
        'not_enough_bookings';
      throw new BadRequestException(
        reason === 'no_steward_candidates' || reason === 'insufficient_stewards'
          ? 'Cannot form groups: no available stewards for this itinerary'
          : 'Cannot form groups: not enough eligible bookings',
      );
    }
    this.logger.log(
      `Group formation complete for itinerary ${itineraryId}: ${totalGroupsFormed} groups formed`,
    );

    return { results };
  }

  /**
   * Trigger group formation for a specific trip.
   */
  @Post('trip/:tripId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Trigger group formation for a specific trip',
    description: 'Forms groups for checked-in users on the specified trip.',
  })
  @ApiParam({
    name: 'tripId',
    description: 'The ID of the trip to form groups for',
  })
  @ApiResponse({
    status: 200,
    description: 'Group formation completed for the trip',
  })
  @ApiResponse({
    status: 400,
    description: 'Not enough eligible bookings or stewards to form groups',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @Serialize(GroupFormationResultSchema)
  async formGroupsForTrip(
    @Param('tripId') tripId: string,
  ): Promise<GroupFormationResult> {
    this.logger.log(`Group formation triggered for trip ${tripId}`);

    try {
      const result =
        await this.groupFormationService.formGroupsForTripById(tripId);

      if (result.groupsFormed === 0) {
        const reason = result.failureReason ?? 'not_enough_bookings';
        throw new BadRequestException(
          reason === 'no_steward_candidates' ||
          reason === 'insufficient_stewards'
            ? 'Cannot form groups: no available stewards for this trip'
            : 'Cannot form groups: not enough eligible bookings',
        );
      }

      this.logger.log(
        `Group formation complete for trip ${tripId}: ${result.groupsFormed} groups formed`,
      );

      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * Health check / status endpoint.
   */
  @Get('status')
  @ApiOperation({ summary: 'Get group formation service status' })
  @ApiResponse({ status: 200, description: 'Service status' })
  getStatus(): { status: string; message: string } {
    return {
      status: 'ok',
      message: 'Group formation service is running',
    };
  }
}

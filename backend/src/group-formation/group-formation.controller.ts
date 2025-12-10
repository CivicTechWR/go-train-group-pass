import {
  Controller,
  Post,
  Param,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GroupFormationService } from './group-formation.service';
import { AuthGuard } from '../modules/auth/auth.guard';
import { Serialize } from '../common/decorators/serialize.decorator';
import {
  GroupFormationResultSchema,
  GroupFormationResultDto,
  GroupFormationResultFailureReason,
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
  @Serialize(GroupFormationResultSchema)
  async formGroupsForItinerary(
    @Param('itineraryId') itineraryId: string,
  ): Promise<GroupFormationResultDto> {
    this.logger.log(`Group formation triggered for itinerary ${itineraryId}`);

    const results =
      await this.groupFormationService.formGroupsForItinerary(itineraryId);

    if (results.failureReason) {
      throw new BadRequestException(
        results.failureReason ===
          GroupFormationResultFailureReason.NO_STEWARD_CANDIDATE ||
        results.failureReason ===
          GroupFormationResultFailureReason.INSUFFICIENT_STEWARDS
          ? 'Cannot form groups: no available stewards for this itinerary'
          : 'Cannot form groups: not enough eligible bookings',
      );
    }
    this.logger.log(
      `Group formation complete for itinerary ${itineraryId}: ${results.groupsFormed} groups formed`,
    );

    return results;
  }
}

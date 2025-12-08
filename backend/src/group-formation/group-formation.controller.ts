import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Logger,
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
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip } from '../entities';

/**
 * Controller for group formation operations.
 * Provides endpoints to trigger group formation for specific itineraries or trips.
 */
@ApiTags('Group Formation')
@Controller('group-formation')
export class GroupFormationController {
  private readonly logger = new Logger(GroupFormationController.name);

  constructor(
    private readonly groupFormationService: GroupFormationService,
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
  ) {}

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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Itinerary not found' })
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async formGroupsForTrip(
    @Param('tripId') tripId: string,
  ): Promise<GroupFormationResult> {
    this.logger.log(`Group formation triggered for trip ${tripId}`);

    const trip = await this.tripRepository.findOne({ id: tripId });

    if (!trip) {
      throw new NotFoundException(`Trip ${tripId} not found`);
    }

    const result = await this.groupFormationService.formGroupsForTrip(trip);

    this.logger.log(
      `Group formation complete for trip ${tripId}: ${result.groupsFormed} groups formed`,
    );

    return result;
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

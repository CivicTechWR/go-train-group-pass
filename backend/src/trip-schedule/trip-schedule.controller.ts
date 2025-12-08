import {
  KitchenerUnionRoundTripScheduleInputDto,
  RoundTripSchema,
  TripScheduleInputDto,
} from '@go-train-group-pass/shared';
import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { TripScheduleService } from './trip-schedule.service';
import { Serialize } from 'src/common/decorators/serialize.decorator';

@Controller('trip-schedule')
@ApiTags('Trip Schedule')
export class TripScheduleController {
  constructor(private readonly tripScheduleService: TripScheduleService) {}

  @Get('search/round-trip-kitchener-union')
  @ApiOperation({
    summary: 'Gets a round trip itinerary for Kitchener-Union given a date',
  })
  @ApiQuery({
    name: 'date',
    description: 'The date for the round trip in ISO format (YYYY-MM-DD)',
    example: '2025-12-09',
  })
  @ApiOkResponse({ description: 'Trip schedule for Kitchener-Union' })
  @Serialize(RoundTripSchema)
  // route doesn't need to be protected because it's public information
  async demoRoundTripKitchenerUnion(
    @Query() queryParams: KitchenerUnionRoundTripScheduleInputDto,
  ) {
    return this.tripScheduleService.getKIToUnionRoundTripSchedule(
      new Date(queryParams.date),
    );
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search for a one-way trip schedule between two stations',
  })
  @ApiOkResponse({ description: 'Trip schedule for the specified route' })
  async searchTripSchedule(@Query() queryParams: TripScheduleInputDto) {
    return this.tripScheduleService.getTripSchedule(
      queryParams.orgStation,
      queryParams.destStation,
      new Date(queryParams.date),
    );
  }
}

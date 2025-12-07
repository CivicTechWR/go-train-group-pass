import {
  KitchenerUnionRoundTripScheduleInputDto,
  RoundTripSchema,
} from '@go-train-group-pass/shared';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TripScheduleService } from './trip-schedule.service';
import { Serialize } from 'src/common/decorators/serialize.decorator';

@Controller('trip-schedule')
@ApiTags('Trip Schedule')
export class TripScheduleController {
  constructor(private readonly tripScheduleService: TripScheduleService) {}

  @Get('round-trip-kitchener-union')
  @ApiOperation({
    summary: 'Gets a round trip itinerary for Kitchener-Union given a date',
  })
  @ApiBody({
    type: KitchenerUnionRoundTripScheduleInputDto,
  })
  @ApiOkResponse({ description: 'Trip schedule for Kitchener-Union' })
  @Serialize(RoundTripSchema)
  // route doesn't need to be protected because it's public information
  async demoRoundTripKitchenerUnion(
    @Query() body: KitchenerUnionRoundTripScheduleInputDto,
  ) {
    return this.tripScheduleService.getTripSchedule(
      'Kitchener GO',
      'Union Station GO',
      new Date(body.date),
    );
  }
}

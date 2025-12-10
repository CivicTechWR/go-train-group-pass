import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { AuthGuard } from '../modules/auth/auth.guard';
import type { RequestWithUser } from '../modules/auth/auth.guard';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Serialize } from '../common/decorators/serialize.decorator';
import {
  CreateItineraryDto,
  ExistingItinerariesDto,
  ExistingItinerariesSchema,
  ItineraryCreationResponseDto,
  ItineraryCreationResponseSchema,
  ItineraryQueryParamsDto,
  ItineraryTravelInfoSchema,
  QuickViewItinerariesDto,
  QuickViewItinerariesSchema,
} from '@go-train-group-pass/shared';
import { Public } from '../common/decorators/public.decorator';

@Controller('itineraries')
@UseGuards(AuthGuard)
@ApiTags('Itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) { }

  @Post()
  @ApiOperation({ summary: 'Create an itinerary' })
  @ApiBody({ type: CreateItineraryDto })
  @ApiOkResponse({ description: 'Itinerary created successfully' })
  @Serialize(ItineraryCreationResponseSchema)
  @UseGuards(AuthGuard)
  async create(
    @Request() req: RequestWithUser,
    @Body() createItineraryDto: CreateItineraryDto,
  ): Promise<ItineraryCreationResponseDto> {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.itinerariesService.create(req.user.id, createItineraryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get itinerary travel info' })
  @ApiOkResponse({ description: 'Itinerary travel info' })
  @Serialize(ItineraryTravelInfoSchema)
  async getItineraryTravelInfo(
    @Request() req: RequestWithUser,
    @Query() queryParams: ItineraryQueryParamsDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.itinerariesService.getItineraryInfo(
      req.user.id,
      queryParams.id,
    );
  }

  @Get('quick-view')
  @Public()
  @ApiOperation({ summary: 'Get quick view of all active itineraries' })
  @ApiOkResponse({ description: 'Quick view of active itineraries' })
  @Serialize(QuickViewItinerariesSchema)
  async getQuickViewItineraries(
    @Request() req: RequestWithUser,
  ): Promise<QuickViewItinerariesDto> {
    return this.itinerariesService.getQuickViewItineraries(req.user?.id);
  }

  @Get('existing')
  @ApiOperation({ summary: 'Summary of all itineraries with same trips' })
  @ApiOkResponse({ description: 'Existing itineraries' })
  @Serialize(ExistingItinerariesSchema)
  async getExistingItineraries(): Promise<ExistingItinerariesDto> {
    return this.itinerariesService.getExistingItineraries();
  }

  @Post('join')
  @ApiOperation({
    summary:
      'Creates a new itinerary for a user based on an existing trip sequence',
  })
  @ApiOkResponse({ description: 'Existing itineraries' })
  @Serialize(ItineraryCreationResponseSchema)
  async createItineraryWithExistingTripSequence(
    @Request() req: RequestWithUser,
    @Body('tripSequence') tripSequence: string,
    @Body('wantsToSteward') wantsToSteward: boolean,
  ): Promise<ItineraryCreationResponseDto> {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.itinerariesService.createItineraryWithExistingTripSequence(
      req.user.id,
      tripSequence,
      wantsToSteward,
    );
  }
}

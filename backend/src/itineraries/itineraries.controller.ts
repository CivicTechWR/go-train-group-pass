import {
  Body,
  Controller,
  Get,
  Post,
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
} from '@go-train-group-pass/shared';

@Controller('itineraries')
@UseGuards(AuthGuard)
@ApiTags('Itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

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

  @Get('existing')
  @ApiOperation({ summary: 'Summary of all itineraries with same trips' })
  @ApiOkResponse({ description: 'Existing itineraries' })
  @Serialize(ExistingItinerariesSchema)
  async getExistingItineraries(): Promise<ExistingItinerariesDto> {
    return this.itinerariesService.getExistingItineraries();
  }
}

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './itineraries.schemas';
import { AuthGuard } from '../modules/auth/auth.guard';

interface RequestWithUser extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    createdAt: Date;
    lastSignInAt?: Date;
  };
}

@ApiTags('Itineraries')
@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new itinerary with trip bookings' })
  @ApiResponse({
    status: 201,
    description: 'Itinerary successfully created with trip bookings',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid segment data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found - GTFS data not found' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createItineraryDto: CreateItineraryDto,
    @Req() request: RequestWithUser,
  ) {
    // The user is attached to the request by AuthGuard
    // Pass the user ID - the service will create a proper MikroORM reference
    const itinerary = await this.itinerariesService.create(
      createItineraryDto,
      request.user!.id,
    );

    return this.itinerariesService.formatItineraryResponse(itinerary);
  }
}

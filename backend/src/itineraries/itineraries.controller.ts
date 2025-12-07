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
import { User } from '../entities/user.entity';

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
    // We need to pass the user reference to the service
    const user = { id: request.user!.id } as User;

    const itinerary = await this.itinerariesService.create(
      createItineraryDto,
      user,
    );

    return this.itinerariesService.formatItineraryResponse(itinerary);
  }
}

import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { AuthGuard } from '../modules/auth/auth.guard';
import { FastifyRequest } from 'fastify';

@Controller('itineraries')
@UseGuards(AuthGuard)
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Post()
  async create(
    @Req() req: FastifyRequest & { user: { id: string } },
    @Body() createItineraryDto: CreateItineraryDto,
  ) {
    return this.itinerariesService.create(req.user.id, createItineraryDto);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Itinerary } from '../entities/itinerary.entity';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItineraryStatus } from '../entities/itineraryStatusEnum';
import { TripBookingService } from 'src/trip-booking/trip-booking.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ItinerariesService {
  constructor(
    @InjectRepository(Itinerary)
    private readonly itineraryRepo: EntityRepository<Itinerary>,
    private readonly userService: UsersService,
    private readonly tripBookingService: TripBookingService,
    private readonly em: EntityManager,
  ) {}

  async create(
    userId: string,
    createItineraryDto: CreateItineraryDto,
  ): Promise<Itinerary> {
    const user = await this.userService.findByAuthUserIdOrFail(userId);
    const tripBookings = await Promise.all(
      createItineraryDto.segments.map(async (segment, index) => {
        return await this.tripBookingService.create(
          userId,
          segment.gtfsTripId,
          segment.originStopId,
          segment.destStopId,
          index,
        );
      }),
    );

    const itinerary = this.itineraryRepo.create({
      user,
      tripBookings,
      wantsToSteward: createItineraryDto.wantsToSteward,
      status: ItineraryStatus.DRAFT,
    });
    await this.em.persistAndFlush(itinerary);
    return itinerary;
  }
}

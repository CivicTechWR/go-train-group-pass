import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Itinerary } from '../entities/itinerary.entity';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItineraryStatus } from '../entities/itineraryStatusEnum';
import { TripBookingService } from '../trip-booking/trip-booking.service';
import { UsersService } from '../users/users.service';
import { ItineraryCreationResponseDto } from '@go-train-group-pass/shared';

@Injectable()
export class ItinerariesService {
  constructor(
    @InjectRepository(Itinerary)
    private readonly itineraryRepo: EntityRepository<Itinerary>,
    private readonly userService: UsersService,
    private readonly tripBookingService: TripBookingService,
  ) {}

  async create(
    userId: string,
    createItineraryDto: CreateItineraryDto,
  ): Promise<ItineraryCreationResponseDto> {
    const user = await this.userService.findById(userId);
    const tripBookings = await Promise.all(
      createItineraryDto.segments.map(async (segment, index) => {
        return await this.tripBookingService.create(
          userId,
          segment.gtfsTripId,
          segment.originStopTimeId,
          segment.destStopTimeId,
          index,
        );
      }),
    );

    const existingItinerary = await this.itineraryRepo.findOne({
      user,
      tripBookings,
    });

    if (existingItinerary) {
      return {
        id: existingItinerary.id,
        trips: tripBookings.map((tripBooking) =>
          this.tripBookingService.getTripDetails(tripBooking),
        ),
        stewarding: existingItinerary.wantsToSteward,
      };
    }

    const itinerary = this.itineraryRepo.create({
      user,
      tripBookings,
      wantsToSteward: createItineraryDto.wantsToSteward,
      status: ItineraryStatus.DRAFT,
    });
    await this.itineraryRepo.getEntityManager().persistAndFlush(itinerary);
    return {
      id: itinerary.id,
      trips: tripBookings.map((tripBooking) =>
        this.tripBookingService.getTripDetails(tripBooking),
      ),
      stewarding: itinerary.wantsToSteward,
    };
  }
}

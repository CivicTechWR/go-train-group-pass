import { Injectable } from '@nestjs/common';
import { EntityRepository, Transactional } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
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

  @Transactional()
  async create(
    userId: string,
    createItineraryDto: CreateItineraryDto,
  ): Promise<ItineraryCreationResponseDto> {
    const user = await this.userService.findById(userId);
    const tripBookings = await Promise.all(
      createItineraryDto.segments.map(async (segment, index) => {
        return await this.tripBookingService.findOrCreate(
          userId,
          segment.gtfsTripId,
          segment.originStopTimeId,
          segment.destStopTimeId,
          index + 1, // sequence starts from 1
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

    // With @Transactional, explicit persist here will be flushed automatically at the end of the method
    // But we usually need to persist it. flush is handled by the transaction commit.
    // However, for the id to be generated if it's database-generated (SERIAL), we might need flush if we return it.
    // But usually MikroORM flushes before commit.
    this.itineraryRepo.getEntityManager().persist(itinerary);

    return {
      id: itinerary.id,
      trips: tripBookings.map((tripBooking) =>
        this.tripBookingService.getTripDetails(tripBooking),
      ),
      stewarding: itinerary.wantsToSteward,
    };
  }
}

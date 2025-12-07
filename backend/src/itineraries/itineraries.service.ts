import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Itinerary } from '../entities/itinerary.entity';
import { Trip } from '../entities/trip.entity';
import { TripBooking } from '../entities/trip_booking.entity';
import { GTFSTrip, GTFSStopTime, User } from '../entities';
import { CreateItineraryInput, Segment } from './itineraries.schemas';
import { TripBookingStatus } from '../entities/tripBookingEnum';
import { ItineraryStatus } from '../entities/itineraryStatusEnum';

@Injectable()
export class ItinerariesService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Itinerary)
    private readonly itineraryRepository: EntityRepository<Itinerary>,
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(TripBooking)
    private readonly tripBookingRepository: EntityRepository<TripBooking>,
    @InjectRepository(GTFSTrip)
    private readonly gtfsTripRepository: EntityRepository<GTFSTrip>,
    @InjectRepository(GTFSStopTime)
    private readonly stopTimeRepository: EntityRepository<GTFSStopTime>,
  ) {}

  /**
   * Create an itinerary with trip bookings for each segment.
   *
   * Logic:
   * 1. Validate all segments have valid GTFS references
   * 2. Find or create Trip entities for each segment (using unique constraint)
   * 3. Create the Itinerary entity
   * 4. Create TripBooking entities linked to the Itinerary
   */
  async create(input: CreateItineraryInput, user: User): Promise<Itinerary> {
    const { segments, wantsToSteward } = input;

    // Validate and resolve all segments first
    const resolvedSegments = await this.resolveSegments(segments);

    // Create the itinerary
    const itinerary = this.itineraryRepository.create({
      status: ItineraryStatus.DRAFT,
      wantsToSteward,
      user,
    });

    // Create trip bookings for each segment
    for (let i = 0; i < resolvedSegments.length; i++) {
      const { trip } = resolvedSegments[i];

      const tripBooking = this.tripBookingRepository.create({
        sequence: i + 1,
        status: TripBookingStatus.PENDING,
        user,
        itinerary,
        trip,
      });

      itinerary.tripBookings.add(tripBooking);
    }

    // Persist everything
    await this.em.persistAndFlush(itinerary);

    // Reload with relations for response
    await this.em.refresh(itinerary, {
      populate: [
        'tripBookings',
        'tripBookings.trip',
        'tripBookings.trip.originStopTime',
        'tripBookings.trip.originStopTime.stop',
        'tripBookings.trip.destinationStopTime',
        'tripBookings.trip.destinationStopTime.stop',
      ],
    });

    return itinerary;
  }

  /**
   * Resolve segments by validating GTFS references and finding/creating Trip entities.
   * Uses the unique constraint [gtfsTrip, originStopTime, destinationStopTime] to dedupe trips.
   */
  private async resolveSegments(
    segments: Segment[],
  ): Promise<Array<{ trip: Trip }>> {
    const resolved: Array<{ trip: Trip }> = [];

    for (const segment of segments) {
      const { originStopId, destStopId, gtfsTripId } = segment;

      // Find the GTFS Trip
      const gtfsTrip = await this.gtfsTripRepository.findOne({
        trip_id: gtfsTripId,
      });

      if (!gtfsTrip) {
        throw new NotFoundException(`GTFS Trip not found: ${gtfsTripId}`);
      }

      // Find origin stop time for this trip and stop
      const originStopTime = await this.stopTimeRepository.findOne({
        trip: gtfsTrip,
        stop: { stopId: originStopId },
      });

      if (!originStopTime) {
        throw new BadRequestException(
          `Origin stop ${originStopId} not found on trip ${gtfsTripId}`,
        );
      }

      // Find destination stop time for this trip and stop
      const destStopTime = await this.stopTimeRepository.findOne({
        trip: gtfsTrip,
        stop: { stopId: destStopId },
      });

      if (!destStopTime) {
        throw new BadRequestException(
          `Destination stop ${destStopId} not found on trip ${gtfsTripId}`,
        );
      }

      // Validate that origin comes before destination in sequence
      if (originStopTime.stopSequence >= destStopTime.stopSequence) {
        throw new BadRequestException(
          `Origin stop must come before destination stop in trip ${gtfsTripId}. ` +
            `Origin sequence: ${originStopTime.stopSequence}, Destination sequence: ${destStopTime.stopSequence}`,
        );
      }

      // Find or create the Trip entity using the unique constraint
      const trip = await this.findOrCreateTrip(
        gtfsTrip,
        originStopTime,
        destStopTime,
      );

      resolved.push({ trip });
    }

    return resolved;
  }

  /**
   * Find an existing Trip or create a new one.
   * Uses the unique constraint [gtfsTrip, originStopTime, destinationStopTime].
   */
  private async findOrCreateTrip(
    gtfsTrip: GTFSTrip,
    originStopTime: GTFSStopTime,
    destinationStopTime: GTFSStopTime,
  ): Promise<Trip> {
    // Try to find existing trip
    let trip = await this.tripRepository.findOne({
      gtfsTrip,
      originStopTime,
      destinationStopTime,
    });

    if (!trip) {
      // Create new trip
      trip = this.tripRepository.create({
        gtfsTrip,
        originStopTime,
        destinationStopTime,
      });
      await this.em.persistAndFlush(trip);
    }

    return trip;
  }

  /**
   * Format itinerary for API response
   */
  formatItineraryResponse(itinerary: Itinerary) {
    return {
      id: itinerary.id,
      status: itinerary.status,
      wantsToSteward: itinerary.wantsToSteward,
      createdAt: itinerary.createdAt,
      tripBookings: itinerary.tripBookings.getItems().map((booking) => ({
        id: booking.id,
        sequence: booking.sequence,
        status: booking.status,
        trip: {
          id: booking.trip.id,
          originStopTime: {
            id: booking.trip.originStopTime.id,
            departureTime: booking.trip.originStopTime.departureTime,
            stop: {
              stopId: booking.trip.originStopTime.stop.stopId,
              stopName: booking.trip.originStopTime.stop.stopName,
            },
          },
          destinationStopTime: {
            id: booking.trip.destinationStopTime.id,
            arrivalTime: booking.trip.destinationStopTime.arrivalTime,
            stop: {
              stopId: booking.trip.destinationStopTime.stop.stopId,
              stopName: booking.trip.destinationStopTime.stop.stopName,
            },
          },
        },
      })),
    };
  }
}

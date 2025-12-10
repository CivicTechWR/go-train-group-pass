import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  User,
  Itinerary,
  Trip,
  TripBooking,
  GTFSTrip,
  GTFSStopTime,
  GTFSStop,
} from '../../entities';
import { ItineraryStatus } from '../../entities/itineraryStatusEnum';
import { TripBookingStatus } from '../../entities/tripBookingEnum';
import { faker } from '@faker-js/faker';

export class DemoSeeder extends Seeder {
  private generatedPhoneNumbers = new Set<string>();

  async run(em: EntityManager): Promise<void> {
    const date = new Date('2025-12-11'); // Specific demo date
    this.generatedPhoneNumbers.clear(); // Reset for this run

    console.log('Finding Trips...');

    const outboundTrip = await this.findTrip(
      em,
      'Kitchener',
      'Kitchener GO',
      'Union Station GO',
      '07:38:00',
    );

    const returnTrip = await this.findTrip(
      em,
      'Kitchener',
      'Union Station GO',
      'Kitchener GO',
      '22:34:00',
    );

    if (!outboundTrip || !returnTrip) {
      throw new Error('Could not find preferred demo trips in database');
    }

    const demoTrips = [outboundTrip, returnTrip];
    const tripEntities: Trip[] = [];

    console.log('Creating Trips...');
    for (const tripResult of demoTrips) {
      const { gtfsTrip, originStopTime, destinationStopTime } = tripResult;

      // Check if trip already exists for this date/segment
      let trip = await em.findOne(Trip, {
        gtfsTrip,
        originStopTime,
        destinationStopTime,
        date,
      });

      if (!trip) {
        trip = em.create(Trip, {
          gtfsTrip,
          originStopTime,
          destinationStopTime,
          date,
          originStopName: originStopTime.stop.stopName,
          destinationStopName: destinationStopTime.stop.stopName,
          routeShortName: gtfsTrip.route.routeShortName,
          routeLongName: gtfsTrip.route.routeLongName,
          departureTime: this.combineDateAndTime(
            date,
            originStopTime.departureTime,
          ),
          arrivalTime: this.combineDateAndTime(
            date,
            destinationStopTime.arrivalTime,
          ),
        });
        em.persist(trip);
      }
      tripEntities.push(trip);
    }
    await em.flush();

    console.log('Creating Users and Itineraries...');
    // Create Main Demo User
    const demoUserName = process.env.DEMO_USER_NAME || 'Jessica Liu';
    let demoUser = await em.findOne(User, {
      name: demoUserName,
    });

    if (!demoUser) {
      console.log(`Creating user ${demoUserName}...`);
      demoUser = em.create(User, {
        name: demoUserName,
        email: `${demoUserName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phoneNumber: this.generateUniquePhoneNumber(),
        authUserId: crypto.randomUUID(),
      });
      em.persist(demoUser);
    }

    await this.createItineraryForUser(em, demoUser, tripEntities, false); // Main user might want to form group manually later

    // Create 12 other users to ensure at least 2 full groups of 5 with stewards
    for (let i = 1; i <= 12; i++) {
      let user = await em.findOne(User, { name: `Test ${i}` });
      if (!user) {
        user = em.create(User, {
          name: `Test ${i}`,
          email: `test${i}@example.com`,
          phoneNumber: this.generateUniquePhoneNumber(),
          authUserId: crypto.randomUUID(),
        });
        em.persist(user);
      } else {
        user.phoneNumber = this.generateUniquePhoneNumber();
      }

      // Make 3 users stewards locally
      const wantsToSteward = i <= 3;
      await this.createItineraryForUser(em, user, tripEntities, wantsToSteward);
    }

    await em.flush();
    console.log('Seeding Complete!');
  }

  private async findTrip(
    em: EntityManager,
    routeLongName: string,
    originStopName: string,
    destinationStopName: string,
    approximateTime: string,
  ): Promise<{
    gtfsTrip: GTFSTrip;
    originStopTime: GTFSStopTime;
    destinationStopTime: GTFSStopTime;
  } | null> {
    const originStop = await em.findOne(GTFSStop, { stopName: originStopName });
    const destStop = await em.findOne(GTFSStop, {
      stopName: destinationStopName,
    });

    if (!originStop || !destStop) {
      console.error(
        `Stops not found: ${originStopName} (found: ${!!originStop}), ${destinationStopName} (found: ${!!destStop})`,
      );
      return null;
    }

    console.log(
      `Searching for trip on route '${routeLongName}' from ${originStopName} to ${destinationStopName} after ${approximateTime}...`,
    );

    const qb = em.createQueryBuilder(GTFSTrip, 't');

    // We join stopTimes twice: once for origin, once for destination
    qb.select('t.*')
      .join('t.route', 'r')
      .join('t.stopTimes', 'origin')
      .join('t.stopTimes', 'dest')
      .where({ 'r.routeLongName': { $like: `%${routeLongName}%` } })
      .andWhere({ 'origin.stop': originStop.id })
      .andWhere({ 'dest.stop': destStop.id })
      .andWhere('origin.stop_sequence < dest.stop_sequence')
      .andWhere({ 'origin.departureTime': { $gte: approximateTime } })
      .orderBy({ 'origin.departureTime': 'ASC' })
      .limit(1);

    try {
      const trip = await qb.getSingleResult();

      if (trip) {
        console.log(`Found trip: ${trip.trip_id}`);
        await em.populate(trip, ['route']); // Ensure route is populated for properties

        // Now fetch the specific stop times for the return object
        const originStopTime = await em.findOneOrFail(
          GTFSStopTime,
          {
            trip,
            stop: originStop,
            departureTime: { $gte: approximateTime } as any,
          },
          { orderBy: { departureTime: 'ASC' } },
        );

        const destinationStopTime = await em.findOneOrFail(GTFSStopTime, {
          trip,
          stop: destStop,
          stopSequence: { $gt: originStopTime.stopSequence },
        });

        return {
          gtfsTrip: trip,
          originStopTime,
          destinationStopTime,
        };
      }
    } catch (e) {
      console.error('Error finding trip or no trip found:', e);
    }

    // Fallback if getSingleResult throws (which it might if no result found and no exception ignored)
    // Actually getSingleResult throws if no result found.
    // The previous block handles success, catch handles failure.
    // So if we are here, we didn't return.

    return null;
  }

  private async createItineraryForUser(
    em: EntityManager,
    user: User,
    trips: Trip[],
    wantsToSteward: boolean,
  ) {
    const existingItinerary = await em.findOne(Itinerary, { user });
    if (existingItinerary) {
      return;
    }

    const tripBookings = trips.map((trip, idx) => {
      return em.create(TripBooking, {
        trip,
        user,
        sequence: idx + 1,
        status: TripBookingStatus.CHECKED_IN, // Auto check-in for grouping
      });
    });

    const itinerary = em.create(Itinerary, {
      user,
      wantsToSteward,
      status: ItineraryStatus.CONFIRMED,
    });

    itinerary.tripBookings.add(tripBookings);

    em.persist(itinerary);
    em.persist(tripBookings);
  }

  private combineDateAndTime(date: Date, timeStr: string): Date {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, seconds || 0);
    return newDate;
  }

  private generateUniquePhoneNumber(): string {
    let phoneNumber: string;
    do {
      // E.164 format: +1555xxxxxxx (using +1 for US/Canada and 555 for fake numbers)
      phoneNumber = `+1555${faker.string.numeric(7)}`;
    } while (this.generatedPhoneNumbers.has(phoneNumber));

    this.generatedPhoneNumbers.add(phoneNumber);
    return phoneNumber;
  }
}

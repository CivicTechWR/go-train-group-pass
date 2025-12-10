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
    this.generatedPhoneNumbers.clear(); // Reset for this run

    // --- 1. Fixed Demo User (Jessica Liu) for Dec 11 ---
    console.log('--- Setting up Fixed Demo User (Dec 11) ---');
    const demoDate = new Date('2025-12-11');
    const demoServiceId = '20251211';

    const outboundTrip = await this.findTrip(
      em,
      demoServiceId,
      'Kitchener',
      'Kitchener GO',
      'Union Station GO',
      '07:38:00',
    );

    const returnTrip = await this.findTrip(
      em,
      demoServiceId,
      'Kitchener',
      'Union Station GO',
      'Kitchener GO',
      '22:34:00',
    );

    if (!outboundTrip || !returnTrip) {
      throw new Error('Could not find preferred demo trips in database');
    }

    const demoTrips = [outboundTrip, returnTrip];
    const demoTripEntities = await this.ensureTripsExist(
      em,
      demoTrips,
      demoDate,
    );

    console.log('Creating Main Demo User...');
    const demoUserName = process.env.DEMO_USER_NAME || 'Jessica Liu';
    let demoUser = await em.findOne(User, {
      name: demoUserName,
    });

    if (!demoUser) {
      demoUser = em.create(User, {
        name: demoUserName,
        email: `${demoUserName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phoneNumber: this.generateUniquePhoneNumber(),
        authUserId: crypto.randomUUID(),
      });
      em.persist(demoUser);
    }

    await this.createItineraryForUser(em, demoUser, demoTripEntities, false);

    // --- 2. Random Itineraries for Dec 11 - Dec 18 ---
    console.log('--- Generating Random Itineraries (Dec 11 - Dec 18) ---');
    const startDate = new Date('2025-12-11');
    const endDate = new Date('2025-12-18');

    // Iterate through dates properly
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split('T')[0];
      const serviceId = dateStr.replace(/-/g, '');
      const currentDate = new Date(d); // Copy

      const numItineraries = faker.number.int({ min: 1, max: 20 });
      console.log(
        `Generating ${numItineraries} itineraries for ${dateStr} (ServiceId: ${serviceId})...`,
      );

      // We pre-fetch valid trips for the day to avoid hitting DB too hard inside the loop if possible,
      // but for variety we might want to query. findRandomTripPair does queries.
      // Given the scale (20 loops), it's fine.

      for (let i = 0; i < numItineraries; i++) {
        try {
          // Find a random valid trip pair for this day
          const randomTripPair = await this.findRandomTripPair(
            em,
            serviceId,
            'Kitchener',
            'Kitchener GO',
            'Union Station GO',
          );

          if (!randomTripPair) {
            // console.warn(`Could not find a valid random trip pair for ${dateStr}, skipping itinerary ${i+1}`);
            continue;
          }

          const tripEntities = await this.ensureTripsExist(
            em,
            [randomTripPair.outbound, randomTripPair.return],
            currentDate,
          );

          const user = em.create(User, {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phoneNumber: this.generateUniquePhoneNumber(),
            authUserId: crypto.randomUUID(),
          });
          em.persist(user);

          // Small chance to want to steward
          const wantsToSteward = faker.datatype.boolean(0.2);
          await this.createItineraryForUser(
            em,
            user,
            tripEntities,
            wantsToSteward,
          );
        } catch (e) {
          console.error(`Error generating random itinerary for ${dateStr}:`, e);
        }
      }
      // Flush per day to keep memory usage decent and save progress
      await em.flush();
    }

    console.log('Seeding Complete!');
  }

  private async ensureTripsExist(
    em: EntityManager,
    tripResults: any[],
    date: Date,
  ): Promise<Trip[]> {
    const tripEntities: Trip[] = [];
    for (const tripResult of tripResults) {
      const { gtfsTrip, originStopTime, destinationStopTime } = tripResult;

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
    return tripEntities;
  }

  private async findRandomTripPair(
    em: EntityManager,
    serviceId: string,
    routeLongName: string,
    originStopName: string,
    destinationStopName: string,
  ): Promise<{ outbound: any; return: any } | null> {
    // 1. Find all valid outbound trips
    const outboundTrips = await this.findAllValidTrips(
      em,
      serviceId,
      routeLongName,
      originStopName,
      destinationStopName,
    );

    if (outboundTrips.length === 0) return null;

    // 2. Pick random outbound
    const outbound = faker.helpers.arrayElement(outboundTrips);

    // Calculate minimum return time (arrival + 30 mins)
    // GTFS times are HH:MM:SS
    const arrivalParts = outbound.destinationStopTime.arrivalTime
      .split(':')
      .map(Number);
    const arrivalMinutes = arrivalParts[0] * 60 + arrivalParts[1];
    const minReturnMinutes = arrivalMinutes + 30; // 30 min buffer

    const minReturnTimeStr = `${Math.floor(minReturnMinutes / 60)
      .toString()
      .padStart(
        2,
        '0',
      )}:${(minReturnMinutes % 60).toString().padStart(2, '0')}:00`;

    // 3. Find all valid return trips after that time
    const returnTrips = await this.findAllValidTrips(
      em,
      serviceId,
      routeLongName,
      destinationStopName,
      originStopName,
      minReturnTimeStr,
    );

    if (returnTrips.length === 0) return null;

    // 4. Pick random return
    const returnTrip = faker.helpers.arrayElement(returnTrips);

    return { outbound, return: returnTrip };
  }

  private async findAllValidTrips(
    em: EntityManager,
    serviceId: string,
    routeLongName: string,
    originStopName: string,
    destinationStopName: string,
    minDepartureTime: string = '00:00:00',
  ): Promise<any[]> {
    const originStop = await em.findOne(GTFSStop, { stopName: originStopName });
    const destStop = await em.findOne(GTFSStop, {
      stopName: destinationStopName,
    });

    if (!originStop || !destStop) return [];

    const qb = em.createQueryBuilder(GTFSTrip, 't');
    qb.select('t.*')
      .join('t.route', 'r')
      .join('t.stopTimes', 'origin')
      .join('t.stopTimes', 'dest')
      .where({ 'r.routeLongName': { $like: `%${routeLongName}%` } })
      .andWhere({ 'origin.stop': originStop.id })
      .andWhere({ 'dest.stop': destStop.id })
      .andWhere('origin.stop_sequence < dest.stop_sequence')
      .andWhere({ 't.serviceId': serviceId })
      .andWhere({ 'origin.departureTime': { $gte: minDepartureTime } })
      .orderBy({ 'origin.departureTime': 'ASC' });

    const trips = await qb.getResult();

    const results: any[] = [];
    for (const trip of trips) {
      // Ideally we select these in the query, but for simplicity/consistency with existing structure:
      await em.populate(trip, ['route']);
      const originStopTime = await em.findOne(
        GTFSStopTime,
        {
          trip,
          stop: originStop,
          departureTime: { $gte: minDepartureTime } as any, // Type assertion for safety
        },
        { orderBy: { departureTime: 'ASC' } },
      );

      const destinationStopTime = await em.findOne(GTFSStopTime, {
        trip,
        stop: destStop,
        stopSequence: { $gt: originStopTime?.stopSequence || -1 },
      });

      if (originStopTime && destinationStopTime) {
        results.push({ gtfsTrip: trip, originStopTime, destinationStopTime });
      }
    }
    return results;
  }

  private async findTrip(
    em: EntityManager,
    serviceId: string,
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
      .andWhere({ 't.serviceId': serviceId })
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

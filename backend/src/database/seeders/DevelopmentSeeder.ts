import { Seeder } from '@mikro-orm/seeder';
import { createClient } from '@supabase/supabase-js';
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
import { createDateInTransitTimezone } from '../../utils/date.utils';
import { getDateTimeFromServiceIdGTFSTimeString } from '../../utils/getDateTimeFromServiceIdGTFSTimeString';
import { addDays, format } from 'date-fns';

export class DevelopmentSeeder extends Seeder {
  private generatedPhoneNumbers = new Set<string>();

  async run(em: EntityManager): Promise<void> {
    this.generatedPhoneNumbers.clear(); // Reset for this run

    // --- 0. Set up Supabase Admin Client ---
    console.log('--- Setting up Supabase Admin Client ---');
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.warn(
        'SUPABASE_SERVICE_ROLE_KEY not found in environment. Skipping Supabase user creation.',
      );
    }

    const supabase = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
      : null;

    // --- 0.1 Create Loggable Test User ---
    console.log('--- Ensuring Loggable Test User exists ---');
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    const testName = 'Test User';
    const testPhone = '+15550001234';
    let testAuthUserId: string | undefined;

    if (supabase) {
      // Check if user exists in Supabase
      const { data: userData, error: listError } =
        await supabase.auth.admin.listUsers();
      const existingSupabaseUser = (userData?.users as any[] | undefined)?.find(
        (u) => u.email === testEmail,
      );

      if (existingSupabaseUser) {
        console.log(`User ${testEmail} already exists in Supabase.`);
        testAuthUserId = existingSupabaseUser.id;
      } else {
        console.log(`Creating user ${testEmail} in Supabase...`);
        const { data: newUser, error: createError } =
          await supabase.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true,
            user_metadata: {
              full_name: testName,
            },
          });

        if (createError) {
          console.error('Error creating user in Supabase:', createError);
        } else {
          testAuthUserId = newUser.user?.id;
        }
      }
    }

    let testUser = await em.findOne(User, { email: testEmail });
    if (!testUser) {
      console.log(`Creating user ${testEmail} in local database...`);
      testUser = em.create(User, {
        name: testName,
        email: testEmail,
        phoneNumber: testPhone,
        authUserId: testAuthUserId || crypto.randomUUID(),
      });
      em.persist(testUser);
    } else if (testAuthUserId && testUser.authUserId !== testAuthUserId) {
      console.log(`Updating authUserId for ${testEmail} in local database...`);
      testUser.authUserId = testAuthUserId;
    }

    console.log('--- Setting up Fixed Demo User (Dec 11) ---');
    const dateString = '2025-12-11';
    const demoDate = createDateInTransitTimezone(dateString);
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
    const demoUserName = process.env.DEMO_USER_NAME;
    if (!demoUserName) {
      throw new Error('DEMO_USER_NAME environment variable is not set');
    }
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

    // Also give some trips to our loggable test user if they don't have them
    await this.createItineraryForUser(em, testUser, demoTripEntities, true);

    // --- 2. Random Itineraries for Dec 11 - Dec 18 ---
    console.log('--- Generating Random Itineraries (Dec 11 - Dec 18) ---');

    // We can use simple loop over days offset
    const startDateStr = format(new Date(), 'yyyy-MM-dd');
    const endDateStr = format(addDays(new Date(), 7), 'yyyy-MM-DD' );

    const start = createDateInTransitTimezone(startDateStr);
    const end = createDateInTransitTimezone(endDateStr);

    // Calculate number of days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= diffDays; i++) {
      // compute date by adding days to milliseconds to avoid local timezone mess with setDate
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);

      const dateStr = d.toISOString().split('T')[0];
      const serviceId = dateStr.replace(/-/g, '');

      // Select 3 popular trip pairs for this day to enable high clustering (80% chance)
      const popularTripPairs: { outbound: any; return: any }[] = [];
      for (let k = 0; k < 3; k++) {
        const trip = await this.findRandomTripPair(
          em,
          serviceId,
          'Kitchener',
          'Kitchener GO',
          'Union Station GO',
        );
        if (trip) popularTripPairs.push(trip);
      }

      const numItineraries = faker.number.int({ min: 9, max: 40 });
      console.log(
        `Generating ${numItineraries} itineraries for ${dateStr} (ServiceId: ${serviceId})...`,
      );

      for (let j = 0; j < numItineraries; j++) {
        try {
          // 80% chance to pick a popular trip, 20% chance for random
          let randomTripPair;
          const usePopular = faker.datatype.boolean(0.8);

          if (usePopular && popularTripPairs.length > 0) {
            randomTripPair = faker.helpers.arrayElement(popularTripPairs);
          } else {
            randomTripPair = await this.findRandomTripPair(
              em,
              serviceId,
              'Kitchener',
              'Kitchener GO',
              'Union Station GO',
            );
          }

          if (!randomTripPair) {
            continue;
          }

          const tripEntities = await this.ensureTripsExist(
            em,
            [randomTripPair.outbound, randomTripPair.return],
            d,
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
        // Convert GTFS date to service ID format (YYYYMMDD)
        const serviceId = date.toISOString().split('T')[0].replace(/-/g, '');

        // USE PROPER GTFS TIME CONVERTER that handles "next day" times like 25:00:00
        const departureTime = getDateTimeFromServiceIdGTFSTimeString(serviceId, originStopTime.departureTime);
        const arrivalTime = getDateTimeFromServiceIdGTFSTimeString(serviceId, destinationStopTime.arrivalTime);

        trip = em.create(Trip, {
          gtfsTrip,
          originStopTime,
          destinationStopTime,
          date,
          originStopName: originStopTime.stop.stopName,
          destinationStopName: destinationStopTime.stop.stopName,
          routeShortName: gtfsTrip.route.routeShortName,
          routeLongName: gtfsTrip.route.routeLongName,
          departureTime,
          arrivalTime,
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

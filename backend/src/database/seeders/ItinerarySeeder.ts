import { Seeder } from '@mikro-orm/seeder';
import { EntityManager, } from '@mikro-orm/core';
import { Itinerary } from '../../entities/itinerary.entity';
import { Trip } from '../../entities/trip.entity';
import { TripBooking } from '../../entities/trip_booking.entity';
import { User } from '../../entities/user.entity';
import { GTFSTrip } from '../../entities/gtfs_trip.entity';
import { GTFSStopTime } from '../../entities/gtfs_stop_times.entity';
import { ItineraryStatus } from '../../entities/itineraryStatusEnum';
import { TripBookingStatus } from '../../entities/tripBookingEnum';
import { randomUUID } from 'crypto';

export type TripSeedData  = {
    trip_id: string;
    trip_headsign: string;
    service_id: string;
    route_long_name: string;
    departure_stop: string;
    departure_time: string;
    departure_stop_time_id: string;
    arrival_stop: string;
    arrival_time: string;
    arrival_stop_time_id: string;
    dist_traveled: null;
}
 
export class ItinerarySeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const kitchenerToUnionTrips = [
      {
        trip_id: 'aba3abd2-dd26-4f9a-b13f-59b9b9ee8b15',
        trip_headsign: 'KI - Union Station GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Kitchener GO',
        departure_time: '05:15:00',
        departure_stop_time_id: 'cec954db-f39a-4210-8371-c1d4eee18acc',
        arrival_stop: 'Union Station GO',
        arrival_time: '07:05:00',
        arrival_stop_time_id: '2d1db3a0-faa7-4550-aba7-b6e379a997b1',
        dist_traveled: null,
      },
      {
        trip_id: 'c01fbd42-ca05-4045-b2d7-f1b78e6cd4ad',
        trip_headsign: 'KI - Union Station GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Kitchener GO',
        departure_time: '06:38:00',
        departure_stop_time_id: '4251c532-b7cc-43ca-9184-7c6d5059f412',
        arrival_stop: 'Union Station GO',
        arrival_time: '08:17:00',
        arrival_stop_time_id: '3a38e7cc-81fe-4561-b218-6892caf83b04',
        dist_traveled: null,
      },
      {
        trip_id: '93bb74d0-40b8-4966-b724-497a5bba3171',
        trip_headsign: 'KI - Union Station GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Kitchener GO',
        departure_time: '07:38:00',
        departure_stop_time_id: 'ad7754e1-45d9-42fe-8034-30ac8e785c5d',
        arrival_stop: 'Union Station GO',
        arrival_time: '09:17:00',
        arrival_stop_time_id: 'ac04ad05-17c6-4a09-950d-ce909b948602',
        dist_traveled: null,
      },
      {
        trip_id: '1a17c397-ac87-4057-ae3c-1635317abd98',
        trip_headsign: 'KI - Union Station GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Kitchener GO',
        departure_time: '08:36:00',
        departure_stop_time_id: '15e73d8c-4454-4c10-a5fd-fbed48859854',
        arrival_stop: 'Union Station GO',
        arrival_time: '10:15:00',
        arrival_stop_time_id: '8595db37-9e2e-4a38-a885-c0b143b0bdd8',
        dist_traveled: null,
      },
      {
        trip_id: 'a23c4c81-c207-488d-95ae-639fae6a6c95',
        trip_headsign: 'KI - Union Station GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Kitchener GO',
        departure_time: '11:48:00',
        departure_stop_time_id: '01a62c08-8b88-4c3d-a37f-f50e185dad1d',
        arrival_stop: 'Union Station GO',
        arrival_time: '13:35:00',
        arrival_stop_time_id: 'd13f17ea-00ed-4e78-8364-7d7e5e69dec8',
        dist_traveled: null,
      },
      {
        trip_id: '567b0e23-9fca-476f-bca9-ea2d5c227cac',
        trip_headsign: 'KI - Union Station GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Kitchener GO',
        departure_time: '14:48:00',
        departure_stop_time_id: 'c8f6b250-25c0-4f62-aa6f-66357622f1c4',
        arrival_stop: 'Union Station GO',
        arrival_time: '16:35:00',
        arrival_stop_time_id: '4a3465c3-e7e9-4ab5-bafd-88dd1fffd34a',
        dist_traveled: null,
      },
      {
        trip_id: '0bfe8767-6632-4b72-bd0e-f6469f1dc8b4',
        trip_headsign: 'KI - Union Station GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Kitchener GO',
        departure_time: '20:48:00',
        departure_stop_time_id: '7cbdb741-25f9-4f44-938f-c5025baa2779',
        arrival_stop: 'Union Station GO',
        arrival_time: '22:35:00',
        arrival_stop_time_id: '2d0a5cb6-5a49-4bfa-a89c-65988ebe88db',
        dist_traveled: null,
      },
      {
        trip_id: '9446c0e1-3c77-4c01-81d8-1e435d657950',
        trip_headsign: 'KI - Union Station GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Kitchener GO',
        departure_time: '07:08:00',
        departure_stop_time_id: '925dfd3c-62a6-4280-97c5-d354949c9c82',
        arrival_stop: 'Union Station GO',
        arrival_time: '08:47:00',
        arrival_stop_time_id: '266d9077-81c5-4d7c-83ae-037a0add912b',
        dist_traveled: null,
      },
      {
        trip_id: '44921511-bb81-4974-8d6b-8d0772cc81cf',
        trip_headsign: 'KI - Union Station GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Kitchener GO',
        departure_time: '06:07:00',
        departure_stop_time_id: 'c25389e4-09f5-4bd6-b846-33e04cf19ca3',
        arrival_stop: 'Union Station GO',
        arrival_time: '07:47:00',
        arrival_stop_time_id: '0b3a4c90-bf48-42cd-b21e-635ba5045b29',
        dist_traveled: null,
      },
      {
        trip_id: 'bc77e6fb-eceb-4f12-8b86-dde423d48ffa',
        trip_headsign: 'KI - Union Station GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Kitchener GO',
        departure_time: '08:08:00',
        departure_stop_time_id: 'ddb7811d-5750-4d87-8cb2-25a43bc03f30',
        arrival_stop: 'Union Station GO',
        arrival_time: '09:47:00',
        arrival_stop_time_id: '6e30a8ad-c7e4-46ae-8b40-603c4292f527',
        dist_traveled: null,
      },
    ];

    const unionToKitchenerTrips = [
      {
        trip_id: 'd68ddecd-83fc-496c-aaa6-1e587c824fb2',
        trip_headsign: 'KI - Kitchener GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Union Station GO',
        departure_time: '21:34:00',
        departure_stop_time_id: '3286e435-2d01-46f0-a381-5bad5a12e358',
        arrival_stop: 'Kitchener GO',
        arrival_time: '23:26:00',
        arrival_stop_time_id: 'e6b4e38a-7db6-42f6-b77a-cbb4e246c01b',
        dist_traveled: null,
      },
      {
        trip_id: 'f7de77e3-474c-4cd4-95da-0d517ab1f966',
        trip_headsign: 'KI - Kitchener GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Union Station GO',
        departure_time: '17:22:00',
        departure_stop_time_id: '5690530a-def3-4139-9b77-3ddcdc3622f2',
        arrival_stop: 'Kitchener GO',
        arrival_time: '19:06:00',
        arrival_stop_time_id: 'bc9a29c3-f907-4e91-82c9-a1fbea8b0cb1',
        dist_traveled: null,
      },
      {
        trip_id: 'bebf4d10-d699-4712-a967-ef7a98d26680',
        trip_headsign: 'KI - Kitchener GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Union Station GO',
        departure_time: '15:34:00',
        departure_stop_time_id: '0671492f-c2e6-43d8-a883-96a6b15e384f',
        arrival_stop: 'Kitchener GO',
        arrival_time: '17:26:00',
        arrival_stop_time_id: 'e352b0a9-ae82-4407-9f65-47ac31d5e786',
        dist_traveled: null,
      },
      {
        trip_id: 'f431fce6-e46f-4db3-b285-d44da6349d5c',
        trip_headsign: 'KI - Kitchener GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Union Station GO',
        departure_time: '22:34:00',
        departure_stop_time_id: '2e4cb1e9-82bc-4e97-b4f0-dd3b43eec51f',
        arrival_stop: 'Kitchener GO',
        arrival_time: '24:26:00',
        arrival_stop_time_id: 'c010b35c-6adb-4237-a608-92e1364d5912',
        dist_traveled: null,
      },
      {
        trip_id: '1a03b9a4-a285-4f66-bf5a-33e787ebb40f',
        trip_headsign: 'KI - Kitchener GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Union Station GO',
        departure_time: '16:52:00',
        departure_stop_time_id: '240cb51d-34fc-48f6-b6c1-353844541fc2',
        arrival_stop: 'Kitchener GO',
        arrival_time: '18:36:00',
        arrival_stop_time_id: '11d25bd8-cdce-4c5f-b701-5ec80f441d88',
        dist_traveled: null,
      },
      {
        trip_id: '2171fa93-144c-4383-9195-dca9520df018',
        trip_headsign: 'KI - Kitchener GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Union Station GO',
        departure_time: '09:34:00',
        departure_stop_time_id: '894e0660-31dc-4cdd-ba9e-fae917cc0280',
        arrival_stop: 'Kitchener GO',
        arrival_time: '11:26:00',
        arrival_stop_time_id: '610f2b2f-4c17-4d5c-80ae-dfe97e55e336',
        dist_traveled: null,
      },
      {
        trip_id: 'db0cbcca-bc1b-49c2-ba32-e9d91e7dec9b',
        trip_headsign: 'KI - Kitchener GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Union Station GO',
        departure_time: '16:22:00',
        departure_stop_time_id: 'ecdb7569-ece8-42cb-94d3-582a0393ab20',
        arrival_stop: 'Kitchener GO',
        arrival_time: '18:05:00',
        arrival_stop_time_id: '8157a708-bcb7-4bb5-8811-801c29bf9c2c',
        dist_traveled: null,
      },
      {
        trip_id: 'dc1d203f-7dfe-4495-b921-4b6b3e18bb2d',
        trip_headsign: 'KI - Kitchener GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Union Station GO',
        departure_time: '17:51:00',
        departure_stop_time_id: 'ba595e98-a237-44e3-89b9-ec04a24238f2',
        arrival_stop: 'Kitchener GO',
        arrival_time: '19:37:00',
        arrival_stop_time_id: '7d160f4b-7284-4002-be86-516c51452a84',
        dist_traveled: null,
      },
      {
        trip_id: 'c442b4bc-bd19-442c-ab50-58d1b0568f02',
        trip_headsign: 'KI - Kitchener GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Union Station GO',
        departure_time: '18:21:00',
        departure_stop_time_id: 'c7a4ce1e-16f1-4c3b-a0bf-ee550cc4bd0a',
        arrival_stop: 'Kitchener GO',
        arrival_time: '20:04:00',
        arrival_stop_time_id: 'ca25b8f4-93a9-490a-bf73-b487617aabde',
        dist_traveled: null,
      },
      {
        trip_id: 'e03d5adc-a5a5-4a12-b998-1d1c63bee4fc',
        trip_headsign: 'KI - Kitchener GO',
        service_id: '20251211',
        route_long_name: 'Kitchener',
        departure_stop: 'Union Station GO',
        departure_time: '12:34:00',
        departure_stop_time_id: 'be6a15aa-9ae6-4176-8624-f9391b60c2d8',
        arrival_stop: 'Kitchener GO',
        arrival_time: '14:26:00',
        arrival_stop_time_id: 'b18a78cc-d3de-4702-b449-b679505fd39f',
        dist_traveled: null,
      },
    ];

    let user = await em.findOne(User, { email: 'seeder_user@example.com' });
    if (!user) {
      user = em.create(User, {
        name: 'Seeder User',
        email: 'seeder_user@example.com',
        phoneNumber: '555-555-5555',
        authUserId: randomUUID(),
      });
      em.persist(user);
    }

    const parseTime = (timeStr: string): Date => {
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      const date = new Date('2025-12-11T00:00:00Z');
      date.setUTCHours(hours, minutes, seconds || 0);
      return date;
    };

    const getOrInsertTrip = async (tripData: TripSeedData): Promise<Trip> => {
      const gtfsTrip = await em.findOneOrFail(GTFSTrip, {
        id: tripData.trip_id,
      });
      const originStopTime = await em.findOneOrFail(GTFSStopTime, {
        id: tripData.departure_stop_time_id,
      });
      const destinationStopTime = await em.findOneOrFail(GTFSStopTime, {
        id: tripData.arrival_stop_time_id,
      });
      const date = new Date('2025-12-11');

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
          originStopName: tripData.departure_stop,
          destinationStopName: tripData.arrival_stop,
          routeShortName: 'KI', // Hardcoded as it's not in JSON but usually KI for Kitchener
          routeLongName: tripData.route_long_name,
          departureTime: parseTime(tripData.departure_time),
          arrivalTime: parseTime(tripData.arrival_time),
        });
        em.persist(trip);
      }
      return trip;
    };

    let itinerariesCreated = 0;
    for (const outboundData of kitchenerToUnionTrips) {
      if (itinerariesCreated >= 5) break;

      // Find a return trip at least 30 mins after arrival
      // Arrival + 30m
      const outboundArrivalTime = parseTime(outboundData.arrival_time);
      const minReturnTime = new Date(
        outboundArrivalTime.getTime() + 30 * 60000,
      );

      const matchingReturn = unionToKitchenerTrips.find((returnData) => {
        const returnDepartureTime = parseTime(returnData.departure_time);
        return returnDepartureTime > minReturnTime;
      });

      if (matchingReturn) {
        const outboundTrip = await getOrInsertTrip(outboundData);
        const returnTrip = await getOrInsertTrip(matchingReturn);

        // Create Itinerary
        const itinerary = em.create(Itinerary, {
          user,
          status: ItineraryStatus.CONFIRMED,
          wantsToSteward: false,
        });

        // Create Bookings
        const outboundBooking = em.create(TripBooking, {
          user,
          trip: outboundTrip,
          itinerary,
          status: TripBookingStatus.PENDING,
          sequence: 1,
        });

        const returnBooking = em.create(TripBooking, {
          user,
          trip: returnTrip,
          itinerary,
          status: TripBookingStatus.PENDING,
          sequence: 2,
        });

        em.persist([itinerary, outboundBooking, returnBooking]);
        itinerariesCreated++;
      }
    }

    await em.flush();
  }
}

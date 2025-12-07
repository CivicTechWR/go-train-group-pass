import { Collection } from '@mikro-orm/core';
import { Trip, TripBooking, Itinerary, User } from '../entities';
import { TripBookingStatus } from '../entities/tripBookingEnum';

/**
 * Test utilities for group formation tests.
 * Provides factory functions to create mock entities.
 */

let userIdCounter = 0;
let tripIdCounter = 0;
let bookingIdCounter = 0;
let itineraryIdCounter = 0;

export function resetCounters(): void {
  userIdCounter = 0;
  tripIdCounter = 0;
  bookingIdCounter = 0;
  itineraryIdCounter = 0;
}

export function createMockUser(overrides: Partial<User> = {}): User {
  const id = `user-${++userIdCounter}`;
  const user = new User();
  user.id = id;
  user.name = overrides.name ?? `Test User ${userIdCounter}`;
  user.email = overrides.email ?? `${id}@test.com`;
  user.phoneNumber =
    overrides.phoneNumber ?? `555-01${String(userIdCounter).padStart(2, '0')}`;
  user.authUserId = overrides.authUserId ?? `auth-${id}`;
  return user;
}

export function createMockTrip(
  departureTime: string = '08:00:00',
  serviceId: string = '20251207',
): Trip {
  const id = `trip-${++tripIdCounter}`;
  const trip = new Trip();
  trip.id = id;

  // Set up related entities using Object.defineProperty to match entity structure
  Object.defineProperty(trip, 'gtfsTrip', {
    value: { serviceId },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  Object.defineProperty(trip, 'originStopTime', {
    value: { departureTime },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  Object.defineProperty(trip, 'destinationStopTime', {
    value: { arrivalTime: '09:00:00' },
    writable: true,
    configurable: true,
    enumerable: true,
  });

  return trip;
}

export function createMockItinerary(
  wantsToSteward: boolean,
  trips: Trip[],
): Itinerary {
  const id = `itinerary-${++itineraryIdCounter}`;
  const itinerary = new Itinerary();
  itinerary.id = id;
  itinerary.wantsToSteward = wantsToSteward;

  // Create mock bookings for the trips
  const mockBookings = trips.map((trip) => {
    const booking = new TripBooking();
    booking.trip = trip;
    return booking;
  });

  // Create a mock Collection
  const mockCollection = {
    isInitialized: () => true,
    getItems: () => mockBookings,
    get length() {
      return mockBookings.length;
    },
  };

  itinerary.tripBookings = mockCollection as unknown as Collection<TripBooking>;

  return itinerary;
}

export function createMockBooking(
  user: User,
  trip: Trip,
  itinerary: Itinerary | undefined = undefined,
  status: TripBookingStatus = TripBookingStatus.CHECKED_IN,
): TripBooking {
  const id = `booking-${++bookingIdCounter}`;
  const booking = new TripBooking();
  booking.id = id;
  booking.user = user;
  booking.trip = trip;
  booking.itinerary = itinerary;
  booking.status = status;
  booking.group = undefined;
  return booking;
}

/**
 * Creates a set of mock bookings for testing group formation
 */
export interface MockScenario {
  bookings: TripBooking[];
  stewardCandidates: TripBooking[];
  users: User[];
  trips: Trip[];
}

/**
 * Create a scenario with N users, all with the same itinerary
 */
export function createUniformItineraryScenario(
  userCount: number,
  stewardCount: number,
  tripIds: string[] = ['trip-1'],
): MockScenario {
  resetCounters();

  const users: User[] = [];
  const trips = tripIds.map((id) => {
    const trip = createMockTrip();
    trip.id = id;
    return trip;
  });

  const bookings: TripBooking[] = [];
  const stewardCandidates: TripBooking[] = [];

  for (let i = 0; i < userCount; i++) {
    const user = createMockUser();
    users.push(user);

    const isSteward = i < stewardCount;
    const itinerary = createMockItinerary(isSteward, trips);
    const booking = createMockBooking(user, trips[0], itinerary);

    bookings.push(booking);
    if (isSteward) {
      stewardCandidates.push(booking);
    }
  }

  return { bookings, stewardCandidates, users, trips };
}

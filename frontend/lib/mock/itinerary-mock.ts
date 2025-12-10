import { Itinerary } from '../types/itinerary';

/**
 * Mock data for existing itineraries
 */
export const itineraryMock: Itinerary[] = [
  {
    tripDetails: [
      {
        departureTime: new Date('2025-12-10T07:30:00-05:00'),
        arrivalTime: new Date('2025-12-10T09:15:00-05:00'),
        orgStation: 'Kitchener Station',
        destStation: 'Union Station',
        tripId: 'mock-trip-1',
        routeShortName: 'GO',
      },
      {
        departureTime: new Date('2025-12-10T17:30:00-05:00'),
        arrivalTime: new Date('2025-12-10T19:15:00-05:00'),
        orgStation: 'Union Station',
        destStation: 'Kitchener Station',
        tripId: 'mock-trip-2',
        routeShortName: 'GO',
      },
    ],
    userCount: 3,
    tripSequence: 'Kitchener Station -> Union Station',
  },
  {
    tripDetails: [
      {
        departureTime: new Date('2025-12-11T08:00:00-05:00'),
        arrivalTime: new Date('2025-12-11T09:45:00-05:00'),
        orgStation: 'Guelph Central Station',
        destStation: 'Union Station',
        tripId: 'mock-trip-3',
        routeShortName: 'GO',
      },
      {
        departureTime: new Date('2025-12-11T10:15:00-05:00'),
        arrivalTime: new Date('2025-12-11T12:00:00-05:00'),
        orgStation: 'Union Station',
        destStation: 'Kitchener Station',
        tripId: 'mock-trip-4',
        routeShortName: 'GO',
      },
      {
        departureTime: new Date('2025-12-11T18:00:00-05:00'),
        arrivalTime: new Date('2025-12-11T19:45:00-05:00'),
        orgStation: 'Kitchener Station',
        destStation: 'Guelph Central Station',
        tripId: 'mock-trip-5',
        routeShortName: 'GO',
      },
    ],
    userCount: 1,
    tripSequence: 'Guelph Central Station -> Union Station',
  },
  {
    tripDetails: [
      {
        departureTime: new Date('2025-12-12T06:45:00-05:00'),
        arrivalTime: new Date('2025-12-12T08:30:00-05:00'),
        orgStation: 'Kitchener Station',
        destStation: 'Union Station',
        tripId: 'mock-trip-6',
        routeShortName: 'GO',
      },
    ],
    userCount: 4,
    tripSequence: 'Kitchener Station -> Union Station',
  },
];

import { Itinerary } from '../types/itinerary';

/**
 * Mock data for existing itineraries
 */
export const itineraryMock: Itinerary[] = [
  {
    trips: [
      {
        departureTime: '2025-12-10T07:30:00-05:00',
        arrivalTime: '2025-12-10T09:15:00-05:00',
        orgStation: 'Kitchener Station',
        destStation: 'Union Station',
      },
      {
        departureTime: '2025-12-10T17:30:00-05:00',
        arrivalTime: '2025-12-10T19:15:00-05:00',
        orgStation: 'Union Station',
        destStation: 'Kitchener Station',
      },
    ],
    interestedUsersCount: 3,
  },
  {
    trips: [
      {
        departureTime: '2025-12-11T08:00:00-05:00',
        arrivalTime: '2025-12-11T09:45:00-05:00',
        orgStation: 'Guelph Central Station',
        destStation: 'Union Station',
      },
      {
        departureTime: '2025-12-11T10:15:00-05:00',
        arrivalTime: '2025-12-11T12:00:00-05:00',
        orgStation: 'Union Station',
        destStation: 'Kitchener Station',
      },
      {
        departureTime: '2025-12-11T18:00:00-05:00',
        arrivalTime: '2025-12-11T19:45:00-05:00',
        orgStation: 'Kitchener Station',
        destStation: 'Guelph Central Station',
      },
    ],
    interestedUsersCount: 1,
  },
  {
    trips: [
      {
        departureTime: '2025-12-12T06:45:00-05:00',
        arrivalTime: '2025-12-12T08:30:00-05:00',
        orgStation: 'Kitchener Station',
        destStation: 'Union Station',
      },
    ],
    interestedUsersCount: 4,
  },
];


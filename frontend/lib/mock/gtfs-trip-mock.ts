import { GTFSTrip } from '../types/gtfs-trip';

/**
 * Mock data for GTFS Trip
 */
export const gtfsTripMock: GTFSTrip[] = [
  {
    id: 'trip-001',
    calendarDate: '2025-12-04T07:30:00',
    tripHeadsign: 'Union Station',
    tripShortName: 'Early Morning Commute',
    directionId: 0,
    blockId: 'block-001',
    shapeId: 'shape-kitchener-union',
    wheelchairAccessible: 1,
    bikesAllowed: 1,
    routeId: 'route-001',
    // Ontario timezone in ISO, but as string type (literal)
    createdAt: '2025-12-01T05:00:00-05:00',
    updatedAt: '2025-12-03T10:00:00-05:00',
  },
  {
    id: 'trip-002',
    calendarDate: '2025-12-05T10:00:00',
    tripHeadsign: 'Kitchener Station',
    tripShortName: 'Waffle Rocket',
    directionId: 1,
    blockId: 'block-002',
    shapeId: 'shape-union-kitchener',
    wheelchairAccessible: 1,
    bikesAllowed: 0,
    routeId: 'route-001',
    createdAt: '2025-12-01T10:00:00-05:00',
    updatedAt: '2025-12-03T10:00:00-05:00',
  },
  {
    id: 'trip-003',
    calendarDate: '2025-12-05T08:00:00',
    tripHeadsign: 'Union Station',
    tripShortName: 'Sunrise Commuter',
    directionId: 0,
    blockId: 'block-003',
    shapeId: 'shape-kitchener-union',
    wheelchairAccessible: 1,
    bikesAllowed: 1,
    routeId: 'route-001',
    createdAt: '2025-12-01T10:00:00-05:00',
    updatedAt: '2025-12-03T10:00:00-05:00',
  },
];


import { GTFSTrip } from '../types/gtfs-trip';

/**
 * Mock data for GTFS Trip
 */
export const gtfsTripMock: GTFSTrip[] = [
  {
    id: 'trip-001',
    tripHeadsign: 'Union Station',
    tripShortName: 'Morning Commute',
    directionId: 0,
    blockId: 'block-001',
    shapeId: 'shape-kitchener-union',
    wheelchairAccessible: 1,
    bikesAllowed: 1,
    routeId: 'route-001',
    createdAt: new Date('2025-12-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-12-03T10:00:00Z').toISOString(),
  },
  {
    id: 'trip-002',
    tripHeadsign: 'Kitchener Station',
    tripShortName: 'Waffle Rocket',
    directionId: 1,
    blockId: 'block-002',
    shapeId: 'shape-union-kitchener',
    wheelchairAccessible: 1,
    bikesAllowed: 0,
    routeId: 'route-001',
    createdAt: new Date('2025-12-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-12-03T10:00:00Z').toISOString(),
  },
  {
    id: 'trip-003',
    tripHeadsign: 'Union Station',
    tripShortName: 'Sunrise Commuter',
    directionId: 0,
    blockId: 'block-003',
    shapeId: 'shape-kitchener-union',
    wheelchairAccessible: 1,
    bikesAllowed: 1,
    routeId: 'route-001',
    createdAt: new Date('2025-12-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-12-03T10:00:00Z').toISOString(),
  },
];


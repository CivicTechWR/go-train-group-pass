import { GTFSRoute } from '../types/gtfs-route';

/**
 * Mock data for GTFS Route
 */
export const gtfsRouteMock: GTFSRoute[] = [
  {
    id: 'route-001',
    routeShortName: 'Kitchener-Union',
    routeLongName: 'Kitchener-Union',
    routeDesc: 'Express service between Kitchener and Union',
    routeType: 2, // Rail
    routeUrl: 'https://example.com/routes/1',
    routeColor: '#00FF00',
    routeTextColor: '#FFFFFF',
    agencyId: 'agency-001',
    createdAt: new Date('2025-12-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-12-03T10:00:00Z').toISOString(),
  },
];


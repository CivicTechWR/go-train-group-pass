import { z } from 'zod';

/**
 * Schema for GTFS Route entity
 * Matches backend GTFSRoute entity
 */
export const GTFSRouteSchema = z.object({
  id: z.string(),
  routeShortName: z.string(),
  routeLongName: z.string(),
  routeDesc: z.string().nullable().optional(),
  routeType: z.number(), // 0=Tram, 1=Subway, 2=Rail, 3=Bus
  routeUrl: z.string().nullable().optional(),
  routeColor: z.string().nullable().optional(),
  routeTextColor: z.string().nullable().optional(),
  agencyId: z.string().nullable().optional(), // Reference to agency
  createdAt: z.iso.datetime().nullable().optional(),
  updatedAt: z.iso.datetime().nullable().optional(),
});

export type GTFSRoute = z.infer<typeof GTFSRouteSchema>;


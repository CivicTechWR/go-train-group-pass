import { z } from 'zod';

/**
 * Schema for GTFS Trip entity
 * Matches backend GTFSTrip entity
 */
export const GTFSTripSchema = z.object({
  id: z.string(),
  // calendarDateServiceId: z.string(), // Reference to calendarDate (composite key part 1)
  // calendarDateDate: z.iso.date(), // Reference to calendarDate (composite key part 2)
  tripHeadsign: z.string().nullable().optional(),
  tripShortName: z.string().nullable().optional(),
  directionId: z.number().nullable().optional(),
  blockId: z.string().nullable().optional(),
  shapeId: z.string().nullable().optional(),
  wheelchairAccessible: z.number().nullable().optional(),
  bikesAllowed: z.number().nullable().optional(),
  routeId: z.string(), // Reference to route
  createdAt: z.iso.datetime().nullable().optional(),
  updatedAt: z.iso.datetime().nullable().optional(),
});

export type GTFSTrip = z.infer<typeof GTFSTripSchema>;


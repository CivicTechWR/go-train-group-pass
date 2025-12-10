import { z } from 'zod';

/**
 * Schema for creating an itinerary
 * Matches CreateItinerarySchema from shared package
 */
const ItinerarySegmentSchema = z.object({
  originStopTimeId: z.string(),
  destStopTimeId: z.string(),
  gtfsTripId: z.string(),
});

export const CreateItinerarySchema = z.object({
  segments: z.array(ItinerarySegmentSchema),
  wantsToSteward: z.boolean(),
});

export type CreateItineraryInput = z.infer<typeof CreateItinerarySchema>;

/**
 * Schema for trip details in itinerary response
 * Matches TripDetailsSchema from shared package
 * Uses coerce to handle date strings from backend (database returns dates as strings in JSON)
 */
const TripDetailsSchema = z.object({
  tripId: z.string(),
  routeShortName: z.string(),
  orgStation: z.string(),
  destStation: z.string(),
  departureTime: z.coerce.date(),
  arrivalTime: z.coerce.date(),
});

/**
 * Schema for itinerary creation response
 * Matches ItineraryCreationResponseSchema from shared package
 */
export const ItineraryCreationResponseSchema = z.object({
  id: z.string(),
  trips: z.array(TripDetailsSchema),
  stewarding: z.boolean(),
});

export type ItineraryCreationResponse = z.infer<
  typeof ItineraryCreationResponseSchema
>;

/**
 * Schema for existing itinerary from API
 * Matches ExistingItinerarySchema from shared package
 */
export const ExistingItinerarySchema = z.object({
  userCount: z.number(),
  tripDetails: z.array(TripDetailsSchema),
});

export type ExistingItinerary = z.infer<typeof ExistingItinerarySchema>;

/**
 * Schema for array of existing itineraries
 * Matches ExistingItinerariesSchema from shared package
 */
export const ExistingItinerariesSchema = z.array(ExistingItinerarySchema);

export type ExistingItineraries = z.infer<typeof ExistingItinerariesSchema>;

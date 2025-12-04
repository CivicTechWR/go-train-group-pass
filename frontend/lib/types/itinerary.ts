import { z } from 'zod';

/**
 * Schema for a single trip within an itinerary
 * Represents one leg of a journey in the itinerary sequence
 */
export const ItineraryTripSchema = z.object({
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime(),
  orgStation: z.string(),
  destStation: z.string(),
});

export type ItineraryTrip = z.infer<typeof ItineraryTripSchema>;

/**
 * Schema for an itinerary
 * An itinerary represents a sequence of trips with interested users
 */
export const ItinerarySchema = z.object({
  trips: z.array(ItineraryTripSchema),
  interestedUsersCount: z.number().int().min(0),
});

export type Itinerary = z.infer<typeof ItinerarySchema>;


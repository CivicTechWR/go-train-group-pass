import { z } from 'zod';
import {
  CreateItinerarySchema as SharedCreateItinerarySchema,
  ItineraryCreationResponseSchema as SharedItineraryCreationResponseSchema,
  ExistingItinerarySchema as SharedExistingItinerarySchema,
  ExistingItinerariesSchema as SharedExistingItinerariesSchema,
  QuickViewItinerarySchema as SharedQuickViewItinerarySchema,
  QuickViewItinerariesSchema as SharedQuickViewItinerariesSchema,
  ItineraryTravelInfoSchema as SharedItineraryTravelInfoSchema,
} from '@go-train-group-pass/shared/schemas';

/**
 * Schema for creating an itinerary
 * Matches CreateItinerarySchema from shared package
 */
export const CreateItinerarySchema = SharedCreateItinerarySchema;

export type CreateItineraryInput = z.infer<typeof CreateItinerarySchema>;

/**
 * Schema for itinerary creation response
 * Matches ItineraryCreationResponseSchema from shared package
 */
export const ItineraryCreationResponseSchema = SharedItineraryCreationResponseSchema;

export type ItineraryCreationResponse = z.infer<
  typeof ItineraryCreationResponseSchema
>;

/**
 * Schema for existing itinerary from API
 * Matches ExistingItinerarySchema from shared package
 */
export const ExistingItinerarySchema = SharedExistingItinerarySchema;

export type ExistingItinerary = z.infer<typeof ExistingItinerarySchema>;
export type Itinerary = ExistingItinerary;

/**
 * Schema for array of existing itineraries
 * Matches ExistingItinerariesSchema from shared package
 */
export const ExistingItinerariesSchema = SharedExistingItinerariesSchema;

export type ExistingItineraries = z.infer<typeof ExistingItinerariesSchema>;

export const QuickViewItinerarySchema = SharedQuickViewItinerarySchema;

export type QuickViewItinerary = z.infer<typeof QuickViewItinerarySchema>;

export const QuickViewItinerariesSchema = SharedQuickViewItinerariesSchema;

export type QuickViewItineraries = z.infer<typeof QuickViewItinerariesSchema>;

export const ItineraryTravelInfoSchema = SharedItineraryTravelInfoSchema;
export type ItineraryTravelInfo = z.infer<typeof ItineraryTravelInfoSchema>;

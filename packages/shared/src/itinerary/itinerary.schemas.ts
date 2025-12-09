import z from "zod";
import { TripDetailsSchema } from "../trip/trip.schemas";
import { StewardSchema, TravelGroupMemberSchema } from "../travel-group/travel-group.schemas";

export const ItineraryResponseSchema = z.object({
  id: z.string(),
  trips: z.array(TripDetailsSchema),
  stewarding: z.boolean(),
});

export const ItineraryQueryParamsSchema = z.object({
  id: z.string(),
});
export const ItineraryCreationResponseSchema = ItineraryResponseSchema;

const ItinerarySegmentSchema = z.object({
  originStopTimeId: z.string(),
  destStopTimeId: z.string(),
  gtfsTripId: z.string(),
});

export const CreateItinerarySchema = z.object({
  segments: z.array(ItinerarySegmentSchema),
  wantsToSteward: z.boolean(),
});

export const ItineraryTravelInfoSchema = z.object({
  members: z.array(TravelGroupMemberSchema).optional(),
  steward: StewardSchema.optional(),
  tripDetails: z.array(TripDetailsSchema),
  groupsFormed: z.boolean(),
});
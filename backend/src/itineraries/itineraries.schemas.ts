import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Schema for a single segment in an itinerary
 * Each segment represents one leg of a journey (e.g., Kitchener -> Union)
 */
export const SegmentSchema = z.object({
  originStopId: z.string().min(1, 'Origin stop ID is required'),
  destStopId: z.string().min(1, 'Destination stop ID is required'),
  gtfsTripId: z.string().min(1, 'GTFS trip ID is required'),
});

export type Segment = z.infer<typeof SegmentSchema>;

/**
 * Schema for creating an itinerary
 * Body: { segments: [{ originStopId, destStopId, gtfsTripId }], wantsToSteward: boolean }
 */
export const CreateItinerarySchema = z.object({
  segments: z
    .array(SegmentSchema)
    .min(1, 'At least one segment is required')
    .max(10, 'Maximum 10 segments allowed'),
  wantsToSteward: z.boolean(),
});

export class CreateItineraryDto extends createZodDto(CreateItinerarySchema) {}

export type CreateItineraryInput = z.infer<typeof CreateItinerarySchema>;

/**
 * Response schema for created itinerary
 */
export const ItineraryResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  wantsToSteward: z.boolean(),
  createdAt: z.date(),
  tripBookings: z.array(
    z.object({
      id: z.string().uuid(),
      sequence: z.number(),
      status: z.string(),
      trip: z.object({
        id: z.string().uuid(),
        originStopTime: z.object({
          id: z.string().uuid(),
          departureTime: z.string(),
          stop: z.object({
            stopId: z.string(),
            stopName: z.string(),
          }),
        }),
        destinationStopTime: z.object({
          id: z.string().uuid(),
          arrivalTime: z.string(),
          stop: z.object({
            stopId: z.string(),
            stopName: z.string(),
          }),
        }),
      }),
    }),
  ),
});

export type ItineraryResponse = z.infer<typeof ItineraryResponseSchema>;

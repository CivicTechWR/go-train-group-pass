import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ItinerarySegmentSchema = z.object({
  originStopTimeId: z.string(),
  destStopTimeId: z.string(),
  gtfsTripId: z.string(),
});

const CreateItinerarySchema = z.object({
  segments: z.array(ItinerarySegmentSchema),
  wantsToSteward: z.boolean(),
});

export class CreateItineraryDto extends createZodDto(CreateItinerarySchema) {}

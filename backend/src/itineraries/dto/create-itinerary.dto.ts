import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ItinerarySegmentSchema = z.object({
  originStopId: z.uuid(),
  destStopId: z.uuid(),
  gtfsTripId: z.uuid(),
});

const CreateItinerarySchema = z.object({
  segments: z.array(ItinerarySegmentSchema),
  wantsToSteward: z.boolean(),
});

export class CreateItineraryDto extends createZodDto(CreateItinerarySchema) {}

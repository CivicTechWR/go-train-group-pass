import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const RoundTripQuerySchema = z.object({
  orgStopId: z.string().min(1, 'Origin stop ID is required'),
  destStopId: z.string().min(1, 'Destination stop ID is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export class RoundTripQueryDto extends createZodDto(RoundTripQuerySchema) {}

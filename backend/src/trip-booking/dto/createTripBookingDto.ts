import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TripBookingStatus } from 'src/entities/tripBookingEnum';

//validate TripBookingStatus with zod

const CreateTripBookingSchema = z.object({
  sequence: z.number().optional(),
  status: z.enum(TripBookingStatus),
  itineraryId: z.string(),
  tripId: z.string(),
});

export class CreateTripBookingDto extends createZodDto(
  CreateTripBookingSchema,
) {}

import z from 'zod';

export const TripDetailsSchema = z.object({
  tripId: z.string(),
  routeShortName: z.string(),
  orgStation: z.string(),
  destStation: z.string(),
  // Use coerce to handle date strings from database JSON aggregation
  departureTime: z.coerce.date(),
  arrivalTime: z.coerce.date(),
});

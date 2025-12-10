import z from 'zod';

export const TripDetailsSchema = z.object({
    tripId: z.string(),
    routeShortName: z.string(),
    orgStation: z.string(),
    destStation: z.string(),
    departureTime: z.coerce.date(),
    arrivalTime: z.coerce.date(),
    sequence: z.number().optional(),
    bookingId: z.string().optional(),
    isCheckedIn: z.boolean().optional(),
});

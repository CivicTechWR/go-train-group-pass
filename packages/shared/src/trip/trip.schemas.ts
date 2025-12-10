import z from 'zod';

export const TripDetailsSchema = z.object({
    tripId: z.string(),
    routeShortName: z.string(),
    orgStation: z.string(),
    destStation: z.string(),
    departureTime: z.date(),
    arrivalTime: z.date(),
    sequence: z.number().optional(),
});

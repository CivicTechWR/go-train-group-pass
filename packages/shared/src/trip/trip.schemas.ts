import z from "zod";

export const TripDetailsSchema = z.object({
    orgStation: z.string(),
    destStation: z.string(),
    departureTime: z.date(),
    arrivalTime: z.date(),
});

import z from "zod";

export const TripScheduleDetailsSchema = z.object({
    orgStation: z.string(),
    destStation: z.string(),
    departureTime: z.date(),
    arrivalTime: z.date(),
    tripCreationMetaData: z.object({
        tripId: z.string(),
        arrivalStopTimeId: z.string(),
        departureStopTimeId: z.string(),
    }),
});

export const RoundTripSchema = z.object({
    departureTrips: z.array(TripScheduleDetailsSchema),
    returnTrips: z.array(TripScheduleDetailsSchema),

})
export const KitchenerUnionRoundTripScheduleInputSchema = z.object({
    date: z.iso.date(),
});
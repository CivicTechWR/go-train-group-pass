import { createZodDto } from "nestjs-zod";
import { KitchenerUnionRoundTripScheduleInputSchema, RoundTripSchema, TripScheduleDetailsSchema } from "./trip-schedule.schemas";

export class TripScheduleDetailsDto extends createZodDto(TripScheduleDetailsSchema) {}
export class RoundTripDto extends createZodDto(RoundTripSchema) {}
export class KitchenerUnionRoundTripScheduleInputDto extends createZodDto(KitchenerUnionRoundTripScheduleInputSchema) {}
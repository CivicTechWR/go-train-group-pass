import { createZodDto } from "nestjs-zod";
import { TripDetailsSchema } from "./trip.schemas";

export class TripDetailsDto extends createZodDto(TripDetailsSchema) { }

import { createZodDto } from "nestjs-zod";
import z from "zod";
import { TripDetailsSchema } from "./trip.schemas";

export class TripDetailsDto extends createZodDto(TripDetailsSchema) {}
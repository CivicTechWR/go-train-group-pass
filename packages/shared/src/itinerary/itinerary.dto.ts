import { ItineraryCreationResponseSchema, CreateItinerarySchema } from "./itinerary.schemas";
import { createZodDto } from "nestjs-zod";

export class ItineraryCreationResponseDto extends createZodDto(ItineraryCreationResponseSchema) {}
export class CreateItineraryDto extends createZodDto(CreateItinerarySchema) {}

import { ItineraryCreationResponseSchema, CreateItinerarySchema, ExistingItinerariesSchema, ExistingItinerarySchema } from "./itinerary.schemas";
import { createZodDto } from "nestjs-zod";

export class ItineraryCreationResponseDto extends createZodDto(ItineraryCreationResponseSchema) {}
export class CreateItineraryDto extends createZodDto(CreateItinerarySchema) {}
export class ExistingItinerariesDto extends createZodDto(ExistingItinerariesSchema) {}
export class ExistingItineraryDto extends createZodDto(ExistingItinerarySchema) {}

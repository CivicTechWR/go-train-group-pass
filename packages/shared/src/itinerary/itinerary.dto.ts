import { ItineraryCreationResponseSchema, CreateItinerarySchema, ItineraryQueryParamsSchema, ItineraryResponseSchema, ItineraryTravelInfoSchema, ExistingItinerariesSchema, ExistingItinerarySchema } from "./itinerary.schemas";
import { createZodDto } from "nestjs-zod";

export class ItineraryCreationResponseDto extends createZodDto(ItineraryCreationResponseSchema) { }
export class CreateItineraryDto extends createZodDto(CreateItinerarySchema) { }
export class ItineraryQueryParamsDto extends createZodDto(ItineraryQueryParamsSchema) { }
export class ItineraryResponseDto extends createZodDto(ItineraryResponseSchema) { }
export class ItineraryTravelInfoDto extends createZodDto(ItineraryTravelInfoSchema) { }
export class ExistingItinerariesDto extends createZodDto(ExistingItinerariesSchema) { }
export class ExistingItineraryDto extends createZodDto(ExistingItinerarySchema) { }

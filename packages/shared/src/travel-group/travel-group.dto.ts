import { createZodDto } from "nestjs-zod";
import { StewardSchema, TravelGroupMemberSchema, TravelGroupSchema } from "./travel-group.schemas";

export class TravelGroupDto extends createZodDto(TravelGroupSchema) {}
export class StewardDto extends createZodDto(StewardSchema) {}
export class TravelGroupMemberDto extends createZodDto(TravelGroupMemberSchema) {}
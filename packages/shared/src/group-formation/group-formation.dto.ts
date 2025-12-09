import { createZodDto } from 'nestjs-zod';
import {
    GroupFormationResultSchema,
    GroupFormationResponseSchema,
} from './group-formation.schemas';

export class GroupFormationResultDto extends createZodDto(
    GroupFormationResultSchema,
) { }

export class GroupFormationResponseDto extends createZodDto(
    GroupFormationResponseSchema,
) { }

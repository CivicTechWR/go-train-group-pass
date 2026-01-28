import { createZodDto } from 'nestjs-zod';
import {
    GroupFormationResultSchema,
} from './group-formation.schemas';

export class GroupFormationResultDto extends createZodDto(
    GroupFormationResultSchema,
) { }


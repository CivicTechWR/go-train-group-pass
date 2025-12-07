import { SetMetadata } from '@nestjs/common';
import { z, ZodObject } from 'zod';

export const ZOD_RESPONSE_SCHEMA = 'ZOD_RESPONSE_SCHEMA';

// Allow passing a raw Zod Schema OR a nestjs-zod DTO Class
export const Serialize = (schema: z.ZodTypeAny | ZodObject) =>
  SetMetadata(ZOD_RESPONSE_SCHEMA, schema);

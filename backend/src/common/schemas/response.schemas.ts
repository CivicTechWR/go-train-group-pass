import { z } from 'zod';

export const PaginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const createResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
  metaSchema: z.ZodTypeAny = PaginationSchema,
) =>
  z.object({
    data: dataSchema,
    meta: metaSchema.optional(),
    message: z.string().optional().default(''),
  });

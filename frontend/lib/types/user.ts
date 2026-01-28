import { z } from 'zod';

/**
 * Schema for user object (from backend formatUserResponse)
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string().nullable(),
});

export type User = z.infer<typeof UserSchema>;

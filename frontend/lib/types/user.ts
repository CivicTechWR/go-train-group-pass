import { z } from 'zod';

/**
 * Schema for user object (from backend formatUserResponse)
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable(),
  createdAt: z.iso.datetime(),
  lastSignInAt: z.iso.datetime().nullable(),
});

export type User = z.infer<typeof UserSchema>;


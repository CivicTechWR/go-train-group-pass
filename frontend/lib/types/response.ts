import { z } from 'zod';
import { UserSchema } from './user';
import { SessionSchema } from './session';

/**
 * Schema for sign up/sign in response
 */
export const AuthResponseSchema = z.object({
  user: UserSchema,
  session: SessionSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/**
 * Schema for refresh token response
 */
export const RefreshResponseSchema = z.object({
  session: SessionSchema,
});

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

/**
 * Schema for message response (signout, password reset, etc.)
 */
export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;


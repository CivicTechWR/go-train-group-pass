import { z } from 'zod';
import { UserSchema } from './user';

/**
 * Schema for sign up/sign in response
 */
export const AuthResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: UserSchema,
  }),
  message: z.string().optional().default(''),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/**
 * Schema for refresh token response
 */
export const RefreshResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: UserSchema,
  }),
  message: z.string().optional().default(''),
});

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

/**
 * Schema for message response (signout, password reset, etc.)
 * Backend may return:
 * - { message: string } directly (for endpoints without Serialize decorator)
 * - { data: { message: string }, message: string } (if wrapped by interceptor)
 * We accept both formats for flexibility
 */
export const MessageResponseSchema = z.union([
  z.object({
    message: z.string(),
  }),
  z.object({
    data: z
      .object({
        message: z.string(),
      })
      .optional(),
    message: z.string(),
  }),
]);

export type MessageResponse = z.infer<typeof MessageResponseSchema>;

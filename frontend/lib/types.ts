import { z } from 'zod';

/**
 * Schema for sign up request
 * Matches backend SignUpDtoSchema
 */
export const SignUpSchema = z.object({
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must not exceed 72 characters'),
  fullName: z.string().min(1, 'Full name must not be empty').optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)')
    .optional(),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;

/**
 * Schema for sign in request
 * Matches backend SignInDtoSchema
 */
export const SignInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInInput = z.infer<typeof SignInSchema>;

/**
 * Schema for password reset request
 * Matches backend PasswordResetRequestSchema
 */
export const PasswordResetRequestSchema = z.object({
  email: z.email('Invalid email address'),
});

export type PasswordResetRequestInput = z.infer<
  typeof PasswordResetRequestSchema
>;

/**
 * Schema for password update request
 * Matches backend PasswordUpdateSchema
 */
export const PasswordUpdateSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must not exceed 72 characters'),
});

export type PasswordUpdateInput = z.infer<typeof PasswordUpdateSchema>;

/**
 * Schema for refresh token request
 * Matches backend RefreshTokenSchema
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

/**
 * Schema for user object (from backend formatUserResponse)
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  avatarUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  lastSignInAt: z.string().datetime().nullable(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Schema for session object (from Supabase)
 */
export const SessionSchema = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number(),
    expires_at: z.number().optional(),
    token_type: z.string(),
    user: z.unknown().optional(),
  })
  .loose(); // Allow additional fields from Supabase

export type Session = z.infer<typeof SessionSchema>;

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

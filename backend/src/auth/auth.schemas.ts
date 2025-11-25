import { z } from 'zod';

/**
 * Schema for Supabase user_metadata
 * This replaces the `any` type from Supabase's UserMetadata interface
 */
export const UserMetadataSchema = z.object({
  full_name: z.string(),
  phone_number: z.string().optional(),
});

export type UserMetadata = z.infer<typeof UserMetadataSchema>;

/**
 * Schema for sign up data
 */
export const SignUpDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must not exceed 72 characters'),
  fullName: z.string().min(1, 'Full name must not be empty'),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)')
    .optional(),
});

export type SignUpDto = z.infer<typeof SignUpDtoSchema>;

/**
 * Schema for sign in data
 */
export const SignInDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInDto = z.infer<typeof SignInDtoSchema>;

/**
 * Schema for password reset request
 */
export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

/**
 * Schema for password update
 */
export const PasswordUpdateSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must not exceed 72 characters'),
});

export type PasswordUpdate = z.infer<typeof PasswordUpdateSchema>;

/**
 * Schema for password reset using a recovery token
 */
export const PasswordResetSchema = z.object({
  recoveryToken: z.string().min(1, 'Recovery token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must not exceed 72 characters'),
});

export type PasswordReset = z.infer<typeof PasswordResetSchema>;

/**
 * Schema for refresh token request
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshToken = z.infer<typeof RefreshTokenSchema>;

/**
 * Safely parse and validate user_metadata from Supabase User object
 */
export function parseUserMetadata(metadata: unknown): UserMetadata {
  const result = UserMetadataSchema.safeParse(metadata);
  if (!result.success) {
    throw new Error('Invalid user metadata format');
  }
  return result.data;
}

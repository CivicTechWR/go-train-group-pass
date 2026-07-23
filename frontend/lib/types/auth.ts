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
  fullName: z.string().min(1, 'Full name must not be empty'),
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
 * Schema for password update form (includes confirmation)
 */
export const PasswordUpdateFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must not exceed 72 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PasswordUpdateFormInput = z.infer<typeof PasswordUpdateFormSchema>;

/**
 * Schema for refresh token request
 * Matches backend RefreshTokenSchema
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;


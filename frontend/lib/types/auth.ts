import { z } from 'zod';
import {
  SignUpInputSchema,
  SignInInputSchema,
  PasswordResetInputSchema,
  PasswordUpdateInputSchema,
  RefreshTokenSchema as SharedRefreshTokenSchema,
} from '@go-train-group-pass/shared/schemas';

/**
 * Schema for sign up request
 * Matches backend SignUpDtoSchema
 */
export const SignUpSchema = SignUpInputSchema;

export type SignUpInput = z.infer<typeof SignUpSchema>;

/**
 * Schema for sign in request
 * Matches backend SignInDtoSchema
 */
export const SignInSchema = SignInInputSchema;

export type SignInInput = z.infer<typeof SignInSchema>;

/**
 * Schema for password reset request
 * Matches backend PasswordResetRequestSchema
 */
export const PasswordResetRequestSchema = PasswordResetInputSchema;

export type PasswordResetRequestInput = z.infer<
  typeof PasswordResetRequestSchema
>;

/**
 * Schema for password update request
 * Matches backend PasswordUpdateSchema
 */
export const PasswordUpdateSchema = PasswordUpdateInputSchema;

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
export const RefreshTokenSchema = SharedRefreshTokenSchema;

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;


import { z } from 'zod';

/**
 * Schema representing Supabase's internal user metadata format.
 * Uses snake_case to match Supabase's convention.
 *
 * This is used when:
 * - Sending user metadata to Supabase during signup
 * - Reading user metadata back from Supabase
 *
 * Note: This is intentionally kept in the backend only, as the frontend
 * should use the public API schemas (camelCase) from @go-train-group-pass/shared.
 */
export const UserMetadataSchema = z.object({
  full_name: z.string(),
  phone_number: z.string(),
});

export type UserMetadata = z.infer<typeof UserMetadataSchema>;

import { z } from 'zod';

/**
 * Schema for session object (from Supabase)
 */
export const SessionSchema = z
  .object({
    provider_token: z.string().nullable().optional(),
    provider_refresh_token: z.string().nullable().optional(),
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number(),
    expires_at: z.number().optional(),
    token_type: z.literal('bearer'),
    user: z.object({ // Only defines needed fields
      user_metadata: z.object({ // Only defines needed fields
        full_name: z.string(),
      }),
    }),
  })
  .loose(); // Allow additional fields from Supabase

export type Session = z.infer<typeof SessionSchema>;


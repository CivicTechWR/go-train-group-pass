import { initTRPC, TRPCError } from '@trpc/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import superjson from 'superjson';

// Create context for each request
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Development bypass - if no session, try to get a test user profile
  let userId: string | undefined;
  if (!session && process.env.NODE_ENV === 'development') {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profiles && profiles.length > 0) {
      userId = profiles[0].id;
    }
  }

  return {
    supabase,
    session,
    userId,
    headers: opts.headers,
  };
};

// Initialize tRPC
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Use userId from context (either from session or development bypass)
  const userId = ctx.userId;

  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // Ensure user profile exists (create if missing for authenticated users)
  if (ctx.session) {
    const { data: profile, error: profileError } = await ctx.supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Database error: ${profileError.message}`,
      });
    }

    if (!profile) {
      // Create profile for authenticated user
      const { error: createError } = await ctx.supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: ctx.session.user.user_metadata?.display_name || 
                       ctx.session.user.email?.split('@')[0] || 
                       'User',
          email: ctx.session.user.email,
          phone: ctx.session.user.phone || '',
          reputation_score: 100,
          trips_completed: 0,
          on_time_payment_rate: 1,
          is_community_admin: false,
        });

      if (createError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create user profile: ${createError.message}`,
        });
      }
    }
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: userId,
    },
  });
});

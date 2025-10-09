import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { formGroups } from '@/lib/group-formation';
import { TRPCError } from '@trpc/server';

export const tripsRouter = router({
  // Get trips for date range
  list: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('trips')
        .select(`
          *,
          train:trains(*),
          groups(
            *,
            memberships:group_memberships(
              *,
              user:profiles(id, display_name, profile_photo_url)
            )
          )
        `)
        .gte('date', input.startDate)
        .lte('date', input.endDate)
        .order('date');

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  // Join a trip
  join: protectedProcedure
    .input(z.object({
      tripId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if within allowed timeframe
      const { data: trip, error: tripError } = await ctx.supabase
        .from('trips')
        .select('*, train:trains(*)')
        .eq('id', input.tripId)
        .single();

      if (tripError || !trip) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Trip not found' });
      }

      const departureTime = new Date(`${trip.date}T${trip.train.departure_time}`);
      const now = new Date();
      const minutesUntilDeparture = (departureTime.getTime() - now.getTime()) / 60000;

      if (minutesUntilDeparture < 30) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot join less than 30 minutes before departure'
        });
      }

      // Check if user is already in this trip
      const { data: existingMembership } = await ctx.supabase
        .from('group_memberships')
        .select('id, group:groups!inner(trip_id)')
        .eq('user_id', userId)
        .eq('group.trip_id', input.tripId)
        .single();

      if (existingMembership) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are already in this trip'
        });
      }

      // Get all current members and existing stewards
      const { data: existingGroups } = await ctx.supabase
        .from('groups')
        .select('*, steward_id, memberships:group_memberships(user_id, user:profiles(id, display_name))')
        .eq('trip_id', input.tripId);

      const allMembers = existingGroups?.flatMap(g =>
        g.memberships.map((m: any) => ({ id: m.user_id, displayName: m.user?.display_name || '' }))
      ) || [];

      // Build steward map for preservation
      const existingStewards = new Map<string, string>();
      existingGroups?.forEach(g => {
        if (g.steward_id) {
          existingStewards.set(g.steward_id, String(g.group_number));
        }
      });

      // Get current user profile
      const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', userId)
        .single();

      // Add new user
      allMembers.push({ id: userId, displayName: profile?.display_name || '' });

      // Rebalance groups with steward preservation
      const newGroups = formGroups(allMembers, { existingStewards });

      // Use atomic transaction function
      const { error: rebalanceError } = await ctx.supabase.rpc('rebalance_trip_groups', {
        p_trip_id: input.tripId,
        p_new_groups: newGroups,
      });

      if (rebalanceError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to rebalance groups: ${rebalanceError.message}`,
        });
      }

      return { success: true };
    }),

  // Leave a trip
  leave: protectedProcedure
    .input(z.object({
      tripId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check timing
      const { data: trip, error: tripError } = await ctx.supabase
        .from('trips')
        .select('*, train:trains(*)')
        .eq('id', input.tripId)
        .single();

      if (tripError || !trip) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Trip not found' });
      }

      const departureTime = new Date(`${trip.date}T${trip.train.departure_time}`);
      const now = new Date();
      const minutesUntilDeparture = (departureTime.getTime() - now.getTime()) / 60000;

      if (minutesUntilDeparture < 30) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot leave less than 30 minutes before departure'
        });
      }

      // Get user's group
      const { data: membership } = await ctx.supabase
        .from('group_memberships')
        .select('group_id, group:groups!inner(trip_id)')
        .eq('user_id', userId)
        .eq('group.trip_id', input.tripId)
        .single();

      if (!membership) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Not in this trip' });
      }

      // Get all groups to check stewards and remove user
      const { data: currentGroups } = await ctx.supabase
        .from('groups')
        .select('*, steward_id, memberships:group_memberships(user_id, user:profiles(id, display_name))')
        .eq('trip_id', input.tripId);

      // Build steward map (excluding user who's leaving if they're steward)
      const existingStewards = new Map<string, string>();
      currentGroups?.forEach(g => {
        if (g.steward_id && g.steward_id !== userId) {
          existingStewards.set(g.steward_id, String(g.group_number));
        }
      });

      const remainingMembers = currentGroups?.flatMap(g =>
        g.memberships
          .filter((m: any) => m.user_id !== userId) // Exclude leaving user
          .map((m: any) => ({ id: m.user_id, displayName: m.user?.display_name || '' }))
      ) || [];

      if (remainingMembers.length > 0) {
        // Rebalance with steward preservation
        const newGroups = formGroups(remainingMembers, { existingStewards });

        // Use atomic transaction function
        const { error: rebalanceError } = await ctx.supabase.rpc('rebalance_trip_groups', {
          p_trip_id: input.tripId,
          p_new_groups: newGroups,
        });

        if (rebalanceError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to rebalance groups: ${rebalanceError.message}`,
          });
        }
      } else {
        // No members left, delete all groups using transaction
        const { error } = await ctx.supabase.rpc('rebalance_trip_groups', {
          p_trip_id: input.tripId,
          p_new_groups: [],
        });

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to remove groups: ${error.message}`,
          });
        }
      }

      return { success: true };
    }),
});

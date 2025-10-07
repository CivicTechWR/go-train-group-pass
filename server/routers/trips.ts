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

      // Get all current members
      const { data: existingGroups } = await ctx.supabase
        .from('groups')
        .select('*, memberships:group_memberships(user_id, user:profiles(id, display_name))')
        .eq('trip_id', input.tripId);

      const allMembers = existingGroups?.flatMap(g =>
        g.memberships.map((m: any) => ({ id: m.user_id, displayName: m.user?.display_name || '' }))
      ) || [];

      // Get current user profile
      const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', userId)
        .single();

      // Add new user
      allMembers.push({ id: userId, displayName: profile?.display_name || '' });

      // Rebalance groups
      const newGroups = formGroups(allMembers);

      // Transaction: delete old groups, insert new
      await ctx.supabase.from('groups').delete().eq('trip_id', input.tripId);

      for (const group of newGroups) {
        const { data: newGroup, error: groupError } = await ctx.supabase
          .from('groups')
          .insert({
            trip_id: input.tripId,
            group_number: group.groupNumber,
            cost_per_person: group.costPerPerson,
          })
          .select()
          .single();

        if (groupError || !newGroup) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create group'
          });
        }

        const { error: membershipsError } = await ctx.supabase
          .from('group_memberships')
          .insert(
            group.members.map(m => ({
              group_id: newGroup.id,
              user_id: m.id,
            }))
          );

        if (membershipsError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to add group members'
          });
        }
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

      // Remove user
      await ctx.supabase
        .from('group_memberships')
        .delete()
        .eq('user_id', userId)
        .eq('group_id', membership.group_id);

      // Rebalance remaining groups
      const { data: remainingGroups } = await ctx.supabase
        .from('groups')
        .select('*, memberships:group_memberships(user_id, user:profiles(id, display_name))')
        .eq('trip_id', input.tripId);

      const remainingMembers = remainingGroups?.flatMap(g =>
        g.memberships.map((m: any) => ({ id: m.user_id, displayName: m.user?.display_name || '' }))
      ) || [];

      if (remainingMembers.length > 0) {
        const newGroups = formGroups(remainingMembers);

        await ctx.supabase.from('groups').delete().eq('trip_id', input.tripId);

        for (const group of newGroups) {
          const { data: newGroup } = await ctx.supabase
            .from('groups')
            .insert({
              trip_id: input.tripId,
              group_number: group.groupNumber,
              cost_per_person: group.costPerPerson,
            })
            .select()
            .single();

          if (newGroup) {
            await ctx.supabase.from('group_memberships').insert(
              group.members.map(m => ({
                group_id: newGroup.id,
                user_id: m.id,
              }))
            );
          }
        }
      } else {
        // No members left, just delete all groups
        await ctx.supabase.from('groups').delete().eq('trip_id', input.tripId);
      }

      return { success: true };
    }),
});

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { formGroups } from '@/lib/group-formation';
import { TRPCError } from '@trpc/server';
import type { GroupWithMemberships, Profile } from '@/types/database';
import { joinTripSchema, leaveTripSchema } from '@/lib/validations';
import { withRateLimit, rateLimits } from '@/lib/rate-limit';
import { sanitizeString } from '@/lib/validations';

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
        .order('date')
        .order('train(departure_time)');

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      
      // Filter out departed trips and non-direct routes - only show direct train trips that haven't departed yet
      const now = new Date();
      
      const availableTrips = data?.filter(trip => {
        // Only direct train routes (no bus transfers required)
        const isDirectTrain = trip.train.direction === 'outbound' && 
                             trip.train.destination === 'Union Station' &&
                             !trip.train.origin.includes('Bus') &&
                             !trip.train.destination.includes('Bus');
        
        // Create departure time in local timezone by using the date string with time
        const departureTime = new Date(`${trip.date}T${trip.train.departure_time}`);
        
        return isDirectTrain && departureTime > now;
      }) || [];

      // Sort by departure time within each date
      availableTrips.sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.train.departure_time}`);
        const timeB = new Date(`${b.date}T${b.train.departure_time}`);
        return timeA.getTime() - timeB.getTime();
      });

      return availableTrips;
    }),

  // Get user's joined trips (including departed ones) for a date range
  myTrips: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      
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
        .order('date')
        .order('train(departure_time)');

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      
      // Filter to only direct train trips where user is a member
      const myTrips = data?.filter(trip => {
        // Only direct train routes (no bus transfers required)
        const isDirectTrain = trip.train.direction === 'outbound' && 
                             trip.train.destination === 'Union Station' &&
                             !trip.train.origin.includes('Bus') &&
                             !trip.train.destination.includes('Bus');
        
        // User must be a member of this trip
        const isUserMember = trip.groups.some((group: any) => 
          group.memberships.some((membership: any) => membership.user_id === userId)
        );
        
        return isDirectTrain && isUserMember;
      }) || [];

      // Sort by departure time within each date
      myTrips.sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.train.departure_time}`);
        const timeB = new Date(`${b.date}T${b.train.departure_time}`);
        return timeA.getTime() - timeB.getTime();
      });

      return myTrips;
    }),

  // Join a trip
  join: protectedProcedure
    .use(withRateLimit(rateLimits.tripActions))
    .input(joinTripSchema)
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

      // Validate this is a direct train route (no bus transfers required)
      const isDirectTrain = trip.train.direction === 'outbound' && 
                           trip.train.destination === 'Union Station' &&
                           !trip.train.origin.includes('Bus') &&
                           !trip.train.destination.includes('Bus');

      if (!isDirectTrain) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only direct train routes are supported for group passes'
        });
      }

      const departureTime = new Date(`${trip.date}T${trip.train.departure_time}`);
      const now = new Date();
      const minutesUntilDeparture = (departureTime.getTime() - now.getTime()) / 60000;

      if (minutesUntilDeparture < 5) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot join less than 5 minutes before departure'
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

      const typedGroups = (existingGroups || []) as GroupWithMemberships[];

      const allMembers = typedGroups.flatMap(g =>
        g.memberships.map(m => ({
          id: m.user_id,
          displayName: m.user?.display_name || ''
        }))
      );

      // Build steward map for preservation
      const existingStewards = new Map<string, string>();
      typedGroups.forEach(g => {
        if (g.steward_id) {
          existingStewards.set(g.steward_id, String(g.group_number));
        }
      });

      // Get current user profile and validate it exists
      const { data: profile, error: profileError } = await ctx.supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid errors when no rows

      if (profileError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Database error: ${profileError.message}`,
        });
      }

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User profile not found for ID: ${userId}. Please check your user configuration.`,
        });
      }

      // Add new user
      allMembers.push({ id: userId, displayName: profile.display_name || 'Unknown User' });

      // Rebalance groups with steward preservation
      const newGroups = formGroups(allMembers, { existingStewards });

      // Use atomic transaction function
      const { error: rebalanceError } = await ctx.supabase.rpc('rebalance_trip_groups', {
        p_trip_id: input.tripId,
        p_new_groups: newGroups,
      });

      if (rebalanceError) {
        // Parse specific error types for better user messages
        const errorMessage = rebalanceError.message.toLowerCase();

        if (errorMessage.includes('foreign key') && errorMessage.includes('profiles')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Your user profile is not properly set up. Please contact support.',
          });
        }

        if (errorMessage.includes('foreign key') && errorMessage.includes('trips')) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'This trip no longer exists.',
          });
        }

        if (errorMessage.includes('permission denied') || errorMessage.includes('rls')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to join this trip.',
          });
        }

        // Generic error for unknown cases
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to join trip. Please try again or contact support.',
          cause: rebalanceError,
        });
      }

      return { success: true };
    }),

  // Leave a trip
  leave: protectedProcedure
    .use(withRateLimit(rateLimits.tripActions))
    .input(leaveTripSchema)
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

      // Validate this is a direct train route (no bus transfers required)
      const isDirectTrain = trip.train.direction === 'outbound' && 
                           trip.train.destination === 'Union Station' &&
                           !trip.train.origin.includes('Bus') &&
                           !trip.train.destination.includes('Bus');

      if (!isDirectTrain) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only direct train routes are supported for group passes'
        });
      }

      const departureTime = new Date(`${trip.date}T${trip.train.departure_time}`);
      const now = new Date();
      const minutesUntilDeparture = (departureTime.getTime() - now.getTime()) / 60000;

      if (minutesUntilDeparture < 5) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot leave less than 5 minutes before departure'
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

      const typedCurrentGroups = (currentGroups || []) as GroupWithMemberships[];

      // Build steward map (excluding user who's leaving if they're steward)
      const existingStewards = new Map<string, string>();
      typedCurrentGroups.forEach(g => {
        if (g.steward_id && g.steward_id !== userId) {
          existingStewards.set(g.steward_id, String(g.group_number));
        }
      });

      const remainingMembers = typedCurrentGroups.flatMap(g =>
        g.memberships
          .filter(m => m.user_id !== userId) // Exclude leaving user
          .map(m => ({
            id: m.user_id,
            displayName: m.user?.display_name || ''
          }))
      );

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

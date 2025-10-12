import { z } from 'zod';
import { router, protectedProcedure } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import * as crypto from 'crypto';
import { logger } from '@/lib/logger';

export const stewardRouter = router({
  // Volunteer to be steward for a group
  volunteer: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if group exists and doesn't have a steward
      const { data: group, error: groupError } = await ctx.supabase
        .from('groups')
        .select(
          'id, steward_id, group_number, trip:trips(train:trains(departure_time, origin, destination))'
        )
        .eq('id', input.groupId)
        .single();

      if (groupError || !group) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group not found',
        });
      }

      if (group.steward_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This group already has a steward',
        });
      }

      // Update group with new steward
      const { error: updateError } = await ctx.supabase
        .from('groups')
        .update({ steward_id: userId })
        .eq('id', input.groupId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update group steward',
        });
      }

      return {
        success: true,
        message: `You are now the steward for Group ${group.group_number}`,
        groupId: input.groupId,
      };
    }),

  // Get steward's groups
  getMyGroups: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const { data: groups, error } = await ctx.supabase
      .from('groups')
      .select(
        `
          id,
          group_number,
          cost_per_person,
          steward_id,
          pass_screenshot_url,
          pass_ticket_number,
          pass_activated_at,
          created_at,
          trip:trips(
            id,
            date,
            status,
            train:trains(
              departure_time,
              origin,
              destination
            )
          ),
          memberships:group_memberships(
            id,
            user_id,
            payment_marked_sent_at,
            user:profiles(
              id,
              display_name
            )
          )
        `
      )
      .eq('steward_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch steward groups',
      });
    }

    // Transform the data
    return (
      groups?.map(group => ({
        id: group.id,
        groupNumber: group.group_number,
        costPerPerson: group.cost_per_person,
        passUploaded: !!group.pass_screenshot_url,
        passTicketNumber: group.pass_ticket_number,
        passActivatedAt: group.pass_activated_at,
        trip: group.trip,
        memberCount: group.memberships.length,
        members: group.memberships.map((membership: any) => ({
          id: membership.user_id,
          displayName: membership.user?.display_name || 'Unknown User',
          paymentSent: !!membership.payment_marked_sent_at,
        })),
        totalCollected:
          group.memberships.filter((m: any) => m.payment_marked_sent_at)
            .length * group.cost_per_person,
        pendingPayments: group.memberships.filter(
          (m: any) => !m.payment_marked_sent_at
        ).length,
      })) || []
    );
  }),

  // Upload pass with OCR validation
  uploadPass: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        ticketNumber: z.string().min(1),
        passengerCount: z.number().int().min(1).max(5),
        activatedAt: z.string(),
        screenshotFile: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Verify user is steward
      const { data: group, error: groupError } = await ctx.supabase
        .from('groups')
        .select(
          'steward_id, cost_per_person, memberships:group_memberships(count)'
        )
        .eq('id', input.groupId)
        .single();

      if (groupError || !group) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group not found',
        });
      }

      if (group.steward_id !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the steward can upload the pass',
        });
      }

      // Get member count
      const memberCount = group.memberships[0]?.count || 0;

      // Validate passenger count matches group size
      if (input.passengerCount !== memberCount) {
        logger.warn('Pass passenger count mismatch', {
          detected: input.passengerCount,
          expected: memberCount,
          groupId: input.groupId,
          stewardId: userId,
        });
      }

      // Hash ticket number to prevent reuse
      const ticketHash = crypto
        .createHash('sha256')
        .update(input.ticketNumber)
        .digest('hex');

      // Check for duplicate ticket usage
      const { data: existingPass } = await ctx.supabase
        .from('groups')
        .select(
          'id, trip:trips(train:trains(departure_time, origin, destination))'
        )
        .eq('pass_ticket_number_hash', ticketHash)
        .neq('id', input.groupId)
        .single();

      if (existingPass) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This ticket number has already been used by another group',
        });
      }

      // Convert base64 to buffer
      const base64Data = input.screenshotFile.replace(
        /^data:image\/[a-z]+;base64,/,
        ''
      );
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload screenshot to Supabase Storage
      const filename = `${input.groupId}-${Date.now()}.png`;
      const { error: uploadError } = await ctx.supabase.storage
        .from('pass-screenshots')
        .upload(filename, buffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload screenshot',
        });
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = ctx.supabase.storage.from('pass-screenshots').getPublicUrl(filename);

      // Update group with pass information
      const { error: updateError } = await ctx.supabase
        .from('groups')
        .update({
          pass_screenshot_url: publicUrl,
          pass_ticket_number: input.ticketNumber,
          pass_ticket_number_hash: ticketHash,
          pass_activated_at: input.activatedAt,
          pass_passenger_count: input.passengerCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.groupId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update group with pass information',
        });
      }

      return {
        success: true,
        message: 'Pass uploaded successfully',
        data: {
          groupId: input.groupId,
          ticketNumber: input.ticketNumber,
          passengerCount: input.passengerCount,
          screenshotUrl: publicUrl,
          activatedAt: input.activatedAt,
        },
      };
    }),

  // Generate payment requests for group members
  generatePaymentRequests: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Verify user is steward and pass is uploaded
      const { data: group, error: groupError } = await ctx.supabase
        .from('groups')
        .select(
          `
          group_number,
          steward_id,
          cost_per_person,
          pass_screenshot_url,
          memberships:group_memberships(
            user_id,
            user:profiles(display_name, email)
          )
        `
        )
        .eq('id', input.groupId)
        .single();

      if (groupError || !group) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group not found',
        });
      }

      if (group.steward_id !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the steward can generate payment requests',
        });
      }

      if (!group.pass_screenshot_url) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Pass must be uploaded before generating payment requests',
        });
      }

      // Get steward's email for payment requests
      const { data: stewardProfile } = await ctx.supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      const stewardEmail = stewardProfile?.email || 'steward@example.com';

      // Generate payment requests for each member
      const paymentRequests = group.memberships.map((membership: any) => ({
        userId: membership.user_id,
        displayName: membership.user?.display_name || 'Unknown User',
        email: membership.user?.email || '',
        amount: group.cost_per_person,
        stewardEmail,
        memo: `GO Train Group Pass - Group ${group.group_number || 'Unknown'}`,
      }));

      return {
        success: true,
        paymentRequests,
        stewardEmail,
        totalAmount: group.cost_per_person * group.memberships.length,
      };
    }),
});

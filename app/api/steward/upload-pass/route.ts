import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import crypto from 'crypto';
import { RateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const uploadPassSchema = z.object({
  groupId: z.string().uuid(),
  ticketNumber: z.string().min(1, 'Ticket number is required'),
  passengerCount: z.number().int().min(1).max(5),
  activatedAt: z.string(),
  screenshotFile: z.string().min(1, 'Screenshot file is required'),
});

const passUploadLimiter = RateLimiter.getInstance();
const PASS_UPLOAD_LIMIT = {
  limit: 5,
  windowMs: 5 * 60 * 1000,
  message: 'Too many pass uploads. Please wait a moment and try again.',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      groupId,
      ticketNumber,
      passengerCount,
      activatedAt,
      screenshotFile,
    } = uploadPassSchema.parse(body);

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Verify user is steward of this group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select(
        'steward_id, cost_per_person, memberships:group_memberships(count)'
      )
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        {
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    if (group.steward_id !== user.id) {
      return NextResponse.json(
        {
          error: 'Only the steward can upload the pass',
        },
        { status: 403 }
      );
    }

    const limiterId = `steward:${user.id}`;
    if (
      !passUploadLimiter.checkLimit(limiterId, 'steward:pass-upload', {
        limit: PASS_UPLOAD_LIMIT.limit,
        windowMs: PASS_UPLOAD_LIMIT.windowMs,
      })
    ) {
      const retryAfter = Math.ceil(
        passUploadLimiter.getRemainingTime(limiterId, 'steward:pass-upload') /
          1000
      );

      return NextResponse.json(
        {
          error: PASS_UPLOAD_LIMIT.message,
          retryAfter,
        },
        { status: 429 }
      );
    }

    // Get member count
    const memberCount = group.memberships[0]?.count || 0;

    // Validate passenger count matches group size (with warning tolerance)
    if (passengerCount !== memberCount) {
      logger.warn('Passenger count mismatch for uploaded pass', {
        passengerCount,
        memberCount,
        groupId,
        stewardId: user.id,
      });
      // We'll allow this but log it for the steward to verify
    }

    // Hash ticket number to prevent reuse
    const ticketHash = crypto
      .createHash('sha256')
      .update(ticketNumber)
      .digest('hex');

    // Check for duplicate ticket usage
    const { data: existingPass } = await supabase
      .from('groups')
      .select(
        'id, trip:trips(train:trains(departure_time, origin, destination))'
      )
      .eq('pass_ticket_number_hash', ticketHash)
      .neq('id', groupId)
      .single();

    if (existingPass) {
      const trip = existingPass.trip as any;
      const train = trip?.train as any;
      return NextResponse.json(
        {
          error: 'This ticket number has already been used by another group',
          details: `Ticket was used for ${train?.origin || 'Unknown'} → ${train?.destination || 'Unknown'} at ${train?.departure_time || 'Unknown'}`,
        },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = screenshotFile.replace(
      /^data:image\/[a-z]+;base64,/,
      ''
    );
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload screenshot to Supabase Storage
    const filename = `${groupId}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('pass-screenshots')
      .upload(filename, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      logger.error('Storage upload error', uploadError as Error);
      return NextResponse.json(
        {
          error: 'Failed to upload screenshot',
        },
        { status: 500 }
      );
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('pass-screenshots').getPublicUrl(filename);

    // Update group with pass information
    const { error: updateError } = await supabase
      .from('groups')
      .update({
        pass_screenshot_url: publicUrl,
        pass_ticket_number: ticketNumber,
        pass_ticket_number_hash: ticketHash,
        pass_activated_at: activatedAt,
        pass_passenger_count: passengerCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId);

    if (updateError) {
      logger.error('Group update error', updateError as Error);
      return NextResponse.json(
        {
          error: 'Failed to update group with pass information',
        },
        { status: 500 }
      );
    }

    // Log the pass upload for audit trail
    logger.audit('Pass uploaded for group', {
      groupId,
      ticketHash,
      passengerCount,
      memberCount,
      stewardId: user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Pass uploaded successfully',
      data: {
        groupId,
        ticketNumber,
        passengerCount,
        screenshotUrl: publicUrl,
        activatedAt,
      },
    });
  } catch (error) {
    logger.error('Upload pass error', error as Error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

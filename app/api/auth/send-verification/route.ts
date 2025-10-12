import { NextRequest, NextResponse } from 'next/server';
import { phoneVerification } from '@/lib/twilio';
import { phoneSchema } from '@/lib/validations';
import { z } from 'zod';
import { RateLimiter, getClientIP } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const requestSchema = z.object({
  phone: phoneSchema,
});

const sendLimiter = RateLimiter.getInstance();
const SEND_RATE_LIMIT = {
  limit: 5,
  windowMs: 10 * 60 * 1000,
  message: 'Too many verification requests. Please try again later.',
};

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIP(request.headers);

    if (
      !sendLimiter.checkLimit(identifier, 'auth:send', {
        limit: SEND_RATE_LIMIT.limit,
        windowMs: SEND_RATE_LIMIT.windowMs,
      })
    ) {
      const retryAfter = Math.ceil(
        sendLimiter.getRemainingTime(identifier, 'auth:send') / 1000
      );

      return NextResponse.json(
        {
          success: false,
          error: SEND_RATE_LIMIT.message,
          retryAfter,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { phone } = requestSchema.parse(body);

    // Send verification code
    const result = await phoneVerification.sendVerificationCode(phone);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your phone',
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error('Send verification error', error as Error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

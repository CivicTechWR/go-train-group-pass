import { NextRequest, NextResponse } from 'next/server';
import { phoneVerification } from '@/lib/twilio';
import { phoneSchema } from '@/lib/validations';
import { z } from 'zod';

const requestSchema = z.object({
  phone: phoneSchema,
});

export async function POST(request: NextRequest) {
  try {
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
  } catch (error: any) {
    console.error('Send verification error:', error);

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

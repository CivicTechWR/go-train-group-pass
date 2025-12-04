import { MessageResponseSchema, PasswordResetRequestSchema } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PasswordResetRequestSchema.parse(body);

    const response = await fetch(`${BACKEND_URL}/auth/password/reset-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Validate response schema
    const parseResult = MessageResponseSchema.safeParse(data);
    if (!parseResult.success) {
      const zodError = parseResult.error;
      console.error('Backend response shape mismatch:', zodError.issues);
      return NextResponse.json(
        {
          message: 'Invalid response format from backend',
          errors: zodError.issues,
        },
        { status: 500 }
      );
    }
    const messageResponse = parseResult.data;

    // Prevent caching
    const nextResponse = NextResponse.json(messageResponse);
    nextResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');
    return nextResponse;
  } catch (error) {
    // Only catch request validation errors here
    // Response validation errors are handled above
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

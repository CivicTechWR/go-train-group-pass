import { AuthResponseSchema, SignUpSchema } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SignUpSchema.parse(body);

    const response = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // Backend signup returns void (201), so we need to automatically sign in the user
    // to get the auth tokens and user data
    const signInResponse = await fetch(`${BACKEND_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: validatedData.email,
        password: validatedData.password,
      }),
    });

    if (!signInResponse.ok) {
      const errorData = await signInResponse.json();
      return NextResponse.json(errorData, { status: signInResponse.status });
    }

    const signInData = await signInResponse.json();

    // Validate response schema
    const parseResult = AuthResponseSchema.safeParse(signInData);
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
    const authResponse = parseResult.data;

    // Create response with httpOnly cookies
    const nextResponse = NextResponse.json(authResponse);

    // Set access_token cookie
    // Default expires_in to 3600 seconds (1 hour) if not provided
    const expiresIn = 3600;
    nextResponse.cookies.set('access_token', authResponse.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    // Set refresh_token cookie
    nextResponse.cookies.set('refresh_token', authResponse.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Prevent caching
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

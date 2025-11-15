import { RefreshResponseSchema, RefreshTokenSchema } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Try to get refresh token from body or cookie
    const refreshToken =
      body.refreshToken || request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Validate if provided in body
    if (body.refreshToken) {
      RefreshTokenSchema.parse({ refreshToken });
    }

    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Validate response schema
    const parseResult = RefreshResponseSchema.safeParse(data);
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
    const refreshResponse = parseResult.data;

    // Create response with updated httpOnly cookies
    const nextResponse = NextResponse.json(refreshResponse);

    // Update access_token cookie
    nextResponse.cookies.set(
      'access_token',
      refreshResponse.session.access_token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: refreshResponse.session.expires_in,
        path: '/',
      }
    );

    // Update refresh_token cookie if a new one is provided
    if (refreshResponse.session.refresh_token) {
      nextResponse.cookies.set(
        'refresh_token',
        refreshResponse.session.refresh_token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        }
      );
    }

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

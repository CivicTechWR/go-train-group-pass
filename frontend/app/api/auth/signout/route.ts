import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      // Clear cookies even if no token
      const response = NextResponse.json({
        message: 'Signed out successfully',
      });
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      // Prevent caching
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    const response = await fetch(`${BACKEND_URL}/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: '{}',
    });

    const data = await response.json();

    // Create response and clear cookies regardless of backend response
    const nextResponse = NextResponse.json(
      response.ok ? data : { message: 'Signed out successfully' },
      { status: response.ok ? response.status : 200 }
    );

    // Clear cookies
    nextResponse.cookies.delete('access_token');
    nextResponse.cookies.delete('refresh_token');

    // Prevent caching
    nextResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');

    return nextResponse;
  } catch {
    // Even on error, clear cookies
    const response = NextResponse.json(
      { message: 'Signed out successfully' },
      { status: 200 }
    );
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    // Prevent caching
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
}

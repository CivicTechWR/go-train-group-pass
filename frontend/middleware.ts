import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Public routes that don't require authentication
const publicRoutes = ['/', '/signin', '/signup', '/forgot-password', '/itineraries'];

async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function refreshToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
} | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in || 3600, // Default to 1 hour if not provided
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // Check if route is auth page
  const isAuthRoute =
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/forgot-password';

  // All routes except public routes require authentication
  if (!isPublicRoute) {
    if (!accessToken) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Validate token with backend
    let isValid = await validateToken(accessToken);

    // If token is invalid, try to refresh it
    if (!isValid) {
      const refreshTokenValue = request.cookies.get('refresh_token')?.value;
      if (refreshTokenValue) {
        const refreshResult = await refreshToken(refreshTokenValue);
        if (refreshResult) {
          // Create response and update cookies
          const response = NextResponse.next();
          response.cookies.set('access_token', refreshResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: refreshResult.expiresIn,
            path: '/',
          });

          if (refreshResult.refreshToken) {
            response.cookies.set('refresh_token', refreshResult.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 days
              path: '/',
            });
          }

          isValid = true;
          return response;
        }
      }

      // If refresh failed or no refresh token, clear cookies and redirect
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(signInUrl);
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }

  // Redirect to home if accessing auth pages while authenticated
  if (isAuthRoute && accessToken) {
    // Validate token to ensure it's still valid
    const isValid = await validateToken(accessToken);

    // If token is invalid, try to refresh it
    if (!isValid) {
      const refreshTokenValue = request.cookies.get('refresh_token')?.value;
      if (refreshTokenValue) {
        const refreshResult = await refreshToken(refreshTokenValue);
        if (refreshResult) {
          // Update cookies and redirect to profile page
          const response = NextResponse.redirect(
            new URL('/profile', request.url)
          );
          response.cookies.set('access_token', refreshResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: refreshResult.expiresIn,
            path: '/',
          });

          if (refreshResult.refreshToken) {
            response.cookies.set('refresh_token', refreshResult.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 days
              path: '/',
            });
          }

          return response;
        }
      }
      // If refresh failed or no refresh token, clear cookies and allow access to auth pages
      const response = NextResponse.next();
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }

    if (isValid) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

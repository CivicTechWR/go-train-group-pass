import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Public routes that don't require authentication
const publicRoutes = ['/', '/signin', '/signup'];

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // Check if route is auth page
  const isAuthRoute = pathname === '/signin' || pathname === '/signup';

  // All routes except public routes require authentication
  if (!isPublicRoute) {
    if (!accessToken) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Validate token with backend
    const isValid = await validateToken(accessToken);
    if (!isValid) {
      // Clear invalid token
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
    if (isValid) {
      return NextResponse.redirect(new URL('/protected', request.url));
    }
    // If token is invalid, clear it and allow access to auth pages
    const response = NextResponse.next();
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
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

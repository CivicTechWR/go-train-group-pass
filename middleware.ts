import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { securityHeadersMiddleware, validateRequestSize, logSecurityEvent } from './lib/security-headers';

export async function middleware(request: NextRequest) {
  // Validate request size
  if (!validateRequestSize(request)) {
    logSecurityEvent('REQUEST_SIZE_EXCEEDED', { url: request.url }, request);
    return new NextResponse('Request too large', { status: 413 });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // If user is authenticated, ensure profile exists
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single();

    // Create profile if it doesn't exist
    if (!profile) {
      const { error } = await supabase.from('profiles').insert({
        id: session.user.id,
        phone: session.user.phone || '',
        email: session.user.email || '',
        display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
        profile_photo_url: session.user.user_metadata?.avatar_url || null,
      });

      if (error) {
        console.error('Failed to create profile:', error);
      }
    }
  }

  // Protect routes
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isProtectedRoute = !isAuthPage && !request.nextUrl.pathname.startsWith('/auth/callback');

  // Require authentication for protected routes
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check admin access for admin routes
  if (session && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_community_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_community_admin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add security headers
  return securityHeadersMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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
  const isProtectedRoute = !isAuthPage && !request.nextUrl.pathname.startsWith('/auth/callback');

  // TEMPORARY: Allow access in development mode for testing
  if (!session && isProtectedRoute) {
    if (process.env.NODE_ENV === 'development') {
      // Allow access to the app in development
      return response;
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

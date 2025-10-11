import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    );

    // Check if user is admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_community_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_community_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get users with their activity data
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        email,
        phone,
        reputation_score,
        trips_completed,
        on_time_payment_rate,
        is_community_admin,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Add last active time (using updated_at as proxy)
    const usersWithActivity = users?.map(user => ({
      ...user,
      last_active: user.updated_at
    })) || [];

    return NextResponse.json(usersWithActivity);

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Failed to load users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    );

    // Check if user is admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_community_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_community_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, updates } = await request.json();

    if (!userId || !updates) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Update user profile
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

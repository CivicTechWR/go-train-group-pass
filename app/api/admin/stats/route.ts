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
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_community_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_community_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get statistics
    const [
      { count: totalUsers },
      { count: totalTrips },
      { count: totalGroups },
      { count: totalAlerts },
      { data: activeUsersData },
      { data: activeTripsData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('trips').select('*', { count: 'exact', head: true }),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      supabase
        .from('fare_inspection_alerts')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id')
        .gte(
          'updated_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),
      supabase
        .from('trips')
        .select('id')
        .eq('date', new Date().toISOString().split('T')[0]),
    ]);

    // Determine system health
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check for critical issues
    if (totalUsers === 0) {
      systemHealth = 'critical';
    } else if (totalUsers && totalUsers < 10) {
      systemHealth = 'warning';
    }

    // Check for recent errors (simplified check)
    const { data: recentErrors } = await supabase
      .from('fare_inspection_alerts')
      .select('id')
      .gte(
        'triggered_at',
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      );

    if (recentErrors && recentErrors.length > 10) {
      systemHealth = 'warning';
    }

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsersData?.length || 0,
      totalTrips: totalTrips || 0,
      activeTrips: activeTripsData?.length || 0,
      totalGroups: totalGroups || 0,
      totalAlerts: totalAlerts || 0,
      systemHealth,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to load admin statistics' },
      { status: 500 }
    );
  }
}

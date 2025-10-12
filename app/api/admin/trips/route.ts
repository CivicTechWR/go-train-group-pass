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

    // Get recent trips with groups and memberships
    const { data: trips, error } = await supabase
      .from('trips')
      .select(
        `
        id,
        date,
        status,
        delay_minutes,
        created_at,
        train:trains(
          departure_time,
          origin,
          destination,
          direction
        ),
        groups(
          id,
          group_number,
          steward_id,
          cost_per_person,
          created_at,
          memberships:group_memberships(
            id,
            coach_number,
            coach_level,
            checked_in_at,
            payment_marked_sent_at,
            user:profiles(
              id,
              display_name
            )
          )
        )
      `
      )
      .order('date', { ascending: false })
      .order('train(departure_time)', { ascending: true })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json(trips || []);
  } catch (error) {
    console.error('Admin trips error:', error);
    return NextResponse.json(
      { error: 'Failed to load trips' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Get groups where the current user is the steward
    const { data: groups, error } = await supabase
      .from('groups')
      .select(
        `
        id,
        group_number,
        cost_per_person,
        steward_id,
        pass_screenshot_url,
        pass_ticket_number,
        pass_activated_at,
        created_at,
        trip:trips(
          id,
          date,
          status,
          train:trains(
            departure_time,
            origin,
            destination
          )
        ),
        memberships:group_memberships(
          id,
          user_id,
          payment_marked_sent_at,
          user:profiles(
            id,
            display_name
          )
        )
      `
      )
      .eq('steward_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching steward groups', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch steward groups',
        },
        { status: 500 }
      );
    }

    // Transform the data for the frontend
    const transformedGroups =
      groups?.map((group: any) => ({
        id: group.id,
        groupNumber: group.group_number,
        costPerPerson: group.cost_per_person,
        passUploaded: !!group.pass_screenshot_url,
        passTicketNumber: group.pass_ticket_number,
        passActivatedAt: group.pass_activated_at,
        trip: group.trip,
        memberCount: group.memberships.length,
        members: group.memberships.map((membership: any) => ({
          id: membership.user_id,
          displayName: membership.user?.display_name || 'Unknown User',
          paymentSent: !!membership.payment_marked_sent_at,
        })),
        totalCollected:
          group.memberships.filter((m: any) => m.payment_marked_sent_at)
            .length * group.cost_per_person,
        pendingPayments: group.memberships.filter(
          (m: any) => !m.payment_marked_sent_at
        ).length,
      })) || [];

    return NextResponse.json(transformedGroups);
  } catch (error) {
    logger.error('Steward groups API error', error as Error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

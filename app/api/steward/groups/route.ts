import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Missing userId parameter',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get groups where user is steward
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
      .eq('steward_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching steward groups:', error);
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
    console.error('Steward groups API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

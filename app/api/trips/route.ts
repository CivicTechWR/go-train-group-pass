import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeDeparted = searchParams.get('includeDeparted') === 'true';

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          error: 'Missing startDate or endDate parameters',
        },
        { status: 400 }
      );
    }

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

    // Get trips for date range
    const { data, error } = await supabase
      .from('trips')
      .select(
        `
        *,
        train:trains(*),
        groups(
          *,
          memberships:group_memberships(
            *,
            user:profiles(id, display_name, profile_photo_url)
          )
        )
      `
      )
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')
      .order('train(departure_time)');

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Filter out departed trips and non-direct routes
    const now = new Date();

    const filteredTrips =
      data?.filter((trip: any) => {
        // Only direct train routes (no bus transfers required)
        const isDirectTrain =
          trip.train.direction === 'outbound' &&
          trip.train.destination === 'Union Station' &&
          !trip.train.origin.includes('Bus') &&
          !trip.train.destination.includes('Bus');

        // Create departure time in local timezone by using the date string with time
        const departureTime = new Date(
          `${trip.date}T${trip.train.departure_time}`
        );

        if (!isDirectTrain) {
          return false;
        }

        return includeDeparted || departureTime > now;
      }) || [];

    // Sort by departure time within each date
    filteredTrips.sort((a: any, b: any) => {
      const timeA = new Date(`${a.date}T${a.train.departure_time}`);
      const timeB = new Date(`${b.date}T${b.train.departure_time}`);
      return timeA.getTime() - timeB.getTime();
    });

    return NextResponse.json(filteredTrips);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

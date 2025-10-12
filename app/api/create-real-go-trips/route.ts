import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Use service role client to bypass RLS for setup
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Clear existing test data first
    await supabase
      .from('trips')
      .delete()
      .gte('date', new Date().toISOString().split('T')[0]);

    await supabase
      .from('trains')
      .delete()
      .eq('origin', 'Kitchener GO')
      .eq('destination', 'Union Station');

    // Create trains with real GO Transit schedule times
    const { data: trains, error: trainsError } = await supabase
      .from('trains')
      .insert([
        // Morning trains
        {
          departure_time: '05:15:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        {
          departure_time: '06:07:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        {
          departure_time: '06:38:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        {
          departure_time: '07:08:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        {
          departure_time: '07:38:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        {
          departure_time: '08:08:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        {
          departure_time: '08:36:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        // Midday trains
        {
          departure_time: '11:48:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        {
          departure_time: '14:48:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        // Evening trains
        {
          departure_time: '20:48:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
      ])
      .select('id, departure_time');

    if (trainsError) {
      throw new Error(`Failed to create trains: ${trainsError.message}`);
    }

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Create trip instances for today and tomorrow
    const trips = [];
    for (const train of trains || []) {
      trips.push(
        { train_id: train.id, date: today, status: 'scheduled' },
        { train_id: train.id, date: tomorrow, status: 'scheduled' }
      );
    }

    const { data: createdTrips, error: tripsError } = await supabase
      .from('trips')
      .insert(trips)
      .select('id, date, train_id');

    if (tripsError) {
      throw new Error(`Failed to create trips: ${tripsError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Created real GO Transit trips!',
      data: {
        trains: trains?.map(t => t.departure_time) || [],
        trips: createdTrips?.length || 0,
        today: today,
        tomorrow: tomorrow,
      },
      nextSteps: [
        '✅ Visit http://localhost:3000/today',
        '✅ See real GO Transit schedule times',
        '✅ Click "Join Train" on any available trip',
      ],
    });
  } catch (error) {
    console.error('Error creating real GO trips:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create real GO trips: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

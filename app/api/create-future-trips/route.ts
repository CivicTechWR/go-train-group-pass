import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { format, addHours } from 'date-fns';

export async function POST() {
  try {
    // Use service role client to bypass RLS for setup
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const now = new Date();

    // Create trains that depart 1, 2, 3, 4, and 5 hours from now
    const futureDepartures = [1, 2, 3, 4, 5].map(hoursFromNow => {
      const departureTime = addHours(now, hoursFromNow);
      return format(departureTime, 'HH:mm:ss');
    });

    // Get today's date
    const today = format(now, 'yyyy-MM-dd');

    // Delete old test trains (ones we created for testing)
    await supabase
      .from('trains')
      .delete()
      .in('departure_time', futureDepartures);

    // Create new trains with future departure times
    const { data: newTrains, error: trainError } = await supabase
      .from('trains')
      .insert(
        futureDepartures.map(time => ({
          departure_time: time,
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        }))
      )
      .select('id, departure_time');

    if (trainError) {
      return NextResponse.json({
        success: false,
        error: `Failed to create trains: ${trainError.message}`,
      }, { status: 500 });
    }

    // Create trip instances for today
    const { data: trips, error: tripError } = await supabase
      .from('trips')
      .insert(
        newTrains!.map(train => ({
          train_id: train.id,
          date: today,
          status: 'scheduled',
        }))
      )
      .select('id, date, train:trains(departure_time)');

    if (tripError) {
      return NextResponse.json({
        success: false,
        error: `Failed to create trips: ${tripError.message}`,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Created trips with future departure times!',
      data: {
        trains: newTrains?.map(t => t.departure_time),
        trips: trips?.length,
        note: 'These trains depart 1-5 hours from now, so you can join them for testing',
      },
      nextSteps: [
        '✅ Visit http://localhost:3000/today',
        '✅ Click "Join Train" on any trip',
        '✅ Watch the group form!',
      ],
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

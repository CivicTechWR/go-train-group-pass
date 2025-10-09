import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format } from 'date-fns';

// KW → Union morning trains
const MORNING_TRAINS = [
  { departure_time: '06:38:00', origin: 'Kitchener GO', destination: 'Union Station' },
  { departure_time: '06:53:00', origin: 'Kitchener GO', destination: 'Union Station' },
  { departure_time: '07:07:00', origin: 'Kitchener GO', destination: 'Union Station' },
  { departure_time: '07:22:00', origin: 'Kitchener GO', destination: 'Union Station' },
  { departure_time: '07:38:00', origin: 'Kitchener GO', destination: 'Union Station' },
];

export async function POST() {
  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Supabase environment variables',
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Seed trains (upsert to avoid duplicates)
    const trainPromises = MORNING_TRAINS.map(async (train) => {
      const { data, error } = await supabase
        .from('trains')
        .upsert(
          {
            ...train,
            direction: 'outbound',
            days_of_week: [1, 2, 3, 4, 5], // Mon-Fri
          },
          {
            onConflict: 'departure_time,origin,destination,direction',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    const trains = await Promise.all(trainPromises);

    // 2. Create trip instances for today and tomorrow
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const dates = [today, tomorrow];

    const tripPromises = trains.flatMap((train) =>
      dates.map(async (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');

        const { data, error } = await supabase
          .from('trips')
          .upsert(
            {
              train_id: train.id,
              date: dateStr,
              status: 'scheduled',
            },
            {
              onConflict: 'train_id,date',
              ignoreDuplicates: false,
            }
          )
          .select()
          .single();

        if (error) throw error;
        return data;
      })
    );

    const trips = await Promise.all(tripPromises);

    return NextResponse.json({
      success: true,
      message: `Seeded ${trains.length} trains and created ${trips.length} trip instances`,
      data: {
        trains: trains.length,
        trips: trips.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format } from 'date-fns';

// KW → Union morning trains
const MORNING_TRAINS = [
  {
    departure_time: '06:38:00',
    origin: 'Kitchener GO',
    destination: 'Union Station',
  },
  {
    departure_time: '06:53:00',
    origin: 'Kitchener GO',
    destination: 'Union Station',
  },
  {
    departure_time: '07:07:00',
    origin: 'Kitchener GO',
    destination: 'Union Station',
  },
  {
    departure_time: '07:22:00',
    origin: 'Kitchener GO',
    destination: 'Union Station',
  },
  {
    departure_time: '07:38:00',
    origin: 'Kitchener GO',
    destination: 'Union Station',
  },
];

export async function POST() {
  try {
    console.log('Starting seed process...');

    // Initialize Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('Missing environment variables');
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Supabase environment variables',
        },
        { status: 500 }
      );
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Seed trains (upsert to avoid duplicates)
    console.log('Seeding trains...');
    const trainPromises = MORNING_TRAINS.map(async train => {
      console.log(`Processing train: ${train.departure_time}`);
      const { data, error } = await supabase
        .from('trains')
        .insert({
          ...train,
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5], // Mon-Fri
        })
        .select()
        .single();

      if (error) {
        console.error(`Error processing train ${train.departure_time}:`, error);
        throw error;
      }
      console.log(`Successfully processed train: ${train.departure_time}`);
      return data;
    });

    console.log('Waiting for all trains to be processed...');
    const trains = await Promise.all(trainPromises);
    console.log(`Processed ${trains.length} trains`);

    // 2. Create trip instances for today and tomorrow
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const dates = [today, tomorrow];

    const tripPromises = trains.flatMap(train =>
      dates.map(async date => {
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
        details:
          error instanceof Error ? error.stack : 'No stack trace available',
      },
      { status: 500 }
    );
  }
}

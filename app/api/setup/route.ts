import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Use service role client to bypass RLS for setup
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Step 1: Check if schema exists
    const { error: tableError } = await supabase
      .from('trains')
      .select('id')
      .limit(1);

    if (tableError) {
      return NextResponse.json({
        success: false,
        error: 'Database schema not set up. Please run migrations in Supabase dashboard first.',
        instructions: [
          '1. Go to https://supabase.com/dashboard/project/gwljtlrlbiygermawabm/sql',
          '2. Copy/paste contents from supabase/migrations/001_initial_schema.sql',
          '3. Run the SQL',
          '4. Copy/paste contents from supabase/migrations/002_rebalance_groups_function.sql',
          '5. Run the SQL',
          '6. Call this endpoint again',
        ],
      }, { status: 400 });
    }

    // Step 2: Seed train data (upsert to avoid duplicates)
    const trains = [
      { departure_time: '06:38:00', origin: 'Kitchener GO', destination: 'Union Station', direction: 'outbound', days_of_week: [1,2,3,4,5] },
      { departure_time: '06:53:00', origin: 'Kitchener GO', destination: 'Union Station', direction: 'outbound', days_of_week: [1,2,3,4,5] },
      { departure_time: '07:07:00', origin: 'Kitchener GO', destination: 'Union Station', direction: 'outbound', days_of_week: [1,2,3,4,5] },
      { departure_time: '07:22:00', origin: 'Kitchener GO', destination: 'Union Station', direction: 'outbound', days_of_week: [1,2,3,4,5] },
      { departure_time: '07:38:00', origin: 'Kitchener GO', destination: 'Union Station', direction: 'outbound', days_of_week: [1,2,3,4,5] },
    ];

    // Check if trains already exist
    const { data: existingTrains } = await supabase
      .from('trains')
      .select('id, departure_time')
      .eq('origin', 'Kitchener GO');

    let trainIds: string[] = [];

    if (!existingTrains || existingTrains.length === 0) {
      // Insert trains
      const { data: insertedTrains, error: trainError } = await supabase
        .from('trains')
        .insert(trains)
        .select('id');

      if (trainError) {
        return NextResponse.json({
          success: false,
          error: `Failed to seed trains: ${trainError.message}`,
        }, { status: 500 });
      }

      trainIds = insertedTrains?.map(t => t.id) || [];
    } else {
      trainIds = existingTrains.map(t => t.id);
    }

    // Step 3: Create trip instances for today and tomorrow
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const trips = [];
    for (const trainId of trainIds) {
      trips.push(
        { train_id: trainId, date: today, status: 'scheduled' },
        { train_id: trainId, date: tomorrow, status: 'scheduled' }
      );
    }

    // Upsert trips (avoid duplicates)
    const { error: tripError } = await supabase
      .from('trips')
      .upsert(trips, {
        onConflict: 'train_id,date',
        ignoreDuplicates: true,
      });

    if (tripError) {
      return NextResponse.json({
        success: false,
        error: `Failed to create trips: ${tripError.message}`,
      }, { status: 500 });
    }

    // Step 4: Create a test user profile (bypassing auth for testing)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'test@gotrain.app')
      .single();

    let testUserId = existingProfile?.id;

    if (!testUserId) {
      // Generate a deterministic UUID for testing
      const testUuid = '00000000-0000-0000-0000-000000000001';

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: testUuid,
          phone: '+15555551234',
          email: 'test@gotrain.app',
          display_name: 'Test User',
        })
        .select('id')
        .single();

      if (profileError && !profileError.message.includes('duplicate')) {
        return NextResponse.json({
          success: false,
          error: `Failed to create test profile: ${profileError.message}`,
        }, { status: 500 });
      }

      testUserId = newProfile?.id || testUuid;
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup complete!',
      data: {
        trains: trainIds.length,
        trips: trips.length,
        testUserId,
      },
      nextSteps: [
        `1. Update app/today/page.tsx line 52: const currentUserId = '${testUserId}';`,
        '2. Visit http://localhost:3000/today',
        '3. Try joining and leaving trains!',
      ],
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

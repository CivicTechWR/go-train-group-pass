import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Use service role client to bypass RLS for debugging
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all trips for today
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select(`
        *,
        train:trains(*)
      `)
      .eq('date', '2025-10-09')
      .order('created_at', { ascending: false });

    if (tripsError) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch trips: ${tripsError.message}`,
      }, { status: 500 });
    }

    // Get all trains
    const { data: trains, error: trainsError } = await supabase
      .from('trains')
      .select('*')
      .order('created_at', { ascending: false });

    if (trainsError) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch trains: ${trainsError.message}`,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        trips: trips || [],
        trains: trains || [],
        tripCount: trips?.length || 0,
        trainCount: trains?.length || 0,
      }
    });

  } catch (error) {
    console.error('Debug trips error:', error);
    return NextResponse.json({
      success: false,
      error: `Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}

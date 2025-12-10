import { RoundTripSchema, TripScheduleDetails } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { message: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format (ISO date string YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { message: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_URL}/trip-schedule/search/round-trip-kitchener-union?date=${date}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Explicitly disable caching
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message: responseData.message || 'Failed to fetch schedules',
          ...(responseData.errors && { errors: responseData.errors }),
        },
        { status: response.status }
      );
    }

    const data = responseData.data || responseData;

    const parseSchedule = (schedule: TripScheduleDetails) => {
      if (!schedule) return null;
      return {
        ...schedule,
        departureTime: new Date(schedule.departureTime),
        arrivalTime: new Date(schedule.arrivalTime),
      };
    };

    const parsedData = {
      departureTrips: (data.departureTrips || [])
        .map(parseSchedule)
        .filter(Boolean),
      returnTrips: (data.returnTrips || []).map(parseSchedule).filter(Boolean),
    };

    const parseResult = RoundTripSchema.safeParse(parsedData);
    if (!parseResult.success) {
      const zodError = parseResult.error;
      console.error(
        'Schema validation failed:',
        JSON.stringify(zodError.issues, null, 2)
      );
    }

    const nextResponse = NextResponse.json(
      parseResult.success ? parseResult.data : parsedData
    );
    nextResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');

    return nextResponse;
  } catch (error) {
    console.error('Error fetching trip schedules:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch schedules. Please try again.',
      },
      { status: 500 }
    );
  }
}

import { ExistingItinerariesSchema } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Authorization required. Please sign in.' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/itineraries/existing`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            responseData.message || 'Failed to fetch existing itineraries',
          ...(responseData.errors && { errors: responseData.errors }),
        },
        { status: response.status }
      );
    }

    const data = responseData.data || responseData;

    const parseTripDetails = (trip: any) => ({
      ...trip,
      departureTime: new Date(trip.departureTime),
      arrivalTime: new Date(trip.arrivalTime),
    });

    const parsedData = (data || []).map((itinerary: any) => ({
      ...itinerary,
      tripDetails: (itinerary.tripDetails || []).map(parseTripDetails),
    }));

    const parseResult = ExistingItinerariesSchema.safeParse(parsedData);
    if (!parseResult.success) {
      const zodError = parseResult.error;
      console.error('Backend response shape mismatch:', zodError.issues);
      return NextResponse.json(
        {
          message: 'Invalid response format from backend',
          errors: zodError.issues,
        },
        { status: 500 }
      );
    }

    const nextResponse = NextResponse.json(parseResult.data);
    nextResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');

    return nextResponse;
  } catch (error) {
    console.error('Error fetching existing itineraries:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch existing itineraries. Please try again.',
      },
      { status: 500 }
    );
  }
}

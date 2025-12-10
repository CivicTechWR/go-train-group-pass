import {
  CreateItinerarySchema,
  ItineraryCreationResponseSchema,
  ItineraryQueryParamsSchema,
  ItineraryTravelInfoSchema,
} from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateItinerarySchema.parse(body);

    // Extract access token from cookies for authentication
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Authorization required. Please sign in.' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/itineraries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(validatedData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message: responseData.message || 'Failed to create itinerary',
          ...(responseData.errors && { errors: responseData.errors }),
        },
        { status: response.status }
      );
    }

    const data = responseData.data || responseData;

    const parseTripDetails = (trip: {
      tripId: string;
      routeShortName: string;
      orgStation: string;
      destStation: string;
      departureTime: string | Date;
      arrivalTime: string | Date;
    }) => ({
      ...trip,
      departureTime: new Date(trip.departureTime),
      arrivalTime: new Date(trip.arrivalTime),
    });

    const parsedData = {
      ...data,
      trips: (data.trips || []).map(parseTripDetails),
    };

    // Validate response schema
    const parseResult = ItineraryCreationResponseSchema.safeParse(parsedData);
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

    // Prevent caching
    const nextResponse = NextResponse.json(parseResult.data);
    nextResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');

    return nextResponse;
  } catch (error) {
    // Only catch request validation errors here
    // Response validation errors are handled above
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Itinerary ID is required' },
        { status: 400 }
      );
    }

    // Validate query parameters
    const validatedParams = ItineraryQueryParamsSchema.parse({ id });

    // Extract access token from cookies for authentication
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Authorization required. Please sign in.' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/itineraries?id=${encodeURIComponent(validatedParams.id)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            responseData.message || 'Failed to fetch itinerary travel info',
          ...(responseData.errors && { errors: responseData.errors }),
        },
        { status: response.status }
      );
    }

    const data = responseData.data || responseData;

    // Parse date strings to Date objects for tripDetails
    const parseTripDetails = (trip: {
      tripId: string;
      routeShortName: string;
      orgStation: string;
      destStation: string;
      departureTime: string | Date;
      arrivalTime: string | Date;
    }) => ({
      ...trip,
      departureTime: new Date(trip.departureTime),
      arrivalTime: new Date(trip.arrivalTime),
    });

    const parsedData = {
      ...data,
      tripDetails: (data.tripDetails || []).map(parseTripDetails),
    };

    // Validate response schema
    const parseResult = ItineraryTravelInfoSchema.safeParse(parsedData);
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

    // Prevent caching
    const nextResponse = NextResponse.json(parseResult.data);
    nextResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');

    return nextResponse;
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch itinerary travel info. Please try again.',
      },
      { status: 500 }
    );
  }
}

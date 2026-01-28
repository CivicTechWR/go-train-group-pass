
import { apiPost } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
    try {
        const accessToken = request.cookies.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { message: 'Authorization required. Please sign in.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { itineraryId } = body;

        if (!itineraryId) {
            return NextResponse.json(
                { message: 'Itinerary ID is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/group-formation/itinerary/${itineraryId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: '{}',
        });

        const responseData = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    message: responseData.message || 'Failed to form groups',
                    ...(responseData.errors && { errors: responseData.errors }),
                },
                { status: response.status }
            );
        }

        return NextResponse.json(responseData);
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error ? error.message : 'Failed to form groups',
            },
            { status: 500 }
        );
    }
}

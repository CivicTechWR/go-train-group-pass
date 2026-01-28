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

        const response = await fetch(`${BACKEND_URL}/itineraries/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        const responseData = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    message: responseData.message || 'Failed to join itinerary',
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
                    error instanceof Error ? error.message : 'Failed to join itinerary',
            },
            { status: 500 }
        );
    }
}

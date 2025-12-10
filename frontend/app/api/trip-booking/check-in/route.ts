
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;

        const accessToken = request.cookies.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { message: 'Authorization required. Please sign in.' },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { message: 'Booking ID is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/trip-booking/check-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ id }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Failed to check in';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Fallback to text if not JSON
                if (errorText) errorMessage = errorText;
            }

            return NextResponse.json(
                { message: errorMessage },
                { status: response.status }
            );
        }

        // Backend returns 201 Created with likely empty body or void.
        // Return a success object for the frontend.
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Check-in proxy error:', error);
        return NextResponse.json(
            {
                message:
                    error instanceof Error ? error.message : 'Internal server error',
            },
            { status: 500 }
        );
    }
}

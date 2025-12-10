'use client';

import { Button } from '@/components/ui/button';
import { apiPost } from '@/lib/api';
import { useState } from 'react';

interface JoinButtonProps {
    tripSequence: string;
    stewardType?: boolean;
}

export default function JoinButton({ tripSequence, stewardType }: JoinButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleJoin = async () => {
        setIsLoading(true);
        try {
            // Based on analysis, we are using tripSequence to join/create similar itinerary
            // But prompt asked for /itineraries/:id/join. 
            // using tripSequence as the ID parameter for now as discussed.
            await apiPost('/itineraries/join', {
                tripSequence,
                wantsToSteward: !!stewardType
            });
            window.location.reload(); // Refresh to show updated state
        } catch (error) {
            console.error('Failed to join itinerary:', error);
            alert('Failed to join itinerary. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleJoin}
            disabled={isLoading}
            size="sm"
            variant={stewardType ? "secondary" : "default"}
        >
            {isLoading ? 'Joining...' : (stewardType ? 'Join as Steward' : 'Join')}
        </Button>
    );
}

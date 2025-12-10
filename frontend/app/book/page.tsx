'use client';

import { RoundTripForm } from '@/components/trip/RoundTripForm';
import { apiPost } from '@/lib/api';
import {
  CreateItineraryInput,
  ItineraryCreationResponse,
  RoundTripFormInput,
} from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BookPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const transformFormData = (
    data: RoundTripFormInput
  ): CreateItineraryInput => {
    if (!data.selectedDeparture || !data.selectedReturn) {
      throw new Error('Both departure and return must be selected');
    }

    return {
      segments: [
        {
          gtfsTripId: data.selectedDeparture.tripCreationMetaData.tripId,
          originStopTimeId:
            data.selectedDeparture.tripCreationMetaData.departureStopTimeId,
          destStopTimeId:
            data.selectedDeparture.tripCreationMetaData.arrivalStopTimeId,
        },
        {
          gtfsTripId: data.selectedReturn.tripCreationMetaData.tripId,
          originStopTimeId:
            data.selectedReturn.tripCreationMetaData.departureStopTimeId,
          destStopTimeId:
            data.selectedReturn.tripCreationMetaData.arrivalStopTimeId,
        },
      ],
      wantsToSteward: data.wantsToSteward,
    };
  };

  const handleSubmit = async (data: RoundTripFormInput) => {
    setError(null);

    try {
      const transformedData = transformFormData(data);
      const response = await apiPost<ItineraryCreationResponse>(
        '/itineraries',
        transformedData
      );

      // Success - redirect to itineraries page
      router.push('/itineraries');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create itinerary. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className='container mx-auto px-6 py-8 relative'>
      <div className='max-w-3xl mx-auto'>
        {error && (
          <div className='mb-4 p-4 bg-destructive/10 border border-destructive rounded-md'>
            <p className='text-sm text-destructive'>{error}</p>
          </div>
        )}
        <RoundTripForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

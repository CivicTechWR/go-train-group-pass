'use client';

import { RoundTripForm } from '@/components/trip/RoundTripForm';
import { RoundTripFormInput } from '@/lib/types';

export default function BookPage() {
  const handleSubmit = (data: RoundTripFormInput) => {
    // TODO: Send data to backend API
    console.log('Itinerary data to be sent:', {
      date: data.date,
      departure: data.selectedDeparture,
      return: data.selectedReturn,
    });
  };

  return (
    <div className='container mx-auto px-6 py-8 relative'>
      <div className='max-w-3xl mx-auto'>
        <RoundTripForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

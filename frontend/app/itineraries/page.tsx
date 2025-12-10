'use client';

import { apiGet } from '@/lib/api';
import { QuickViewItineraries, QuickViewItinerariesSchema } from '@/lib/types';
import { useEffect, useState } from 'react';
import ItineraryCard from './ItineraryCard';
import JoinButton from './JoinButton';
import Link from 'next/link';

export default function ItinerariesPage() {
  const [data, setData] = useState<QuickViewItineraries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItineraries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiGet<QuickViewItineraries>('/itineraries/quick-view');
        const parsed = QuickViewItinerariesSchema.parse(result);
        setData(parsed);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load itineraries. Please try again.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  return (
    <div className='container mx-auto px-4 md:px-6 py-4 md:py-8 relative'>
      <div className='mb-6 md:mb-8 text-center'>
        <h1 className='text-3xl md:text-4xl font-bold mb-2'>Existing Itineraries</h1>
        <p className='text-muted-foreground'>
          View itineraries and see who else is interested in the same journey
        </p>
      </div>

      {isLoading ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>Loading itineraries...</p>
        </div>
      ) : error ? (
        <div className='text-center py-12'>
          <p className='text-destructive mb-4'>{error}</p>
          <p className='text-sm text-muted-foreground'>
            Please try refreshing the page
          </p>
        </div>
      ) : !data ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground mb-4'>No itineraries found</p>
        </div>
      ) : (
        <div className='space-y-12 mb-20'>
          {data.joinedItineraries.length > 0 && (
            <section>
              <h2 className='text-2xl font-bold mb-4 md:mb-6 text-center md:text-left'>My Itineraries</h2>
              <div className='space-y-4 md:space-y-6'>
                {data.joinedItineraries.map((itinerary) => (
                  <Link href={`/itineraries/${itinerary.itineraryId}`} key={itinerary.itineraryId} className="block transition-transform hover:scale-[1.01]">
                    <ItineraryCard
                      tripDetails={itinerary.tripDetails}
                      userCount={itinerary.userCount}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {data.itinerariesToJoin.length > 0 && (
            <section>
              <h2 className='text-2xl font-bold mb-4 md:mb-6 text-center md:text-left'>Other Itineraries</h2>
              <div className='space-y-4 md:space-y-6'>
                {data.itinerariesToJoin.map((itinerary, index) => (
                  <ItineraryCard
                    // itinerariesToJoin don't have IDs in the current schema implementation, so we use index and tripSequence if unique
                    key={itinerary.tripSequence + index}
                    tripDetails={itinerary.tripDetails}
                    userCount={itinerary.userCount}
                    action={
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <JoinButton tripSequence={itinerary.tripSequence} />
                        <JoinButton tripSequence={itinerary.tripSequence} stewardType={true} />
                      </div>
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {data.joinedItineraries.length === 0 && data.itinerariesToJoin.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-muted-foreground mb-4'>No itineraries yet</p>
              <p className='text-sm text-muted-foreground'>
                Check back later to see available itineraries
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

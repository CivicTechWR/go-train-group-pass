'use client';

import { Separator } from '@/components/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { apiGet } from '@/lib/api';
import { ExistingItinerary } from '@/lib/types';
import { getRelativeDateLabel } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ItinerariesPage() {
  const [itineraries, setItineraries] = useState<ExistingItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItineraries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiGet<ExistingItinerary[]>('/itineraries/existing');
        setItineraries(data);
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
    <div className='container mx-auto px-6 py-8 relative'>
      <div className='mb-8 text-center'>
        <h1 className='text-4xl font-bold mb-2'>Existing Itineraries</h1>
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
      ) : itineraries.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground mb-4'>No itineraries yet</p>
          <p className='text-sm text-muted-foreground'>
            Check back later to see available itineraries
          </p>
        </div>
      ) : (
        <div className='space-y-6 mb-20'>
          {itineraries.map((itinerary, index) => (
            <Card
              key={index}
              className='flex flex-col gap-4 w-full max-w-5xl mx-auto'
            >
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <CardDescription className='flex items-center gap-1 text-inherit dark:text-white'>
                      <Calendar className='h-4 w-4' />
                      {itinerary.tripDetails.length > 0 && (
                        <>
                          {format(
                            itinerary.tripDetails[0].departureTime,
                            'yyyy-MM-dd'
                          )}{' '}
                          {getRelativeDateLabel(
                            itinerary.tripDetails[0].departureTime
                          )}
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex-1'>
                <div className='flex gap-4 flex-wrap items-start'>
                  {itinerary.tripDetails.flatMap((trip, tripIndex) =>
                    [
                      <div
                        key={`trip-${tripIndex}`}
                        className='flex-1 min-w-[200px]'
                      >
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded'>
                              Trip {tripIndex + 1}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm'>
                            <MapPin className='h-4 w-4 text-primary' />
                            <span className='font-medium'>
                              {trip.orgStation}
                            </span>
                            <ArrowRight className='h-4 w-4 text-muted-foreground' />
                            <span className='font-medium'>
                              {trip.destStation}
                            </span>
                          </div>
                          <div className='flex items-center gap-1.5 pl-6 text-xs text-muted-foreground'>
                            <span>
                              Departs{' '}
                              <span className='font-semibold'>
                                {format(trip.departureTime, 'h:mm a')}
                              </span>{' '}
                              • Arrives{' '}
                              <span className='font-semibold'>
                                {format(trip.arrivalTime, 'h:mm a')}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>,
                      tripIndex < itinerary.tripDetails.length - 1 && (
                        <Separator
                          key={`separator-${tripIndex}`}
                          orientation='vertical'
                          className='h-auto'
                        />
                      ),
                    ].filter(Boolean)
                  )}
                </div>
              </CardContent>
              <CardFooter className='gap-3'>
                <div className='flex items-center gap-2 flex-1'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm text-muted-foreground'>
                    <span className='font-medium'>{itinerary.userCount}</span>{' '}
                    going
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { Separator } from '@/components/ui';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { itineraryMock } from '@/lib/mock/itinerary-mock';
import { format } from 'date-fns';
import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react';

export default function ItinerariesPage() {
  const itineraries = itineraryMock;

  return (
    <div className='container mx-auto px-6 py-8 min-h-screen relative'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold mb-2'>Existing Itineraries</h1>
        <p className='text-muted-foreground'>
          View itineraries and see who else is interested in the same journey
        </p>
      </div>

      {itineraries.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground mb-4'>No itineraries yet</p>
          <p className='text-sm text-muted-foreground'>
            Check back later to see available itineraries
          </p>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-20'>
          {itineraries.map((itinerary, index) => (
            <Card key={index} className='flex flex-col gap-4'>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <CardTitle className='text-xl mb-1'>
                      Itinerary #{index + 1}
                    </CardTitle>
                    <CardDescription className='flex items-center gap-1'>
                      <Users className='h-4 w-4' />
                      {itinerary.interestedUsersCount}{' '}
                      {itinerary.interestedUsersCount === 1
                        ? 'person'
                        : 'people'}{' '}
                      interested
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex-1 space-y-4'>
                <div className='space-y-4'>
                  {itinerary.trips.map((trip, tripIndex) => (
                    <div key={tripIndex}>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded'>
                            Trip {tripIndex + 1}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-sm'>
                          <MapPin className='h-4 w-4 text-primary' />
                          <span className='font-medium'>{trip.orgStation}</span>
                          <ArrowRight className='h-4 w-4 text-muted-foreground' />
                          <span className='font-medium'>{trip.destStation}</span>
                        </div>
                        <div className='flex flex-col gap-1 pl-6 text-xs text-muted-foreground'>
                          <div className='flex items-center gap-1.5'>
                            <Clock className='h-3 w-3' />
                            <span>
                              Departs:{' '}
                              {format(
                                new Date(trip.departureTime),
                                'MMM d, yyyy @ h:mm a',
                              )}
                            </span>
                          </div>
                          <div className='flex items-center gap-1.5'>
                            <Clock className='h-3 w-3' />
                            <span>
                              Arrives:{' '}
                              {format(
                                new Date(trip.arrivalTime),
                                'MMM d, yyyy @ h:mm a',
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {tripIndex < itinerary.trips.length - 1 && (
                        <Separator className='my-4' />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className='gap-3'>
                <div className='flex items-center gap-2 flex-1'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm text-muted-foreground'>
                    <span className='font-medium'>
                      {itinerary.interestedUsersCount}
                    </span>{' '}
                    {itinerary.interestedUsersCount === 1
                      ? 'person'
                      : 'people'}{' '}
                    interested
                  </span>
                </div>
                <Button size='sm'>Join</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


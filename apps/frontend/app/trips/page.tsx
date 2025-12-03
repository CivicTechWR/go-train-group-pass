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
import { gtfsRouteMock } from '@/lib/mock/gtfs-route-mock';
import { gtfsTripMock } from '@/lib/mock/gtfs-trip-mock';
import { format } from 'date-fns';
import { Bike, CheckCircle2, MapPin, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

// Hardcode people counts for each trip (1-4 people)
const tripPeopleCounts: Record<string, number> = {
  'trip-001': 2,
  'trip-002': 4,
  'trip-003': 1,
};

const MAX_TRIP_COUNT = 5;

export default function TripsPage() {
  const trips = gtfsTripMock;

  // Create a route lookup map
  const routeMap = useMemo(() => {
    const map = new Map();
    gtfsRouteMock.forEach(route => {
      map.set(route.id, route);
    });
    return map;
  }, []);

  return (
    <div className='container mx-auto px-6 py-8 min-h-screen relative'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold mb-2'>Trips</h1>
        <p className='text-muted-foreground'>
          View and manage your scheduled trips
        </p>
      </div>

      {trips.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground mb-4'>No trips yet</p>
          <Button asChild>
            <Link href='/trips/create'>Create your first trip</Link>
          </Button>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-20'>
          {trips.map(trip => {
            const route = routeMap.get(trip.routeId);
            const routeName =
              route?.routeShortName || route?.routeLongName || trip.routeId;
            const peopleCount = tripPeopleCounts[trip.id] || 1;
            const spotsLeft = MAX_TRIP_COUNT - peopleCount;

            return (
              <Card key={trip.id} className='flex flex-col gap-4'>
                <CardHeader>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1'>
                      <CardTitle className='text-xl mb-1'>
                        {trip.tripShortName || 'Unnamed Trip'}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-1'>
                        <MapPin className='h-4 w-4' />
                        {trip.tripHeadsign || 'No destination'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='flex-1 space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <span className='font-medium'>Route:</span>
                      <span>{routeName}</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <span className='font-medium'>Direction:</span>
                      <span>
                        {trip.directionId === 0 ? 'Outbound' : 'Inbound'}
                      </span>
                    </div>
                    {trip.calendarDate && (
                      <div className='flex items-center gap-2 text-sm'>
                        <span className='font-medium'>
                          {format(new Date(trip.calendarDate), 'PPP')}
                        </span>
                        <span className='text-muted-foreground'>
                          at {format(new Date(trip.calendarDate), 'p')}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className='my-6' />

                  <div className='flex flex-wrap gap-4'>
                    {trip.wheelchairAccessible === 1 && (
                      <div className='flex items-center gap-1.5 text-sm'>
                        <CheckCircle2 className='h-4 w-4 text-primary' />
                        <span className='text-muted-foreground'>
                          Wheelchair Accessible
                        </span>
                      </div>
                    )}
                    {trip.bikesAllowed === 1 && (
                      <div className='flex items-center gap-1.5 text-sm'>
                        <Bike className='h-4 w-4 text-primary' />
                        <span className='text-muted-foreground'>
                          Bikes Allowed
                        </span>
                      </div>
                    )}
                  </div>
                  <Separator className='mt-6' />
                </CardContent>
                <CardFooter className='gap-3'>
                  <div className='flex items-center gap-2 flex-1'>
                    <Users className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm text-muted-foreground'>
                      <span className='font-medium'>{peopleCount}</span> going
                    </span>
                    <span className='text-sm text-muted-foreground'>•</span>
                    <span className='text-sm text-muted-foreground'>
                      <span className='font-medium'>{spotsLeft}</span> spot
                      {spotsLeft !== 1 ? 's' : ''} left
                    </span>
                  </div>
                  <Button size='sm' disabled={spotsLeft === 0}>
                    {spotsLeft === 0 ? 'Full' : 'Join'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Link href='/trips/create'>
        <Button
          size='icon'
          className='fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-10'
        >
          <Plus className='h-6 w-6' />
        </Button>
      </Link>
    </div>
  );
}

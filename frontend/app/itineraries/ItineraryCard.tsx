import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui';
import { getRelativeDateLabel } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';

interface TripDetail {
    tripId: string;
    routeShortName: string;
    orgStation: string;
    destStation: string;
    departureTime: Date;
    arrivalTime: Date;
}

interface ItineraryCardProps {
    tripDetails: TripDetail[];
    action?: React.ReactNode;
    userCount?: number;
}

export default function ItineraryCard({ tripDetails, action, userCount }: ItineraryCardProps) {
    return (
        <Card className='flex flex-col gap-4 w-full max-w-5xl mx-auto'>
            <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1'>
                        <CardDescription className='flex items-center gap-1 text-inherit dark:text-white'>
                            <Calendar className='h-4 w-4' />
                            {tripDetails && tripDetails.length > 0 && (
                                <>
                                    {format(
                                        tripDetails[0].departureTime,
                                        'yyyy-MM-dd'
                                    )}{' '}
                                    {getRelativeDateLabel(
                                        tripDetails[0].departureTime
                                    )}
                                </>
                            )}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='flex-1'>
                <div className='flex gap-4 flex-wrap items-start'>
                    {tripDetails && tripDetails.flatMap((trip, tripIndex) =>
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
                            tripDetails && tripIndex < tripDetails.length - 1 && (
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
                        <span className='font-medium'>{userCount}</span>{' '}
                        going
                    </span>
                </div>
                {action && <div>{action}</div>}
            </CardFooter>
        </Card>
    );
}

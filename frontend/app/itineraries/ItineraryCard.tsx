import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowRight, Calendar, Users, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiPost } from '@/lib/api';

interface TripDetail {
    tripId: string;
    routeShortName: string;
    orgStation: string;
    destStation: string;
    departureTime: Date;
    arrivalTime: Date;
    bookingId?: string;
}

function CheckInButton({ bookingId }: { bookingId: string }) {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckIn = async () => {
        try {
            setIsLoading(true);
            await apiPost('/trip-booking/check-in', { id: bookingId });
            setIsCheckedIn(true);
        } catch (error) {
            console.error('Failed to check in:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckedIn) {
        return (
            <Button variant="outline" size="sm" className="text-green-600 border-green-200 bg-green-50" disabled>
                <Check className="w-4 h-4 mr-2" />
                Checked In
            </Button>
        );
    }

    return (
        <Button
            onClick={handleCheckIn}
            disabled={isLoading}
            size="sm"
        >
            {isLoading ? 'Checking in...' : 'Check In'}
        </Button>
    );
}

interface ItineraryCardProps {
    tripDetails: TripDetail[];
    action?: React.ReactNode;
    userCount?: number;
}

export default function ItineraryCard({ tripDetails, action, userCount }: ItineraryCardProps) {
    return (
        <Card className='w-full max-w-5xl mx-auto overflow-hidden'>
            <div className='flex flex-col md:flex-row'>
                <div className='flex-1 p-3 md:p-6'> {/* Reduced padding on mobile */}
                    {tripDetails && tripDetails.map((trip, tripIndex) => {
                        const durationMinutes = Math.round((trip.arrivalTime.getTime() - trip.departureTime.getTime()) / (1000 * 60));
                        const hours = Math.floor(durationMinutes / 60);
                        const minutes = durationMinutes % 60;
                        const durationString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                        return (
                            <div key={tripIndex} className={`${tripIndex > 0 ? 'mt-4 pt-4 border-t' : ''}`}>
                                {/* Header: Carrier & Date */}
                                <div className='flex items-center justify-between mb-2 md:mb-4 text-xs md:text-sm text-muted-foreground'>
                                    <div className='flex items-center gap-2'>
                                        <div className='font-bold text-primary text-base md:text-lg'>GO Transit</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className='flex items-center gap-2'>
                                            <Calendar className='h-3 w-3 md:h-4 md:w-4' />
                                            <span>
                                                {format(trip.departureTime, 'MMM d')}
                                                <span className='md:hidden'> • {format(trip.departureTime, 'EEE')}</span>
                                                <span className='hidden md:inline'> • {format(trip.departureTime, 'EEEE')}</span>
                                            </span>
                                        </div>
                                        {trip.bookingId && (
                                            <CheckInButton bookingId={trip.bookingId} />
                                        )}
                                    </div>
                                </div>

                                {/* Main Trip Layout */}
                                <div className='flex flex-col md:flex-row items-center gap-2 md:gap-0 font-sans'>
                                    {/* Mobile Wrapper for Horizontal Times */}
                                    <div className='flex flex-row items-center justify-between w-full md:w-auto md:contents'>

                                        {/* Departure */}
                                        <div className='flex-1 min-w-[100px] md:min-w-[140px]'>
                                            <div className='text-xl md:text-3xl font-bold leading-none mb-1 text-left'>
                                                {format(trip.departureTime, 'h:mm a')}
                                            </div>
                                            <div className='text-xs md:text-sm text-muted-foreground font-medium text-left truncate max-w-[120px] md:max-w-none'>
                                                {trip.orgStation}
                                            </div>
                                        </div>

                                        {/* Mobile Arrow/Duration */}
                                        <div className='md:hidden flex flex-col items-center justify-center px-2'>
                                            <ArrowRight className='h-4 w-4 text-muted-foreground/60' />
                                            <span className='text-[10px] font-medium text-muted-foreground/80 whitespace-nowrap'>{durationString}</span>
                                        </div>

                                        {/* Arrival */}
                                        <div className='flex-1 min-w-[100px] md:min-w-[140px] text-right'>
                                            <div className='text-xl md:text-3xl font-bold leading-none mb-1'>
                                                {format(trip.arrivalTime, 'h:mm a')}
                                            </div>
                                            <div className='text-xs md:text-sm text-muted-foreground font-medium text-right truncate max-w-[120px] md:max-w-none ml-auto'>
                                                {trip.destStation}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Middle Section: Arrow & Duration */}
                                    <div className='hidden md:flex flex-col items-center justify-center px-6 min-w-[120px]'>
                                        <ArrowRight className='h-5 w-5 text-muted-foreground/60 mb-1' />
                                        <span className='text-xs font-medium text-muted-foreground/80'>{durationString}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* User Count */}
                    {userCount !== undefined && (
                        <div className='flex items-center gap-2 mt-2 md:mt-4 text-xs md:text-sm text-muted-foreground'>
                            <Users className='h-3 w-3 md:h-4 md:w-4' />
                            <span>{userCount} going</span>
                        </div>
                    )}
                </div>

                {/* Action Area */}
                {action && (
                    <div className='md:border-l bg-muted/10 md:bg-transparent p-3 md:p-6 flex items-center justify-center md:min-w-[160px]'>
                        <div className='w-full md:w-auto'>
                            {action}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

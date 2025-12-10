import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowRight, Users, Check, Loader2 } from 'lucide-react';
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
    isCheckedIn?: boolean;
}


function CheckInButton({ bookingId, isCheckedIn }: { bookingId: string, isCheckedIn?: boolean }) {
    // 1. Initialize local state with the prop (Fire and Forget pattern)
    const [isLoading, setIsLoading] = useState(false);
    const [checkedInSuccess, setCheckedInSuccess] = useState(false);
    
    // Optional: If using Next.js App Router to revalidate data in background
    // const router = useRouter();

    const handleCheckIn = async () => {
        if (isCheckedIn) return; // Prevent double clicks

        try {
            setIsLoading(true);
            
            // 2. Perform the API call
            await apiPost('/trip-booking/check-in', { id: bookingId });
            
            // 3. Update local state immediately (Optimistic UI)
            setCheckedInSuccess(true);
            
            // Optional: If you need to ensure the server data is fresh for other components:
            // router.refresh(); 
        } catch (error) {
            console.error('Failed to check in:', error);
            // Ideally show a toast error here
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Render based on the LOCAL state, not just the prop
    if (isCheckedIn || checkedInSuccess) {
        return (
            <Button variant="outline" size="sm" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 cursor-default">
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
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking in...
                </>
            ) : (
                'Check In'
            )}
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
                <div className='flex-1 p-3 md:p-4'> {/* Reduced padding on mobile and desktop */}
                    {tripDetails && tripDetails.map((trip, tripIndex) => {
                        const durationMinutes = Math.round((trip.arrivalTime.getTime() - trip.departureTime.getTime()) / (1000 * 60));
                        const hours = Math.floor(durationMinutes / 60);
                        const minutes = durationMinutes % 60;
                        const durationString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                        return (
                            <div key={tripIndex} className={`${tripIndex > 0 ? 'mt-4 pt-4 border-t' : ''} md:flex md:flex-row md:items-center md:gap-4`}>
                                {/* Header: Date (was Carrier) */}
                                <div className='flex items-center justify-between mb-2 md:mb-0 text-xs md:text-sm text-muted-foreground md:w-auto md:min-w-[180px] md:shrink-0'>
                                    <div className='flex items-center gap-2'>
                                        <div className='font-bold text-primary text-base md:text-lg'>
                                            <span className="md:hidden">{format(trip.departureTime, 'EEE, MMM d')}</span>
                                            <span className="hidden md:inline">{format(trip.departureTime, 'EEEE, MMMM d')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 md:hidden">
                                        {trip.bookingId  && (
                                            <CheckInButton bookingId={trip.bookingId} isCheckedIn={trip.isCheckedIn===true} />
                                        )}
                                    </div>
                                </div>

                                {/* Main Trip Layout */}
                                <div className='flex flex-row items-center justify-between font-sans md:flex-1'>

                                    {/* Departure */}
                                    <div className='flex-1 text-left min-w-[100px] md:min-w-[140px]'>
                                        <div className='text-xl md:text-2xl font-bold leading-none mb-1'>
                                            {format(trip.departureTime, 'h:mm a')}
                                        </div>
                                        <div className='text-xs md:text-sm text-muted-foreground font-medium truncate max-w-[120px] md:max-w-none'>
                                            {trip.orgStation}
                                        </div>
                                    </div>

                                    {/* Arrow & Duration - Centered */}
                                    <div className='flex flex-col items-center justify-center px-2 md:px-6 min-w-[80px]'>
                                        <ArrowRight className='h-4 w-4 md:h-5 md:w-5 text-muted-foreground/60 mb-1' />
                                        <span className='text-[10px] md:text-xs font-medium text-muted-foreground/80 whitespace-nowrap'>{durationString} duration</span>
                                    </div>

                                    {/* Arrival */}
                                    <div className='flex-1 text-right min-w-[100px] md:min-w-[140px]'>
                                        <div className='text-xl md:text-2xl font-bold leading-none mb-1'>
                                            {format(trip.arrivalTime, 'h:mm a')}
                                        </div>
                                        <div className='text-xs md:text-sm text-muted-foreground font-medium truncate max-w-[120px] md:max-w-none ml-auto'>
                                            {trip.destStation}
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop CheckIn Button - Moved here to be inline */}
                                <div className="hidden md:flex items-center gap-4 ml-4">
                                    {trip.bookingId && (
                                        <CheckInButton bookingId={trip.bookingId} isCheckedIn={trip.isCheckedIn} />
                                    )}
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
                    <div className='md:border-l bg-muted/10 md:bg-transparent p-3 md:p-4 flex items-center justify-center md:min-w-[160px]'>
                        <div className='w-full md:w-auto'>
                            {action}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

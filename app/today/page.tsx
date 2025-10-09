'use client';

import { format, addDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripCard } from '@/components/trips/TripCard';
import { TripCardSkeleton } from '@/components/trips/TripCardSkeleton';
import { useGroupUpdates } from '@/hooks/useGroupUpdates';
import { trpc } from '@/lib/trpc/client';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function TodayPage() {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

  // Fetch today's trips
  const todayQuery = trpc.trips.list.useQuery(
    { startDate: todayStr, endDate: todayStr },
    { refetchInterval: 30000 } // Refetch every 30 seconds as backup
  );

  // Fetch tomorrow's trips
  const tomorrowQuery = trpc.trips.list.useQuery(
    { startDate: tomorrowStr, endDate: tomorrowStr },
    { refetchInterval: 30000 }
  );

  // Get user session
  const todayTripIds = todayQuery.data?.map((t) => t.id) || [];
  const tomorrowTripIds = tomorrowQuery.data?.map((t) => t.id) || [];

  // Subscribe to real-time updates for today's trips
  const todayRealtime = useGroupUpdates({
    tripIds: todayTripIds,
    enabled: todayTripIds.length > 0,
  });

  // Subscribe to real-time updates for tomorrow's trips
  const tomorrowRealtime = useGroupUpdates({
    tripIds: tomorrowTripIds,
    enabled: tomorrowTripIds.length > 0,
  });

  // Test user ID from database (in production, get from auth context)
  // TODO: Replace with actual user ID from auth context
  const currentUserId = 'a702251f-4686-4a79-aa8a-3fc936194860';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-6">
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Your Trains</h1>
          <p className="text-muted-foreground">
            Join a train to see your group assignment
          </p>
        </div>

        {/* Tabs for today/tomorrow */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today" className="relative">
              Today
              {todayQuery.data && todayQuery.data.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {todayQuery.data.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tomorrow" className="relative">
              Tomorrow
              {tomorrowQuery.data && tomorrowQuery.data.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {tomorrowQuery.data.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Today's trips */}
          <TabsContent value="today" className="space-y-4">
            {/* Connection status */}
            {todayTripIds.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {todayRealtime.isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span>Live updates active</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-orange-600" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
            )}

            {todayQuery.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <TripCardSkeleton key={i} />
                ))}
              </div>
            ) : todayQuery.error ? (
              <div className="flex items-center gap-2 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  Failed to load trips: {todayQuery.error.message}
                </p>
              </div>
            ) : todayQuery.data && todayQuery.data.length > 0 ? (
              <div className="space-y-4">
                {todayQuery.data.map((trip) => (
                  <TripCard key={trip.id} trip={trip} currentUserId={currentUserId} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No trains scheduled for today</p>
              </div>
            )}
          </TabsContent>

          {/* Tomorrow's trips */}
          <TabsContent value="tomorrow" className="space-y-4">
            {/* Connection status */}
            {tomorrowTripIds.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {tomorrowRealtime.isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span>Live updates active</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-orange-600" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
            )}

            {tomorrowQuery.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <TripCardSkeleton key={i} />
                ))}
              </div>
            ) : tomorrowQuery.error ? (
              <div className="flex items-center gap-2 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  Failed to load trips: {tomorrowQuery.error.message}
                </p>
              </div>
            ) : tomorrowQuery.data && tomorrowQuery.data.length > 0 ? (
              <div className="space-y-4">
                {tomorrowQuery.data.map((trip) => (
                  <TripCard key={trip.id} trip={trip} currentUserId={currentUserId} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No trains scheduled for tomorrow</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

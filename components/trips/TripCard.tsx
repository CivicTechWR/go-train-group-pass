'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Users, ArrowRight, Calendar } from 'lucide-react';
import { format, parse, isToday, isTomorrow } from 'date-fns';
import { CountdownTimer } from './CountdownTimer';
import { GroupCard } from '@/components/groups/GroupCard';
import type { TripWithDetails } from '@/types/database';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface TripCardProps {
  trip: TripWithDetails;
  currentUserId: string;
}

export function TripCard({ trip, currentUserId }: TripCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const joinMutation = trpc.trips.join.useMutation({
    onSuccess: () => {
      toast.success('Successfully joined trip!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const leaveMutation = trpc.trips.leave.useMutation({
    onSuccess: () => {
      toast.success('Successfully left trip');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Check if user is in this trip
  const userMembership = trip.groups
    .flatMap((g) => g.memberships)
    .find((m) => m.user_id === currentUserId);

  const userGroup = trip.groups.find((g) =>
    g.memberships.some((m) => m.user_id === currentUserId)
  );

  const totalRiders = trip.groups.reduce(
    (sum, group) => sum + group.memberships.length,
    0
  );

  // Parse departure time (handle both HH:mm:ss and HH:mm:ss.SSSSSS formats)
  const cleanTime = trip.train.departure_time.split('.')[0]; // Remove microseconds if present
  const departureDate = parse(
    `${trip.date} ${cleanTime}`,
    'yyyy-MM-dd HH:mm:ss',
    new Date()
  );

  const handleJoin = () => {
    joinMutation.mutate({ tripId: trip.id });
  };

  const handleLeave = () => {
    leaveMutation.mutate({ tripId: trip.id });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-2xl font-bold">
                {format(parse(cleanTime, 'HH:mm:ss', new Date()), 'h:mm a')}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {isToday(new Date(trip.date))
                  ? 'Today'
                  : isTomorrow(new Date(trip.date))
                  ? 'Tomorrow'
                  : format(new Date(trip.date), 'MMM d')}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{trip.train.origin.replace(' GO', '')}</span>
              <ArrowRight className="h-4 w-4" />
              <span>{trip.train.destination.replace(' Station', '')}</span>
            </div>
          </div>
          <CountdownTimer departureTime={departureDate} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {totalRiders} {totalRiders === 1 ? 'rider' : 'riders'}
          </Badge>
          {trip.groups.length > 0 && (
            <Badge variant="secondary">
              {trip.groups.length} {trip.groups.length === 1 ? 'group' : 'groups'}
            </Badge>
          )}
          {userMembership && (
            <Badge variant="default">You&apos;re in Group {userGroup?.group_number}</Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {userMembership ? (
            <Button
              variant="outline"
              onClick={handleLeave}
              disabled={leaveMutation.isPending}
              className="flex-1"
            >
              {leaveMutation.isPending ? 'Leaving...' : 'Leave Train'}
            </Button>
          ) : (
            <Button
              onClick={handleJoin}
              disabled={joinMutation.isPending}
              className="flex-1"
            >
              {joinMutation.isPending ? 'Joining...' : 'Join Train'}
            </Button>
          )}

          {trip.groups.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Expandable groups section */}
        {isExpanded && trip.groups.length > 0 && (
          <div className="space-y-3 pt-3 border-t">
            <p className="text-sm font-medium text-muted-foreground">Groups</p>
            <div className="grid gap-3">
              {trip.groups
                .sort((a, b) => a.group_number - b.group_number)
                .map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    currentUserId={currentUserId}
                  />
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

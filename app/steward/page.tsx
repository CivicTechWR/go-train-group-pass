'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Shield,
  Upload,
  DollarSign,
  Users,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { trpc } from '@/lib/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { PassUploadModal } from '@/components/steward/PassUploadModal';

export default function StewardPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Fetch user's steward groups using tRPC
  const stewardGroupsQuery = trpc.steward.getMyGroups.useQuery(undefined, {
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-6'>
        <div className='container max-w-4xl mx-auto px-4 py-6 space-y-6'>
          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <Card key={i} className='animate-pulse'>
                <CardHeader>
                  <div className='h-6 bg-muted rounded w-1/3'></div>
                </CardHeader>
                <CardContent>
                  <div className='h-4 bg-muted rounded w-2/3 mb-2'></div>
                  <div className='h-4 bg-muted rounded w-1/2'></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show auth required message if no user
  if (!user) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-6'>
        <div className='container max-w-4xl mx-auto px-4 py-6'>
          <div className='flex items-center gap-2 p-4 border border-orange-500/50 rounded-lg bg-orange-500/10'>
            <AlertCircle className='h-5 w-5 text-orange-600' />
            <p className='text-sm text-orange-700'>
              Please sign in to view your steward dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  const groups = stewardGroupsQuery.data || [];
  const selectedGroupData = groups.find(g => g.id === selectedGroup);

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-6'>
      <div className='container max-w-4xl mx-auto px-4 py-6 space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Shield className='h-6 w-6 text-primary' />
            <h1 className='text-3xl font-bold tracking-tight'>
              Steward Dashboard
            </h1>
          </div>
          <p className='text-muted-foreground'>
            Manage your group passes and payment collection
          </p>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm text-muted-foreground'>Active Groups</p>
                  <p className='text-2xl font-bold'>{groups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5 text-green-600' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Total Collected
                  </p>
                  <p className='text-2xl font-bold'>
                    $
                    {groups
                      .reduce(
                        (sum, group) => sum + (group.totalCollected || 0),
                        0
                      )
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-2'>
                <Clock className='h-5 w-5 text-orange-600' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Pending Payments
                  </p>
                  <p className='text-2xl font-bold'>
                    {groups.reduce(
                      (sum, group) => sum + (group.pendingPayments || 0),
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups List */}
        {stewardGroupsQuery.isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <Card key={i} className='animate-pulse'>
                <CardHeader>
                  <div className='h-6 bg-muted rounded w-1/3'></div>
                </CardHeader>
                <CardContent>
                  <div className='h-4 bg-muted rounded w-2/3 mb-2'></div>
                  <div className='h-4 bg-muted rounded w-1/2'></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stewardGroupsQuery.error ? (
          <div className='flex items-center gap-2 p-4 border border-destructive/50 rounded-lg bg-destructive/10'>
            <AlertCircle className='h-5 w-5 text-destructive' />
            <p className='text-sm text-destructive'>
              Failed to load steward groups: {stewardGroupsQuery.error.message}
            </p>
          </div>
        ) : groups.length === 0 ? (
          <Card>
            <CardContent className='p-8 text-center'>
              <Shield className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No Steward Groups</h3>
              <p className='text-muted-foreground mb-4'>
                You&apos;re not currently a steward for any groups. Join a trip
                and volunteer to steward!
              </p>
              <Button onClick={() => (window.location.href = '/today')}>
                View Available Trips
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold'>Your Groups</h2>
            {groups.map((group: any) => (
              <Card key={group.id} className='overflow-hidden'>
                <CardHeader className='pb-4'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-xl'>
                        Group {group.groupNumber}
                      </CardTitle>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <span>
                          {format(new Date(group.trip.date), 'MMM d, yyyy')}
                        </span>
                        <span>•</span>
                        <span>{group.trip.train.departure_time}</span>
                        <span>•</span>
                        <span>
                          {group.trip.train.origin} →{' '}
                          {group.trip.train.destination}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='flex items-center gap-1'
                      >
                        <Users className='h-3 w-3' />
                        {group.memberCount} members
                      </Badge>
                      <Badge
                        variant={group.passUploaded ? 'default' : 'secondary'}
                      >
                        {group.passUploaded ? 'Pass Uploaded' : 'Pass Pending'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Pass Upload Status */}
                  {!group.passUploaded ? (
                    <div className='p-4 border border-orange-500/50 rounded-lg bg-orange-500/10'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Upload className='h-4 w-4 text-orange-600' />
                        <span className='text-sm font-medium text-orange-700'>
                          Pass Upload Required
                        </span>
                      </div>
                      <p className='text-sm text-orange-600 mb-3'>
                        Upload your group pass screenshot to generate payment
                        requests for group members.
                      </p>
                      <Button
                        size='sm'
                        onClick={() => setSelectedGroup(group.id)}
                        className='bg-orange-600 hover:bg-orange-700'
                      >
                        Upload Pass
                      </Button>
                    </div>
                  ) : (
                    <div className='p-4 border border-green-500/50 rounded-lg bg-green-500/10'>
                      <div className='flex items-center gap-2 mb-2'>
                        <DollarSign className='h-4 w-4 text-green-600' />
                        <span className='text-sm font-medium text-green-700'>
                          Payment Collection Active
                        </span>
                      </div>
                      <p className='text-sm text-green-600'>
                        Pass uploaded successfully. Group members can now make
                        payments.
                      </p>
                    </div>
                  )}

                  {/* Payment Status */}
                  {group.passUploaded && (
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Payment Status</h4>
                      <div className='space-y-1'>
                        {group.members.map((member: any) => (
                          <div
                            key={member.id}
                            className='flex items-center justify-between text-sm'
                          >
                            <span>{member.displayName}</span>
                            <div className='flex items-center gap-2'>
                              <span className='text-muted-foreground'>
                                ${group.costPerPerson}
                              </span>
                              <Badge
                                variant={
                                  member.paymentSent ? 'default' : 'secondary'
                                }
                                className='text-xs'
                              >
                                {member.paymentSent ? 'Paid' : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pass Upload Modal */}
        {selectedGroupData && (
          <PassUploadModal
            groupId={selectedGroupData.id}
            groupNumber={selectedGroupData.groupNumber}
            memberCount={selectedGroupData.memberCount}
            costPerPerson={selectedGroupData.costPerPerson}
            onClose={() => setSelectedGroup(null)}
            onSuccess={() => {
              stewardGroupsQuery.refetch();
              setSelectedGroup(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

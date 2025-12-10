'use client';

import { Separator } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getItineraryTravelInfo } from '@/lib/api';
import type { ItineraryTravelInfo } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowRight, Mail, Phone, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ItineraryDetailsModalProps {
  itineraryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItineraryDetailsModal({
  itineraryId,
  open,
  onOpenChange,
}: ItineraryDetailsModalProps) {
  const [travelInfo, setTravelInfo] = useState<ItineraryTravelInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !itineraryId) {
      setTravelInfo(null);
      setError(null);
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getItineraryTravelInfo(itineraryId)
      .then(data => {
        if (!cancelled) {
          setTravelInfo(data);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load itinerary details'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, itineraryId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Itinerary Details</DialogTitle>
          <DialogDescription>
            View travel information, group members, and steward details
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='py-8 text-center'>
            <p className='text-muted-foreground'>
              Loading itinerary details...
            </p>
          </div>
        ) : error ? (
          <div className='py-8 text-center'>
            <p className='text-destructive mb-4'>{error}</p>
            <p className='text-sm text-muted-foreground'>
              Please try again later
            </p>
          </div>
        ) : travelInfo ? (
          <div className='space-y-6'>
            {/* Trip Details */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Trip Details</h3>
              <div className='space-y-4'>
                {travelInfo.tripDetails.map((trip, index) => (
                  <div
                    key={index}
                    className='p-4 border rounded-lg bg-muted/50'
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='text-xs font-semibold text-muted-foreground bg-background px-2 py-1 rounded'>
                        Trip {index + 1}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm mb-2'>
                      <span className='font-medium'>{trip.orgStation}</span>
                      <ArrowRight className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>{trip.destStation}</span>
                    </div>
                    <div className='text-xs text-muted-foreground pl-6'>
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
                ))}
              </div>
            </div>

            <Separator />

            {/* Group Status */}
            <div>
              <div className='flex items-center gap-2 mb-4'>
                <Users className='h-5 w-5' />
                <h3 className='text-lg font-semibold'>Travel Group</h3>
              </div>
              {travelInfo.groupsFormed ? (
                <div className='space-y-4'>
                  {/* Steward Info */}
                  {travelInfo.steward && (
                    <div className='p-4 border rounded-lg bg-primary/5'>
                      <div className='flex items-center gap-2 mb-3'>
                        <User className='h-4 w-4 text-primary' />
                        <span className='font-semibold text-sm text-primary'>
                          Steward
                        </span>
                      </div>
                      <div className='space-y-2 text-sm'>
                        <div className='font-medium'>
                          {travelInfo.steward.name}
                        </div>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <Mail className='h-3 w-3' />
                          <span>{travelInfo.steward.email}</span>
                        </div>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <Phone className='h-3 w-3' />
                          <span>{travelInfo.steward.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Members (only shown if user is steward) */}
                  {travelInfo.members && travelInfo.members.length > 0 && (
                    <div>
                      <h4 className='text-sm font-semibold mb-3'>
                        Group Members ({travelInfo.members.length})
                      </h4>
                      <div className='space-y-3'>
                        {travelInfo.members.map((member, index) => (
                          <div
                            key={index}
                            className='p-3 border rounded-lg bg-background'
                          >
                            <div className='space-y-2 text-sm'>
                              <div className='font-medium'>{member.name}</div>
                              <div className='flex items-center gap-2 text-muted-foreground'>
                                <Mail className='h-3 w-3' />
                                <span>{member.email}</span>
                              </div>
                              <div className='flex items-center gap-2 text-muted-foreground'>
                                <Phone className='h-3 w-3' />
                                <span>{member.phoneNumber}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!travelInfo.members && (
                    <p className='text-sm text-muted-foreground'>
                      You are traveling with a group. Contact the steward for
                      more information.
                    </p>
                  )}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No travel groups have been formed yet for this itinerary.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

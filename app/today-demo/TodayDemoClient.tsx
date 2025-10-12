'use client';

import { useState } from 'react';
import { TripCard } from '@/components/trips/TripCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, addDays } from 'date-fns';
import { TripWithDetails } from '@/types/database';

// Mock data for testing without Supabase
const mockTrips: TripWithDetails[] = [
  {
    id: '1',
    train_id: 'train-1',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'scheduled' as const,
    delay_minutes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    train: {
      id: 'train-1',
      departure_time: '06:38:00',
      origin: 'Kitchener GO',
      destination: 'Union Station',
      direction: 'outbound' as const,
      days_of_week: [1, 2, 3, 4, 5],
      created_at: new Date().toISOString(),
    },
    groups: [
      {
        id: 'group-1',
        trip_id: '1',
        group_number: 1,
        steward_id: 'user-2',
        pass_screenshot_url: null,
        pass_ticket_number: null,
        pass_ticket_number_hash: null,
        pass_activated_at: null,
        cost_per_person: 12.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        memberships: [
          {
            id: 'membership-1',
            group_id: 'group-1',
            user_id: 'user-1',
            coach_number: null,
            coach_level: null,
            payment_marked_sent_at: new Date().toISOString(),
            checked_in_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-1',
              display_name: 'Alice',
              email: 'alice@example.com',
              phone: '+1234567891',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 100,
              trips_completed: 2,
              on_time_payment_rate: 1,
              is_community_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: 'membership-2',
            group_id: 'group-1',
            user_id: 'user-2',
            coach_number: null,
            coach_level: null,
            payment_marked_sent_at: null,
            checked_in_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-2',
              display_name: 'Bob',
              email: 'bob@example.com',
              phone: '+1234567892',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 95,
              trips_completed: 1,
              on_time_payment_rate: 0.8,
              is_community_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        ],
      },
    ],
  },
  {
    id: '2',
    train_id: 'train-2',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    status: 'scheduled' as const,
    delay_minutes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    train: {
      id: 'train-2',
      departure_time: '07:08:00',
      origin: 'Kitchener GO',
      destination: 'Union Station',
      direction: 'outbound' as const,
      days_of_week: [1, 2, 3, 4, 5],
      created_at: new Date().toISOString(),
    },
    groups: [
      {
        id: 'group-2',
        trip_id: '2',
        group_number: 2,
        steward_id: 'user-3',
        pass_screenshot_url: null,
        pass_ticket_number: null,
        pass_ticket_number_hash: null,
        pass_activated_at: null,
        cost_per_person: 13,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        memberships: [
          {
            id: 'membership-3',
            group_id: 'group-2',
            user_id: 'user-3',
            coach_number: null,
            coach_level: null,
            payment_marked_sent_at: null,
            checked_in_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-3',
              display_name: 'Charlie',
              email: 'charlie@example.com',
              phone: '+1234567893',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 90,
              trips_completed: 3,
              on_time_payment_rate: 0.9,
              is_community_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: 'membership-4',
            group_id: 'group-2',
            user_id: 'user-4',
            coach_number: null,
            coach_level: null,
            payment_marked_sent_at: null,
            checked_in_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-4',
              display_name: 'Dana',
              email: 'dana@example.com',
              phone: '+1234567894',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 85,
              trips_completed: 4,
              on_time_payment_rate: 0.95,
              is_community_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: 'membership-5',
            group_id: 'group-2',
            user_id: 'user-5',
            coach_number: null,
            coach_level: null,
            payment_marked_sent_at: null,
            checked_in_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-5',
              display_name: 'Elliot',
              email: 'elliot@example.com',
              phone: '+1234567895',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 88,
              trips_completed: 1,
              on_time_payment_rate: 1,
              is_community_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        ],
      },
    ],
  },
];

export function TodayDemoClient() {
  const [trips] = useState<TripWithDetails[]>(mockTrips);
  const [currentUserId] = useState('user-1');
  const today = format(new Date(), 'EEEE, MMMM d');
  const tomorrowDate = addDays(new Date(), 1);
  const tomorrow = format(tomorrowDate, 'EEEE, MMMM d');
  const tomorrowDateISO = format(tomorrowDate, 'yyyy-MM-dd');

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20'>
      <div className='max-w-4xl mx-auto p-4 md:p-6'>
        <header className='mb-8'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-2'>
            🚆 GO Train Group Pass
          </h1>
          <p className='text-gray-600'>Demo Mode - Testing Week 2 Features</p>
        </header>

        <Tabs defaultValue='today' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='today'>
              <div className='flex flex-col items-start'>
                <span className='font-semibold'>Today</span>
                <span className='text-xs text-muted-foreground'>{today}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value='tomorrow'>
              <div className='flex flex-col items-start'>
                <span className='font-semibold'>Tomorrow</span>
                <span className='text-xs text-muted-foreground'>
                  {tomorrow}
                </span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='today' className='space-y-4'>
            {trips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                currentUserId={currentUserId}
              />
            ))}
          </TabsContent>

          <TabsContent value='tomorrow' className='space-y-4'>
            {trips
              .filter(trip => trip.date === tomorrowDateISO)
              .map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  currentUserId={currentUserId}
                />
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

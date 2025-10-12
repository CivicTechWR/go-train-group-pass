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
            id: 'mem-1',
            group_id: 'group-1',
            user_id: 'user-1',
            coach_number: null,
            coach_level: null,
            checked_in_at: null,
            payment_marked_sent_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-1',
              display_name: 'You',
              email: null,
              phone: '+1234567890',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 100,
              trips_completed: 0,
              on_time_payment_rate: 1.0,
              is_community_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: 'mem-2',
            group_id: 'group-1',
            user_id: 'user-2',
            coach_number: null,
            coach_level: null,
            checked_in_at: null,
            payment_marked_sent_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-2',
              display_name: '~BG',
              email: null,
              phone: '+1234567891',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 100,
              trips_completed: 0,
              on_time_payment_rate: 1.0,
              is_community_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: 'mem-3',
            group_id: 'group-1',
            user_id: 'user-3',
            coach_number: null,
            coach_level: null,
            checked_in_at: null,
            payment_marked_sent_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-3',
              display_name: '~Jari',
              email: null,
              phone: '+1234567892',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 100,
              trips_completed: 0,
              on_time_payment_rate: 1.0,
              is_community_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: 'mem-4',
            group_id: 'group-1',
            user_id: 'user-4',
            coach_number: null,
            coach_level: null,
            checked_in_at: null,
            payment_marked_sent_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-4',
              display_name: '~Mandeep',
              email: null,
              phone: '+1234567893',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 100,
              trips_completed: 0,
              on_time_payment_rate: 1.0,
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
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'scheduled' as const,
    delay_minutes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    train: {
      id: 'train-2',
      departure_time: '06:53:00',
      origin: 'Kitchener GO',
      destination: 'Union Station',
      direction: 'outbound' as const,
      days_of_week: [1, 2, 3, 4, 5],
      created_at: new Date().toISOString(),
    },
    groups: [],
  },
  {
    id: '3',
    train_id: 'train-3',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'scheduled' as const,
    delay_minutes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    train: {
      id: 'train-3',
      departure_time: '07:07:00',
      origin: 'Kitchener GO',
      destination: 'Union Station',
      direction: 'outbound' as const,
      days_of_week: [1, 2, 3, 4, 5],
      created_at: new Date().toISOString(),
    },
    groups: [
      {
        id: 'group-2',
        trip_id: '3',
        group_number: 1,
        steward_id: null,
        pass_screenshot_url: null,
        pass_ticket_number: null,
        pass_ticket_number_hash: null,
        pass_activated_at: null,
        cost_per_person: 13.33,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        memberships: [
          {
            id: 'mem-5',
            group_id: 'group-2',
            user_id: 'user-5',
            coach_number: null,
            coach_level: null,
            checked_in_at: null,
            payment_marked_sent_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-5',
              display_name: '~Simer',
              email: null,
              phone: '+1234567894',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 100,
              trips_completed: 0,
              on_time_payment_rate: 1.0,
              is_community_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: 'mem-6',
            group_id: 'group-2',
            user_id: 'user-6',
            coach_number: null,
            coach_level: null,
            checked_in_at: null,
            payment_marked_sent_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-6',
              display_name: '~Alex',
              email: null,
              phone: '+1234567895',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 100,
              trips_completed: 0,
              on_time_payment_rate: 1.0,
              is_community_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: 'mem-7',
            group_id: 'group-2',
            user_id: 'user-7',
            coach_number: null,
            coach_level: null,
            checked_in_at: null,
            payment_marked_sent_at: null,
            payment_reminder_sent_at: null,
            joined_at: new Date().toISOString(),
            user: {
              id: 'user-7',
              display_name: '~Sarah',
              email: null,
              phone: '+1234567896',
              profile_photo_url: null,
              fcm_token: null,
              reputation_score: 100,
              trips_completed: 0,
              on_time_payment_rate: 1.0,
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

export default function TodayDemoPage() {
  const [trips, setTrips] = useState<TripWithDetails[]>(mockTrips);
  const [currentUserId] = useState('user-1');
  const today = format(new Date(), 'EEEE, MMMM d');
  const tomorrow = format(addDays(new Date(), 1), 'EEEE, MMMM d');

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
            <div className='text-center py-12 text-gray-500'>
              <p className='text-lg'>Tomorrow&apos;s trips will appear here</p>
              <p className='text-sm mt-2'>Demo mode - no data yet</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className='mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <h3 className='font-semibold text-blue-900 mb-2'>🧪 Demo Mode</h3>
          <p className='text-sm text-blue-800'>
            This is a local demo with mock data. Try joining/leaving trains to
            see:
          </p>
          <ul className='text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside'>
            <li>Real-time countdown timers</li>
            <li>Group formation when you join</li>
            <li>Dynamic cost per person calculation</li>
            <li>Expandable group member lists</li>
          </ul>
          <p className='text-sm text-blue-800 mt-3'>
            <strong>To test with real Supabase:</strong> Set up credentials in{' '}
            <code>.env.local</code> and visit <code>/today</code>
          </p>
        </div>
      </div>
    </div>
  );
}

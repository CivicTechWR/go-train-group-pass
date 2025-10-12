# Implementation Examples

Full code examples for the GO Train Group Pass Coordination App. These are reference implementations - adapt as needed for your specific requirements.

---

## Table of Contents

1. [API Layer (tRPC)](#api-layer-trpc)
2. [Real-time Subscriptions](#real-time-subscriptions)
3. [Notification System](#notification-system)
4. [Background Jobs](#background-jobs)
5. [OCR Implementation](#ocr-implementation)
6. [PWA Configuration](#pwa-configuration)

---

## API Layer (tRPC)

### Router Setup

```typescript
// server/trpc.ts

import { initTRPC } from '@trpc/server';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { createClient } from '@supabase/supabase-js';

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure (requires auth)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return next({
    ctx: {
      ...ctx,
      session,
      supabase,
    },
  });
});
```

### Trips Router

```typescript
// server/routers/trips.ts

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { formGroups } from '@/lib/group-formation';

export const tripsRouter = router({
  // Get trips for date range
  list: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('trips')
        .select(
          `
          *,
          train:trains(*),
          groups(
            *,
            memberships:group_memberships(
              *,
              user:profiles(id, display_name, profile_photo_url)
            )
          )
        `
        )
        .gte('date', input.startDate)
        .lte('date', input.endDate)
        .order('date');

      if (error) throw error;
      return data;
    }),

  // Join a trip
  join: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if within allowed timeframe
      const { data: trip } = await ctx.supabase
        .from('trips')
        .select('*, train:trains(*)')
        .eq('id', input.tripId)
        .single();

      if (!trip) throw new Error('Trip not found');

      const departureTime = new Date(
        `${trip.date}T${trip.train.departure_time}`
      );
      const now = new Date();
      const minutesUntilDeparture =
        (departureTime.getTime() - now.getTime()) / 60000;

      if (minutesUntilDeparture < 30) {
        throw new Error('Cannot join less than 30 minutes before departure');
      }

      // Get all current members
      const { data: existingGroups } = await ctx.supabase
        .from('groups')
        .select('*, memberships:group_memberships(*)')
        .eq('trip_id', input.tripId);

      const allMembers =
        existingGroups?.flatMap(g =>
          g.memberships.map(m => ({ id: m.user_id, displayName: '' }))
        ) || [];

      // Add new user
      allMembers.push({ id: userId, displayName: '' });

      // Rebalance groups
      const newGroups = formGroups(allMembers);

      // Transaction: delete old groups, insert new
      await ctx.supabase.from('groups').delete().eq('trip_id', input.tripId);

      for (const group of newGroups) {
        const { data: newGroup } = await ctx.supabase
          .from('groups')
          .insert({
            trip_id: input.tripId,
            group_number: group.groupNumber,
            cost_per_person: group.costPerPerson,
          })
          .select()
          .single();

        if (newGroup) {
          await ctx.supabase.from('group_memberships').insert(
            group.members.map(m => ({
              group_id: newGroup.id,
              user_id: m.id,
            }))
          );
        }
      }

      return { success: true };
    }),

  // Leave a trip
  leave: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check timing (same as join)
      const { data: trip } = await ctx.supabase
        .from('trips')
        .select('*, train:trains(*)')
        .eq('id', input.tripId)
        .single();

      if (!trip) throw new Error('Trip not found');

      const departureTime = new Date(
        `${trip.date}T${trip.train.departure_time}`
      );
      const now = new Date();
      const minutesUntilDeparture =
        (departureTime.getTime() - now.getTime()) / 60000;

      if (minutesUntilDeparture < 30) {
        throw new Error('Cannot leave less than 30 minutes before departure');
      }

      // Get user's group
      const { data: membership } = await ctx.supabase
        .from('group_memberships')
        .select('group_id, group:groups!inner(trip_id)')
        .eq('user_id', userId)
        .eq('group.trip_id', input.tripId)
        .single();

      if (!membership) throw new Error('Not in this trip');

      // Remove user
      await ctx.supabase
        .from('group_memberships')
        .delete()
        .eq('user_id', userId)
        .eq('group_id', membership.group_id);

      // Rebalance remaining groups
      const { data: remainingGroups } = await ctx.supabase
        .from('groups')
        .select('*, memberships:group_memberships(*)')
        .eq('trip_id', input.tripId);

      const remainingMembers =
        remainingGroups?.flatMap(g =>
          g.memberships.map(m => ({ id: m.user_id, displayName: '' }))
        ) || [];

      if (remainingMembers.length > 0) {
        const newGroups = formGroups(remainingMembers);

        await ctx.supabase.from('groups').delete().eq('trip_id', input.tripId);

        for (const group of newGroups) {
          const { data: newGroup } = await ctx.supabase
            .from('groups')
            .insert({
              trip_id: input.tripId,
              group_number: group.groupNumber,
              cost_per_person: group.costPerPerson,
            })
            .select()
            .single();

          if (newGroup) {
            await ctx.supabase.from('group_memberships').insert(
              group.members.map(m => ({
                group_id: newGroup.id,
                user_id: m.id,
              }))
            );
          }
        }
      }

      return { success: true };
    }),
});
```

### Groups Router

```typescript
// server/routers/groups.ts

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import crypto from 'crypto';

export const groupsRouter = router({
  // Volunteer to steward
  volunteerSteward: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { error } = await ctx.supabase
        .from('groups')
        .update({ steward_id: userId })
        .eq('id', input.groupId)
        .is('steward_id', null); // Only if no steward yet

      if (error) throw error;
      return { success: true };
    }),

  // Upload pass screenshot
  uploadPass: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        ticketNumber: z.string(),
        passengerCount: z.number().min(2).max(5),
        activatedAt: z.string(),
        screenshotFile: z.string(), // base64
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user is steward
      const { data: group } = await ctx.supabase
        .from('groups')
        .select(
          'steward_id, cost_per_person, memberships:group_memberships(count)'
        )
        .eq('id', input.groupId)
        .single();

      if (group?.steward_id !== userId) {
        throw new Error('Only steward can upload pass');
      }

      // Verify passenger count matches group size
      const memberCount = group.memberships[0].count;
      if (input.passengerCount !== memberCount) {
        // Warning, but allow (steward might have bought wrong pass)
        console.warn(
          `Pass shows ${input.passengerCount} but group has ${memberCount} members`
        );
      }

      // Hash ticket number to prevent reuse
      const ticketHash = crypto
        .createHash('sha256')
        .update(input.ticketNumber)
        .digest('hex');

      // Check for duplicate
      const { data: existingPass } = await ctx.supabase
        .from('groups')
        .select('id')
        .eq('pass_ticket_number_hash', ticketHash)
        .neq('id', input.groupId)
        .single();

      if (existingPass) {
        throw new Error(
          'This ticket number has already been used by another group'
        );
      }

      // Upload screenshot to storage
      const buffer = Buffer.from(input.screenshotFile, 'base64');
      const filename = `${input.groupId}-${Date.now()}.png`;

      const { error: uploadError } = await ctx.supabase.storage
        .from('pass-screenshots')
        .upload(filename, buffer, {
          contentType: 'image/png',
        });

      if (uploadError) throw uploadError;

      // Update group
      const { error } = await ctx.supabase
        .from('groups')
        .update({
          pass_screenshot_url: filename,
          pass_ticket_number: input.ticketNumber,
          pass_ticket_number_hash: ticketHash,
          pass_activated_at: input.activatedAt,
        })
        .eq('id', input.groupId);

      if (error) throw error;

      return { success: true };
    }),

  // Update coach location
  updateLocation: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        coachNumber: z.string(),
        coachLevel: z.enum(['upper', 'lower', 'middle']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { error } = await ctx.supabase
        .from('group_memberships')
        .update({
          coach_number: input.coachNumber,
          coach_level: input.coachLevel,
          checked_in_at: new Date().toISOString(),
        })
        .eq('group_id', input.groupId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    }),

  // Mark payment as sent
  markPaymentSent: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { error } = await ctx.supabase
        .from('group_memberships')
        .update({
          payment_marked_sent_at: new Date().toISOString(),
        })
        .eq('group_id', input.groupId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    }),
});
```

### Alerts Router

```typescript
// server/routers/alerts.ts

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const alertsRouter = router({
  // Trigger fare inspection alert
  trigger: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Rate limit check: max 1 alert per user per trip
      const { data: existingAlerts } = await ctx.supabase
        .from('fare_inspection_alerts')
        .select('count')
        .eq('group_id', input.groupId)
        .eq('triggered_by_user_id', userId);

      if (existingAlerts && existingAlerts[0].count > 0) {
        throw new Error('You have already triggered an alert for this trip');
      }

      // Create alert
      const { data: alert, error } = await ctx.supabase
        .from('fare_inspection_alerts')
        .insert({
          group_id: input.groupId,
          triggered_by_user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Get group members and triggerer's location
      const { data: memberships } = await ctx.supabase
        .from('group_memberships')
        .select('*, user:profiles(*)')
        .eq('group_id', input.groupId);

      const triggerer = memberships?.find(m => m.user_id === userId);
      const meetLocation = triggerer?.coach_number
        ? `${triggerer.coach_number} ${triggerer.coach_level}`
        : 'steward location';

      // Send notifications (call separate API route)
      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/fare-inspection`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertId: alert.id,
            groupId: input.groupId,
            meetLocation,
            members: memberships?.filter(m => m.user_id !== userId),
          }),
        }
      );

      return { success: true, alertId: alert.id };
    }),

  // Acknowledge alert
  acknowledge: protectedProcedure
    .input(
      z.object({
        alertId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { error } = await ctx.supabase
        .from('alert_acknowledgments')
        .insert({
          alert_id: input.alertId,
          user_id: userId,
        });

      if (error) throw error;
      return { success: true };
    }),
});
```

---

## Real-time Subscriptions

### Hook for Group Updates

```typescript
// hooks/useGroupUpdates.ts

import { useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useQueryClient } from '@tanstack/react-query';

export function useGroupUpdates(tripId: string) {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          // Invalidate and refetch trips query
          queryClient.invalidateQueries(['trips']);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_memberships',
        },
        () => {
          queryClient.invalidateQueries(['trips']);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, supabase, queryClient]);
}
```

### Hook for Fare Inspection Alerts

```typescript
// hooks/useFareInspectionAlerts.ts

import { useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useFareInspectionAlerts() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('fare-inspection-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fare_inspection_alerts',
        },
        async payload => {
          // Check if user is in this group
          const { data: membership } = await supabase
            .from('group_memberships')
            .select('group_id')
            .eq('group_id', payload.new.group_id)
            .eq('user_id', user.id)
            .single();

          if (membership && payload.new.triggered_by_user_id !== user.id) {
            // Play alarm sound
            const audio = new Audio('/sounds/alarm.mp3');
            audio.play();

            // Show toast
            toast.error('🚨 FARE INSPECTION', {
              description: 'Meet your group NOW',
              duration: 60000, // 1 minute
              action: {
                label: "I'm Ready",
                onClick: () => {
                  // Acknowledge alert
                  supabase.from('alert_acknowledgments').insert({
                    alert_id: payload.new.id,
                    user_id: user.id,
                  });
                },
              },
            });

            // Navigate to group page
            router.push(`/groups/${payload.new.group_id}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, router]);
}
```

---

## Notification System

### FCM Push Notifications

```typescript
// lib/firebase-admin.ts

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const messaging = admin.messaging();
```

```typescript
// app/api/notifications/fare-inspection/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { messaging } from '@/lib/firebase-admin';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: NextRequest) {
  const { alertId, groupId, meetLocation, members } = await req.json();

  const notifications = members.map(async (member: any) => {
    // Try push first
    if (member.user.fcm_token) {
      try {
        await messaging.send({
          token: member.user.fcm_token,
          notification: {
            title: '🚨 FARE INSPECTION',
            body: `Meet at ${meetLocation} NOW`,
          },
          data: {
            type: 'FARE_INSPECTION',
            alertId,
            groupId,
            meetLocation,
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'fare_inspection',
              priority: 'max',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                contentAvailable: true,
                'interruption-level': 'critical',
              },
            },
          },
        });

        return { userId: member.user_id, method: 'push', success: true };
      } catch (error) {
        console.error('Push failed, falling back to SMS:', error);

        // Fallback to SMS
        try {
          await twilioClient.messages.create({
            body: `🚨 FARE INSPECTION on your GO train. Meet at ${meetLocation} NOW.`,
            to: member.user.phone,
            from: process.env.TWILIO_PHONE_NUMBER,
          });

          return { userId: member.user_id, method: 'sms', success: true };
        } catch (smsError) {
          console.error('SMS also failed:', smsError);
          return { userId: member.user_id, method: 'none', success: false };
        }
      }
    } else {
      // No FCM token, send SMS directly
      try {
        await twilioClient.messages.create({
          body: `🚨 FARE INSPECTION on your GO train. Meet at ${meetLocation} NOW.`,
          to: member.user.phone,
          from: process.env.TWILIO_PHONE_NUMBER,
        });

        return { userId: member.user_id, method: 'sms', success: true };
      } catch (error) {
        console.error('SMS failed:', error);
        return { userId: member.user_id, method: 'none', success: false };
      }
    }
  });

  const results = await Promise.all(notifications);

  return NextResponse.json({ success: true, results });
}
```

### Payment Reminder Notifications

```typescript
// app/api/notifications/payment-reminder/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { messaging } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const { userId, fcmToken, stewardName, amount, groupNumber } =
    await req.json();

  try {
    await messaging.send({
      token: fcmToken,
      notification: {
        title: 'Payment Reminder',
        body: `Please pay ${stewardName} $${amount} for Group ${groupNumber}`,
      },
      data: {
        type: 'PAYMENT_REMINDER',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment reminder failed:', error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
```

---

## Background Jobs

### Setup

```typescript
// inngest/client.ts

import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'go-train-pass',
  name: 'GO Train Pass App',
});
```

### Schedule Sync Job

```typescript
// inngest/functions/sync-schedules.ts

import { inngest } from '../client';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const syncSchedules = inngest.createFunction(
  { id: 'sync-go-schedules', name: 'Sync GO Transit Schedules' },
  { cron: '0 3 * * *' }, // 3 AM daily
  async ({ step }) => {
    await step.run('download-gtfs', async () => {
      // Download GTFS static feed
      const response = await fetch('https://www.gotransit.com/static/gtfs.zip');
      // In production: unzip, parse trips.txt and stop_times.txt
      // For MVP: manually seed Kitchener-Union trains
      return { downloaded: true };
    });

    await step.run('parse-and-update', async () => {
      // For MVP: hardcode KW→Union and Union→KW trains
      const trains = [
        // Morning KW → Union
        {
          departure_time: '06:38:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        {
          departure_time: '07:08:00',
          origin: 'Kitchener GO',
          destination: 'Union Station',
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        // Evening Union → KW
        {
          departure_time: '15:34:00',
          origin: 'Union Station',
          destination: 'Kitchener GO',
          direction: 'inbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        {
          departure_time: '16:22:00',
          origin: 'Union Station',
          destination: 'Kitchener GO',
          direction: 'inbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
        {
          departure_time: '16:52:00',
          origin: 'Union Station',
          destination: 'Kitchener GO',
          direction: 'inbound',
          days_of_week: [1, 2, 3, 4, 5],
        },
      ];

      for (const train of trains) {
        await supabase.from('trains').upsert(train, {
          onConflict: 'departure_time,origin,destination',
        });
      }

      return { updated: trains.length };
    });

    await step.run('create-trips-for-week', async () => {
      // Create trip instances for next 7 days
      const today = new Date();
      const trips = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // 1=Mon, 7=Sun

        // Only weekdays
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          const { data: trains } = await supabase
            .from('trains')
            .select('*')
            .contains('days_of_week', [dayOfWeek]);

          for (const train of trains || []) {
            trips.push({
              train_id: train.id,
              date: date.toISOString().split('T')[0],
              status: 'scheduled',
            });
          }
        }
      }

      await supabase.from('trips').upsert(trips, {
        onConflict: 'train_id,date',
      });

      return { trips: trips.length };
    });
  }
);
```

### Delay Check Job

```typescript
// inngest/functions/check-delays.ts

import { inngest } from '../client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const checkDelays = inngest.createFunction(
  { id: 'check-train-delays', name: 'Check Train Delays' },
  { cron: '*/5 6-19 * * 1-5' }, // Every 5 min, 6 AM-7 PM, Mon-Fri
  async ({ step }) => {
    await step.run('fetch-realtime-data', async () => {
      // In production: fetch GTFS Realtime feed
      // For MVP: mock implementation
      const today = new Date().toISOString().split('T')[0];

      const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .eq('date', today)
        .eq('status', 'scheduled');

      // Check GO Transit API for delays (requires API integration)
      // For now, return unchanged

      return { checked: trips?.length || 0 };
    });

    await step.run('notify-delays', async () => {
      // If any trips changed to 'delayed' or 'cancelled', notify affected users
      const { data: delayedTrips } = await supabase
        .from('trips')
        .select(
          `
          *,
          groups(
            *,
            memberships:group_memberships(
              *,
              user:profiles(*)
            )
          )
        `
        )
        .in('status', ['delayed', 'cancelled'])
        .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Changed in last 5 min

      // Send push notifications to all affected users
      // (Implementation similar to fare inspection alerts)

      return { notified: delayedTrips?.length || 0 };
    });
  }
);
```

### Daily Commitment Reminder

```typescript
// inngest/functions/daily-reminder.ts

import { inngest } from '../client';
import { messaging } from '@/lib/firebase-admin';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dailyCommitmentReminder = inngest.createFunction(
  { id: 'daily-commitment-reminder', name: 'Daily Commitment Reminder' },
  { cron: '0 18 * * 1-5' }, // 6 PM, Mon-Fri
  async ({ step }) => {
    await step.run('send-notifications', async () => {
      // Get all active users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, fcm_token')
        .not('fcm_token', 'is', null);

      const notifications =
        profiles?.map(profile =>
          messaging.send({
            token: profile.fcm_token!,
            notification: {
              title: "Tomorrow's Trains",
              body: 'Plan your commute - join a group now',
            },
            data: {
              type: 'DAILY_REMINDER',
            },
          })
        ) || [];

      await Promise.allSettled(notifications);

      return { sent: notifications.length };
    });
  }
);
```

### Cleanup Old Screenshots

```typescript
// inngest/functions/cleanup-screenshots.ts

import { inngest } from '../client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const cleanupScreenshots = inngest.createFunction(
  { id: 'cleanup-pass-screenshots', name: 'Cleanup Old Pass Screenshots' },
  { cron: '0 4 * * *' }, // 4 AM daily
  async ({ step }) => {
    await step.run('delete-old-screenshots', async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const { data: oldGroups } = await supabase
        .from('groups')
        .select('id, pass_screenshot_url')
        .lt('pass_activated_at', twoDaysAgo.toISOString())
        .not('pass_screenshot_url', 'is', null);

      // Delete from storage
      const filesToDelete =
        oldGroups?.map(g => g.pass_screenshot_url).filter(Boolean) || [];

      if (filesToDelete.length > 0) {
        await supabase.storage.from('pass-screenshots').remove(filesToDelete);
      }

      // Clear URLs from database
      await supabase
        .from('groups')
        .update({ pass_screenshot_url: null })
        .in('id', oldGroups?.map(g => g.id) || []);

      return { deleted: filesToDelete.length };
    });
  }
);
```

---

## OCR Implementation

### Core OCR Function

```typescript
// lib/ocr.ts

import Tesseract from 'tesseract.js';

export interface PassDetails {
  ticketNumber: string | null;
  passengerCount: number | null;
  activationTime: string | null;
  confidence: number;
}

export async function extractPassDetails(
  imageFile: File
): Promise<PassDetails> {
  try {
    const {
      data: { text, confidence },
    } = await Tesseract.recognize(imageFile, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    console.log('OCR Text:', text);

    // Extract ticket number (format: MZ12345678 or similar)
    const ticketMatch = text.match(/[A-Z]{2}\d{8,10}/);
    const ticketNumber = ticketMatch ? ticketMatch[0] : null;

    // Extract passenger count (format: x4, x5, etc.)
    const passengerMatch =
      text.match(/x\s*(\d)/i) || text.match(/Passenger.*?(\d)/i);
    const passengerCount = passengerMatch ? parseInt(passengerMatch[1]) : null;

    // Extract activation time (various formats)
    const timeMatch =
      text.match(/(\d{1,2}:\d{2}:\d{2}\s*[AP]M)/i) ||
      text.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
    const activationTime = timeMatch ? timeMatch[0] : null;

    return {
      ticketNumber,
      passengerCount,
      activationTime,
      confidence: confidence / 100,
    };
  } catch (error) {
    console.error('OCR failed:', error);
    return {
      ticketNumber: null,
      passengerCount: null,
      activationTime: null,
      confidence: 0,
    };
  }
}
```

### Upload Component

```typescript
// components/PassUploadModal.tsx

'use client';

import { useState } from 'react';
import { extractPassDetails } from '@/lib/ocr';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PassUploadModalProps {
  groupId: string;
  groupSize: number;
  onSuccess: () => void;
}

export function PassUploadModal({ groupId, groupSize, onSuccess }: PassUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState<any>(null);
  const [manualEntry, setManualEntry] = useState(false);

  const uploadMutation = trpc.groups.uploadPass.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const details = await extractPassDetails(selectedFile);

      if (details.confidence < 0.6) {
        toast.warning('Could not read pass clearly. Please verify details.');
      }

      // Validate passenger count
      if (details.passengerCount && details.passengerCount !== groupSize) {
        toast.warning(
          `Pass shows x${details.passengerCount} but group has ${groupSize} members. Please verify.`
        );
      }

      setExtractedDetails(details);
    } catch (error) {
      console.error('OCR failed:', error);
      toast.error('Could not read pass details. Please enter manually.');
      setManualEntry(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      try {
        await uploadMutation.mutateAsync({
          groupId,
          ticketNumber: extractedDetails.ticketNumber,
          passengerCount: extractedDetails.passengerCount || groupSize,
          activatedAt: new Date().toISOString(),
          screenshotFile: base64.split(',')[1], // Remove data:image/png;base64,
        });

        toast.success('Pass uploaded successfully!');
        onSuccess();
      } catch (error: any) {
        toast.error(error.message || 'Upload failed');
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pass-file">Upload Pass Screenshot</Label>
        <Input
          id="pass-file"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
      </div>

      {isProcessing && (
        <div className="text-sm text-muted-foreground">
          Reading pass details...
        </div>
      )}

      {extractedDetails && !manualEntry && (
        <div className="space-y-2 rounded-lg border p-4">
          <h3 className="font-medium">Extracted Details</h3>
          <div className="text-sm">
            <div>Ticket: {extractedDetails.ticketNumber || 'Not found'}</div>
            <div>Passengers: x{extractedDetails.passengerCount || 'Not found'}</div>
            <div>Time: {extractedDetails.activationTime || 'Not found'}</div>
            <div className="text-muted-foreground">
              Confidence: {Math.round(extractedDetails.confidence * 100)}%
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setManualEntry(true)}
          >
            Edit Manually
          </Button>
        </div>
      )}

      {manualEntry && (
        <div className="space-y-2">
          <div>
            <Label htmlFor="ticket-number">Ticket Number</Label>
            <Input
              id="ticket-number"
              placeholder="MZ65106974"
              value={extractedDetails?.ticketNumber || ''}
              onChange={(e) => setExtractedDetails({
                ...extractedDetails,
                ticketNumber: e.target.value,
              })}
            />
          </div>

          <div>
            <Label htmlFor="passenger-count">Passenger Count</Label>
            <Input
              id="passenger-count"
              type="number"
              min={2}
              max={5}
              value={extractedDetails?.passengerCount || groupSize}
              onChange={(e) => setExtractedDetails({
                ...extractedDetails,
                passengerCount: parseInt(e.target.value),
              })}
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!file || isProcessing || !extractedDetails?.ticketNumber}
        className="w-full"
      >
        Upload Pass
      </Button>
    </div>
  );
}
```

---

## PWA Configuration

### Next.js Config

```javascript
// next.config.js

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ['*.supabase.co'],
  },
});
```

### Manifest

```json
// public/manifest.json

{
  "name": "GO Train Group Pass",
  "short_name": "GO Pass",
  "description": "Coordinate GO Train group passes with ease",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#00853F",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-1.png",
      "sizes": "1170x2532",
      "type": "image/png"
    }
  ],
  "categories": ["travel", "utilities"],
  "shortcuts": [
    {
      "name": "Join Today's Train",
      "url": "/today",
      "description": "Quickly join today's train groups"
    }
  ]
}
```

### Service Worker

```typescript
// app/sw.ts

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Network-first for API calls
registerRoute(
  ({ url }) => url.origin === process.env.NEXT_PUBLIC_SUPABASE_URL,
  new NetworkFirst({
    cacheName: 'api-cache',
  })
);

// Cache-first for images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
  })
);

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data?.json();

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

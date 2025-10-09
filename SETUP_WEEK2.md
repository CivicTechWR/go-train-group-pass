# Week 2 MVP Setup Guide

This guide will help you set up and test the Week 2 MVP features for the GO Train Group Pass app.

## Prerequisites

1. Supabase project is set up
2. Environment variables are configured in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Database Setup

### 1. Run Migrations

Run both migration files in your Supabase SQL Editor:

```bash
# From Supabase dashboard > SQL Editor
# Run in order:
1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_rebalance_groups_function.sql
```

Or if you have Supabase CLI installed:

```bash
supabase migration up
```

### 2. Seed Data

After migrations are complete, seed the train schedules and trip instances:

**Option A: Via API Route (Recommended)**

1. Start the development server:
```bash
npm run dev
```

2. Call the seed endpoint:
```bash
curl -X POST http://localhost:3000/api/seed
```

You should see a response like:
```json
{
  "success": true,
  "message": "Seeded 5 trains and created 10 trip instances",
  "data": {
    "trains": 5,
    "trips": 10
  }
}
```

**Option B: Manually via Supabase Dashboard**

Insert trains directly in Supabase > Table Editor > trains table:
- 6:38 AM KW → Union
- 6:53 AM KW → Union
- 7:07 AM KW → Union
- 7:22 AM KW → Union
- 7:38 AM KW → Union

Then manually create trip instances in the trips table for today and tomorrow.

### 3. Create Test User Profile

Since authentication is mocked in Week 2, you need to manually create a test profile:

1. Go to Supabase > Authentication > Users
2. Create a new user (email/password)
3. Copy the user UUID
4. Go to Table Editor > profiles
5. Insert a new row:
   - `id`: [paste user UUID]
   - `phone`: "+15555551234"
   - `email`: "test@example.com"
   - `display_name`: "Test User"

6. Update `/app/today/page.tsx` line 49 to use your user UUID:
```typescript
const currentUserId = 'YOUR_USER_UUID_HERE';
```

## Testing the Features

### 1. View Trips

Navigate to: `http://localhost:3000/today`

You should see:
- Tabs for "Today" and "Tomorrow"
- List of 5 morning trains (6:38 AM - 7:38 AM)
- Each train shows departure time, route, and countdown timer
- "Join Train" button on each trip

### 2. Join a Trip

1. Click "Join Train" on any trip
2. You should see:
   - Success toast notification
   - Button changes to "Leave Train"
   - Badge showing "You're in Group 1"
   - Click the expand arrow to see group details

### 3. Test Group Formation

Open multiple browser windows (or use incognito) to simulate multiple users:

1. Create additional test profiles in Supabase
2. Update `currentUserId` to different user IDs in each window
3. Join the same trip from different windows
4. Watch groups form and rebalance in real-time

Expected behavior:
- 1 user → Group 1 (1 person, $16.32 solo)
- 2 users → Group 1 (2 people, $15.00/person)
- 3 users → Group 1 (3 people, $13.33/person)
- 4 users → Group 1 (4 people, $12.50/person)
- 5 users → Group 1 (5 people, $12.00/person)
- 6 users → Group 1 (3 people) + Group 2 (3 people)
- 11 users → Group 1 (4 people) + Group 2 (4 people) + Group 3 (3 people)

### 4. Test Real-time Updates

1. Open two browser windows side-by-side
2. Join/leave trips in one window
3. Watch the other window update automatically (within 1-2 seconds)
4. Check for "Live updates active" indicator with green wifi icon

### 5. Test Leave Functionality

1. Click "Leave Train" on a trip you've joined
2. Verify:
   - Success toast appears
   - Button changes back to "Join Train"
   - Badge is removed
   - Groups rebalance if needed

### 6. Test 30-Minute Cutoff

The system prevents joining/leaving within 30 minutes of departure. To test:

1. Wait until 30 minutes before a train's departure time
2. Try to join/leave
3. Should see error toast: "Cannot join less than 30 minutes before departure"

### 7. Test Navigation

- Bottom navigation (mobile): Click "Today", "Profile", "Steward" tabs
- Desktop sidebar: Same navigation on the left side
- Profile and Steward pages show placeholder text (coming in Week 3)

### 8. Test Responsive Design

1. Open browser DevTools
2. Toggle device emulation (mobile/tablet/desktop)
3. Verify:
   - Mobile: Bottom tab navigation, full-width cards
   - Desktop: Left sidebar navigation, centered content, max-width container

## Troubleshooting

### Trips not loading

- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Check Supabase logs for query errors
- Ensure migrations ran successfully

### Real-time updates not working

- Check browser console for WebSocket errors
- Verify Realtime is enabled in Supabase project settings
- Check that `supabase_realtime` publication includes the correct tables
- Try refreshing the page

### Join/Leave not working

- Check that user profile exists in database
- Verify RLS policies are set up correctly
- Check browser console for tRPC errors
- Ensure `rebalance_trip_groups` function exists

### Group formation incorrect

- Check `lib/group-formation.ts` logic
- Verify cost calculations match CLAUDE.md spec
- Test with different user counts (1, 2, 3, 4, 5, 6, 11, 12, etc.)

## Next Steps (Week 3)

- Implement steward volunteer system
- Add pass upload functionality
- Build payment tracking
- Create steward dashboard

## Architecture Overview

**Frontend:**
- `/app/today/page.tsx` - Main trips page
- `/components/trips/TripCard.tsx` - Individual trip display
- `/components/groups/GroupCard.tsx` - Group details
- `/hooks/useGroupUpdates.ts` - Realtime subscriptions

**Backend:**
- `/server/routers/trips.ts` - tRPC endpoints (list, join, leave)
- `/lib/group-formation.ts` - Group balancing algorithm
- `/app/api/seed/route.ts` - Seed data endpoint

**Database:**
- `trains` - Static schedule
- `trips` - Daily instances
- `groups` - Formed groups per trip
- `group_memberships` - User assignments
- `rebalance_trip_groups()` - Atomic rebalancing function

## Key Files Created

- `types/database.ts` - TypeScript definitions
- `app/today/page.tsx` - Main trips page
- `app/profile/page.tsx` - Profile placeholder
- `app/steward/page.tsx` - Steward placeholder
- `components/trips/TripCard.tsx` - Trip card component
- `components/trips/CountdownTimer.tsx` - Countdown timer
- `components/trips/TripCardSkeleton.tsx` - Loading skeleton
- `components/groups/GroupCard.tsx` - Group card component
- `components/navigation/BottomNav.tsx` - Navigation component
- `hooks/useGroupUpdates.ts` - Realtime hook
- `app/api/seed/route.ts` - Seed data endpoint
- `supabase/migrations/002_rebalance_groups_function.sql` - Rebalance function

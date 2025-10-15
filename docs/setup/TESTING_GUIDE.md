# 🧪 Testing Guide - Week 2 MVP

## Quick Start (3 Options)

### Option 1: Demo Mode (No Database Required) ⚡ FASTEST

1. Visit: **http://localhost:3000/today-demo**
2. Click "Join" buttons to test UI
3. All data is local, no Supabase needed

### Option 2: Full Setup with Supabase (Recommended)

Follow steps below for complete database setup and real-time testing.

### Option 3: Use PostgreSQL MCP

If you have the PostgreSQL MCP configured, skip manual SQL and use MCP tools.

---

## Full Setup Instructions

### Step 1: Run Database Migrations

Go to your Supabase dashboard: https://supabase.com/dashboard/project/gwljtlrlbiygermawabm/editor

**Run Migration 001 (Initial Schema):**

1. Click "SQL Editor" → "+ New query"
2. Copy/paste contents from `supabase/migrations/001_initial_schema.sql`
3. Click "Run"
4. Verify: Should see "Success. No rows returned"

**Run Migration 002 (Rebalance Function):**

1. Create another new query
2. Copy/paste contents from `supabase/migrations/002_rebalance_groups_function.sql`
3. Click "Run"
4. Verify: Should see "Success"

### Step 2: Seed Train Data

**Option A: Via API Endpoint**

```bash
curl -X POST http://localhost:3000/api/seed
```

**Option B: Via SQL (Manual)**

```sql
-- Insert 5 morning trains KW → Union
INSERT INTO trains (departure_time, origin, destination, direction, days_of_week) VALUES
('06:38:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
('06:53:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
('07:07:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
('07:22:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
('07:38:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]);

-- Create trip instances for today and tomorrow
INSERT INTO trips (train_id, date, status)
SELECT id, CURRENT_DATE, 'scheduled' FROM trains
UNION ALL
SELECT id, CURRENT_DATE + INTERVAL '1 day', 'scheduled' FROM trains;
```

### Step 3: Create Test User Profile

Run this SQL in Supabase SQL Editor:

```sql
-- Create a test user in profiles table
-- NOTE: This bypasses auth for testing purposes
INSERT INTO profiles (id, phone, email, display_name, profile_photo_url)
VALUES (
  gen_random_uuid(), -- This will be your test user ID
  '+15555551234',
  'test@example.com',
  'Test User',
  NULL
)
RETURNING id; -- Copy this ID!
```

**IMPORTANT:** Copy the returned UUID!

### Step 4: Update App with Test User ID

Edit `app/today/page.tsx` line 52:

```typescript
// Replace with your test user ID from Step 3
const currentUserId = 'PASTE_YOUR_UUID_HERE';
```

### Step 5: Test the App

1. Visit: **http://localhost:3000/today**
2. You should see today's trains
3. Click "Join Train" on any trip
4. Watch the group form in real-time!
5. Click "Leave Train" to remove yourself

---

## What to Test

### ✅ Core Features

- [ ] **Trip List Display**
  - Shows today/tomorrow tabs
  - Displays 5 morning trains
  - Shows departure times correctly

- [ ] **Countdown Timers**
  - Updates every second
  - Shows "Departs in Xh Ym" format
  - Shows "Departs soon" when <5 min

- [ ] **Join/Leave Functionality**
  - Click "Join" adds you to a group
  - Group number and member count appear
  - Cost per person calculated correctly
  - Click "Leave" removes you from group

- [ ] **Group Display**
  - Groups show member names
  - Cost per person displayed
  - Steward indicator (if assigned)
  - Expand/collapse works

- [ ] **Real-time Updates** (Multi-tab test)
  - Open two browser tabs
  - Join a trip in tab 1
  - Tab 2 should update automatically!
  - Leave in tab 1, tab 2 updates again

### 🎯 Expected Behavior

**Group Formation Rules:**

- 1 person → Solo ($16.32/person)
- 2-5 people → One group
- 6+ people → Multiple groups (balanced)

**Cost Calculations:**

- 2 people → $15.00/person
- 3 people → $13.33/person
- 4 people → $12.50/person
- 5 people → $12.00/person

### ⚠️ Error Cases to Test

- Try joining within the cutoff window (default <10 min) before departure (should fail)
- Try joining same trip twice (should fail)
- Try leaving a trip you're not in (should fail)

---

## Troubleshooting

### "No trips showing"

- Check: Did you run `/api/seed` or manual SQL?
- Verify: In Supabase dashboard, run `SELECT * FROM trips;`

### "Can't join train"

- Check: Is `currentUserId` set in `app/today/page.tsx`?
- Verify: User exists in `profiles` table
- Check console for errors

### "Groups not rebalancing"

- Verify migration 002 was run successfully
- Check function exists: `SELECT * FROM pg_proc WHERE proname = 'rebalance_trip_groups';`

### "Real-time not working"

- Check Supabase Realtime is enabled (Settings → API → Realtime)
- Verify publications: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`
- Check browser console for WebSocket errors

---

## Demo vs Production

| Feature    | Demo Mode     | Full Supabase |
| ---------- | ------------- | ------------- |
| URL        | `/today-demo` | `/today`      |
| Database   | Local state   | Real Supabase |
| Real-time  | ❌ No         | ✅ Yes        |
| Multi-user | ❌ No         | ✅ Yes        |
| Persistent | ❌ No         | ✅ Yes        |

---

## Next Steps After Testing

Once basic features work:

1. **Enable Real Authentication**
   - Replace mock user with Supabase Auth
   - Implement phone verification (Week 3)

2. **Add Steward Features**
   - Volunteer system
   - Pass upload (Week 3)

3. **Deploy to Production**
   - Push to Vercel
   - Test with real users

---

## Support

- **Build errors?** Run `npm run build` to see details
- **TypeScript errors?** Check `app/today/page.tsx:52` for user ID type
- **Supabase issues?** Verify credentials in `.env.local`

Happy testing! 🚆

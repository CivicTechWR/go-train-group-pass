# GO Train Group Pass - Setup Guide

## Week 1 Setup Complete! ✅

We've successfully bootstrapped the foundational infrastructure:

### What's Done:
- ✅ Next.js 15 with TypeScript and Tailwind CSS
- ✅ tRPC 11 for type-safe API layer
- ✅ Supabase client setup (SSR + browser)
- ✅ shadcn/ui configuration
- ✅ Group formation algorithm
- ✅ Authentication scaffolding (email/password)
- ✅ Basic routing structure

---

## Next Steps: Supabase Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name: `go-train-pass`
3. Set a strong database password (save it!)
4. Choose a region closest to your users
5. Wait for the project to be provisioned (~2 minutes)

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (`SUPABASE_SERVICE_ROLE_KEY`) - ⚠️ Keep this secret!

### 3. Create Environment Variables

Create a `.env.local` file in the project root:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Run Database Migrations

Go to your Supabase dashboard → **SQL Editor** → **New Query**, and run this schema:

```sql
-- Users (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  email text not null,
  display_name text not null,
  profile_photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trains (static schedule)
create table trains (
  id uuid primary key default gen_random_uuid(),
  departure_time time not null,
  origin text not null,
  destination text not null,
  direction text not null check (direction in ('outbound', 'inbound')),
  days_of_week integer[] not null,
  created_at timestamptz default now()
);

-- Trips (train instance on specific date)
create table trips (
  id uuid primary key default gen_random_uuid(),
  train_id uuid references trains not null,
  date date not null,
  status text default 'scheduled' check (status in ('scheduled', 'delayed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(train_id, date)
);

-- Groups (formed from commitments)
create table groups (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  group_number integer not null,
  steward_id uuid references profiles,
  cost_per_person decimal(5,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Group memberships
create table group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups on delete cascade not null,
  user_id uuid references profiles not null,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Indexes
create index idx_trips_date on trips(date);
create index idx_groups_trip on groups(trip_id);
create index idx_memberships_group on group_memberships(group_id);
create index idx_memberships_user on group_memberships(user_id);

-- Row Level Security
alter table profiles enable row level security;
alter table trips enable row level security;
alter table groups enable row level security;
alter table group_memberships enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Trips are viewable by everyone"
  on trips for select using (true);

create policy "Groups are viewable by everyone"
  on groups for select using (true);

create policy "Stewards can update their groups"
  on groups for update using (auth.uid() = steward_id);

create policy "Group memberships viewable by all"
  on group_memberships for select using (true);

create policy "Users can join groups"
  on group_memberships for insert with check (auth.uid() = user_id);

create policy "Users can leave groups"
  on group_memberships for delete using (auth.uid() = user_id);

create policy "Users can update own membership"
  on group_memberships for update using (auth.uid() = user_id);

-- Realtime subscriptions
alter publication supabase_realtime add table groups;
alter publication supabase_realtime add table group_memberships;

-- Function to auto-create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 5. Seed Sample Data

Run this query to add sample trains:

```sql
INSERT INTO trains (departure_time, origin, destination, direction, days_of_week) VALUES
('06:38:00', 'Kitchener GO', 'Union Station', 'outbound', '{1,2,3,4,5}'),
('07:08:00', 'Kitchener GO', 'Union Station', 'outbound', '{1,2,3,4,5}'),
('15:34:00', 'Union Station', 'Kitchener GO', 'inbound', '{1,2,3,4,5}'),
('16:22:00', 'Union Station', 'Kitchener GO', 'inbound', '{1,2,3,4,5}'),
('16:52:00', 'Union Station', 'Kitchener GO', 'inbound', '{1,2,3,4,5}');

-- Create trips for today and tomorrow
INSERT INTO trips (train_id, date, status)
SELECT
  t.id,
  CURRENT_DATE + i,
  'scheduled'
FROM trains t
CROSS JOIN generate_series(0, 1) i
WHERE EXTRACT(DOW FROM CURRENT_DATE + i) BETWEEN 1 AND 5;
```

### 6. Enable Realtime

1. Go to **Database > Replication**
2. Enable replication for:
   - `groups`
   - `group_memberships`

### 7. Start the Development Server

```bash
npm run dev
```

Visit http://localhost:3000 - you should see the login page!

---

## Testing the App

1. **Sign up**: Create an account with email/password
2. **Check database**: Go to Supabase → **Table Editor** → `profiles` to see your new profile
3. **Ready for Week 2**: Next, we'll build the trip list UI and join/leave functionality!

---

## Architecture Overview

```
app/
├── (auth)/
│   └── login/          # Authentication pages
├── api/
│   └── trpc/          # tRPC API endpoint
├── auth/
│   └── callback/      # OAuth callback handler
└── layout.tsx         # Root layout with providers

server/
├── trpc.ts            # tRPC initialization + context
└── routers/
    ├── _app.ts        # Main router
    └── trips.ts       # Trips CRUD + group formation

lib/
├── group-formation.ts # Group balancing algorithm
├── supabase/          # Supabase clients (server + browser)
├── trpc/              # tRPC client + provider
└── utils.ts           # Utility functions (cn, etc.)

components/
└── auth/
    └── LoginForm.tsx  # Email/password login form
```

---

## Troubleshooting

### "Invalid API key"
- Double-check your `.env.local` file
- Restart the dev server (`npm run dev`)

### Database connection errors
- Verify your Supabase project is active
- Check the Project URL is correct (no trailing slash)

### Authentication not working
- Make sure the `handle_new_user()` function and trigger were created
- Check Supabase logs: **Logs > Auth Logs**

---

## Next: Week 2 Todos

- [ ] Build trip list UI (today + tomorrow trains)
- [ ] Add join/leave trip buttons
- [ ] Show real-time group formation
- [ ] Display group members and costs
- [ ] Add countdown timer to departure

Ready to continue? Let's build the core user experience! 🚀

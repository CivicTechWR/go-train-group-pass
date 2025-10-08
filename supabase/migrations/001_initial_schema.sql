-- GO Train Group Pass Coordination App - Initial Schema
-- Migration: 001_initial_schema
-- Created: 2025-10-08

-- Users (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  phone text unique not null,
  email text not null,
  display_name text not null,
  profile_photo_url text,
  fcm_token text, -- Firebase Cloud Messaging token
  reputation_score integer default 100,
  trips_completed integer default 0,
  on_time_payment_rate decimal(3,2) default 1.00,
  is_community_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trains (static schedule)
create table trains (
  id uuid primary key default gen_random_uuid(),
  departure_time time not null,
  origin text not null, -- "Kitchener GO"
  destination text not null, -- "Union Station"
  direction text not null check (direction in ('outbound', 'inbound')),
  days_of_week integer[] not null, -- [1,2,3,4,5] = Mon-Fri
  created_at timestamptz default now()
);

-- Trips (train instance on specific date)
create table trips (
  id uuid primary key default gen_random_uuid(),
  train_id uuid references trains not null,
  date date not null,
  status text default 'scheduled' check (status in ('scheduled', 'delayed', 'cancelled')),
  delay_minutes integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(train_id, date)
);

-- Groups (formed from commitments)
create table groups (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  group_number integer not null, -- 1, 2, 3 for display
  steward_id uuid references profiles,
  pass_screenshot_url text,
  pass_ticket_number text,
  pass_ticket_number_hash text, -- SHA-256 hash to prevent reuse
  pass_activated_at timestamptz,
  cost_per_person decimal(5,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Group memberships
create table group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups on delete cascade not null,
  user_id uuid references profiles not null,
  coach_number text,
  coach_level text check (coach_level in ('upper', 'lower', 'middle')),
  checked_in_at timestamptz,
  payment_marked_sent_at timestamptz,
  payment_reminder_sent_at timestamptz,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Fare inspection alerts
create table fare_inspection_alerts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups not null,
  triggered_by_user_id uuid references profiles not null,
  triggered_at timestamptz default now()
);

-- Alert acknowledgments
create table alert_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references fare_inspection_alerts on delete cascade not null,
  user_id uuid references profiles not null,
  acknowledged_at timestamptz default now(),
  unique(alert_id, user_id)
);

-- Indexes for performance
create index idx_trips_date on trips(date);
create index idx_trips_train_date on trips(train_id, date);
create index idx_groups_trip on groups(trip_id);
create index idx_memberships_group on group_memberships(group_id);
create index idx_memberships_user on group_memberships(user_id);
create index idx_alerts_group on fare_inspection_alerts(group_id);

-- Row Level Security
alter table profiles enable row level security;
alter table trips enable row level security;
alter table groups enable row level security;
alter table group_memberships enable row level security;
alter table fare_inspection_alerts enable row level security;
alter table alert_acknowledgments enable row level security;

-- Policies (users can read all public data, write only their own)
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
alter publication supabase_realtime add table fare_inspection_alerts;
alter publication supabase_realtime add table alert_acknowledgments;

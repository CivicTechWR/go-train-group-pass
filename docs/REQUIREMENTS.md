# GO Train Group Pass Coordination App — Requirements

Version: 0.1 (compiled from current repo)
Scope: MVP features and near‑term enhancements identified in code and docs

References:
- Project overview and flows: README.md:1
- Data schema: supabase/migrations/001_initial_schema.sql:1
- Group rebalancing: supabase/migrations/002_group_rebalancing_transaction.sql:1
- Grouping algorithm: lib/group-formation.ts:1
- tRPC trips router: server/routers/trips.ts:1
- Today view/UI: app/today/page.tsx:1, components/trips/TripCard.tsx:1, components/groups/GroupCard.tsx:1
- Realtime hook: hooks/useGroupUpdates.ts:1

## 1) Overview

A web app to coordinate weekday GO Train group passes between Kitchener and Union Station. Replaces WhatsApp polls with instant join/leave, automatic group formation, steward workflow for pass purchase and payment tracking, coach location check‑ins, and urgent fare inspection alerts with push/SMS.

## 2) Goals and Non‑Goals

- Goals
  - Reduce steward effort and coordination time
  - Provide immediate group assignment and live updates
  - Track payment status without handling funds directly
  - Deliver urgent alerts reliably within seconds

- Non‑Goals (MVP)
  - In‑app payments or PCI‑scoped processing
  - Complex chat; only essential notifications and statuses
  - Native apps (PWA only for MVP)

## 3) Users and Roles

- Commuter: joins/leaves trips, views group details, reports coach location, receives alerts, marks payment sent
- Steward (per group): volunteers to steward, buys pass, uploads/enters pass details, requests payment, monitors collection
- Admin (future): moderation, dispute tools, analytics (post‑MVP)

## 4) Assumptions

- Focus on direct train routes (no bus transfers) Kitchener → Union (outbound) initially
- Users authenticate via Supabase Auth; profiles exist for active users
- Realtime uses Supabase Realtime channels; push via FCM; SMS fallback via Twilio (future integration)

## 5) Functional Requirements

5.1 Authentication & Profile
- Users can sign up/sign in/out using Supabase Auth
- A `profiles` record exists for each user (created/ensured on protected API use)
- Profile includes display name, optional photo, and optional FCM token

5.2 Train Schedules & Trips
- Show “Today” and “Tomorrow” trips with departure times and origins/destinations
- Only show non‑departed, direct train trips to Union (filter logic mirrors server/routers/trips.ts)
- Seed/creation endpoints exist for development/testing

5.3 Join/Leave Trips
- Users can join an available trip until cutoff minutes before departure (default 10; configurable via `JOIN_LEAVE_CUTOFF_MINUTES`)
- Users can leave a joined trip until cutoff minutes before departure (default 10; configurable via `JOIN_LEAVE_CUTOFF_MINUTES`)
- Users cannot join the same trip twice (guarded by memberships check)
- Joining/leaving triggers group rebalancing atomically

5.4 Group Formation & Rebalancing
- Target groups of 4–5 (prefer minimal cost variance); distribute evenly: examples 11 → [4,4,3], 14 → [5,5,4]
- Preserve existing steward assignments when rebalancing
- Compute `cost_per_person` by group size (2=$15, 3≈$13.33, 4=$12.50, 5=$12)
- Apply in a single transaction via `rebalance_trip_groups(UUID, JSONB)` to avoid race conditions

5.5 Group View & Member List
- Display group number, member list with current user highlight
- Show steward badge and cost per person
- Show number of groups and total riders per trip; show countdown to departure

5.6 Steward Workflow (MVP basics)
- Volunteer as steward for a group with no steward
- Upload pass screenshot (OCR planned) or manually enter pass details
- Store SHA‑256 hash of ticket number; refuse reuse across groups
- Generate payment request details (copy‑paste) and track “marked as sent” by members

5.7 Coach Location Reporting
- Within 30 minutes of departure, allow “I’m Boarding” → set coach number and level (upper/lower/middle)
- Display group location summary; indicate split coaches

5.8 Fare Inspection Alerts
- Any member can trigger one alert per trip; confirm before sending
- Broadcast urgent push notification; show in‑app takeover; SMS fallback if push fails (future)
- Allow members to acknowledge; steward can view acknowledgment state

5.9 Daily Commitment Reminder
- Send weekday 6 PM push notification reminding users to commit for tomorrow’s trains (background job)

5.10 PWA
- Installable PWA with basic offline caching: NetworkFirst for API, CacheFirst for images; push handlers in service worker

## 6) Non‑Functional Requirements

- Performance
  - Join/leave end‑to‑end < 500 ms average; UI reflects updates < 2s
  - Handle 100+ concurrent users joining/leaving a popular trip
- Availability & Reliability
  - Fare inspection alert delivery < 10 seconds, ≥ 99.9% success with push; SMS fallback for misses (future)
  - Atomic group rebalancing to prevent inconsistent memberships
- Security & Privacy
  - Supabase Row Level Security (RLS) enforced per table
  - Pass screenshots deleted ≤ 48 hours post‑activation; only store ticket hash long‑term
  - Coach numbers visible only to group members
  - No banking info stored; payment is manual (e‑Transfer)
- Accessibility
  - WCAG‑aligned color/contrast; keyboard‑navigable actions; screen‑reader labels for critical buttons
- Observability
  - Basic error logging; enable Sentry and Vercel Analytics for production

## 7) Data Model (Supabase)

- profiles(id PK, phone, email, display_name, photo_url, fcm_token, reputation_score, on_time_payment_rate, trips_completed, is_community_admin, timestamps)
- trains(id PK, departure_time, origin, destination, direction, days_of_week)
- trips(id PK, train_id FK→trains, date, status, delay_minutes, timestamps, unique(train_id,date))
- groups(id PK, trip_id FK→trips, group_number, steward_id FK→profiles, pass fields, cost_per_person, timestamps)
- group_memberships(id PK, group_id FK→groups ON DELETE CASCADE, user_id FK→profiles, coach_number, coach_level, checked_in_at, payment_* timestamps, joined_at, unique(group_id,user_id))
- fare_inspection_alerts(id PK, group_id FK→groups, triggered_by_user_id FK→profiles, triggered_at)
- alert_acknowledgments(id PK, alert_id FK→fare_inspection_alerts ON DELETE CASCADE, user_id FK→profiles, acknowledged_at, unique(alert_id,user_id))
- Indexing for performance on date fields and FKs (see migration)
- RLS policies: public read where appropriate; users write only their own records; stewards update their groups

## 8) API Surface (tRPC + REST where used)

Implemented tRPC (server/routers/trips.ts:1)
- trips.list({ startDate, endDate }) → TripWithDetails[]
  - Filters: direct outbound trains to Union; excludes departed; sorted by departure
- trips.myTrips({ startDate, endDate }) → TripWithDetails[] for current user
  - Filters: same as list; only trips where the user is a member
- trips.join({ tripId }) → { success: true }
  - Validates direct train and cutoff window; rejects duplicate membership; rebalances via RPC
- trips.leave({ tripId }) → { success: true }
  - Validates direct train and cutoff window; rebalances or removes groups if empty

Planned/outlined in docs
- groups.volunteerSteward({ groupId })
- groups.uploadPass({ groupId, ticketNumber, passengerCount, activatedAt, screenshotFile })
- groups.updateLocation({ groupId, coachNumber, coachLevel })
- groups.markPaymentSent({ groupId })
- alerts.trigger({ groupId })
- alerts.acknowledge({ alertId })

REST development helpers
- app/api/validate-db/route.ts: checks schema and rebalance function
- app/api/smoke-test/route.ts: end‑to‑end smoke checks
- CREATE_JOINABLE_TRIPS.sql and CREATE_REAL_GO_TRIPS.sql: seeding helpers

## 9) UI Views (App Router)

- Home/Marketing: overview and CTA to Today
- Login: auth UI
- Today: tabs for Today/Tomorrow; user trips and available trips; join/leave; expandable groups; realtime status (app/today/page.tsx:1)
- Group Card: member list, current user highlight, steward badge, cost per person (components/groups/GroupCard.tsx:1)
- Trip Card: departure time, origin→destination, countdown, riders/groups stats (components/trips/TripCard.tsx:1)
- Policy pages: privacy/terms; FAQ

## 10) Realtime & Notifications

- Realtime updates: subscribe to `groups` and `group_memberships` changes per trip set; invalidate queries on events (hooks/useGroupUpdates.ts:1)
- Push notifications: FCM; PWA service worker handlers planned; SMS fallback via Twilio for urgent alerts (future)

## 11) Environment & Configuration

Required (MVP)
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server‑side setup/seed and RPC where needed)

Optional (has defaults)
- JOIN_LEAVE_CUTOFF_MINUTES (default 10)

Planned/Optional
- Firebase FCM credentials (push)
- Twilio credentials (SMS fallback)
- Inngest keys (cron/background jobs)
- Sentry DSN (monitoring)

## 12) Deployment & Operations

- Hosting: Vercel (Next.js App Router)
- Database: Supabase (enable Realtime on required tables)
- Storage: Supabase bucket `pass-screenshots` (public read, auth write; periodic cleanup job)
- Migrations: apply schema and rebalance function (atomic rebalancing)
- CI/CD: GitHub Actions or Gitea; pre‑commit checks (lint/build/tests) recommended

## 13) Testing & Acceptance Criteria

Unit
- Grouping algorithm edge cases (0/1 users; 2–5 single group; 6+ distributions; steward preservation)
- Cost calculation correctness per group size

Integration
- tRPC join/leave behavior with cutoff and filters
- Supabase RLS policy coverage
- Realtime channel updates cause UI refresh

E2E (Playwright)
- Join/leave flow updates groups and costs live
- Steward flow: volunteer → upload/enter pass → mark payments → visibility to members
- Fare inspection: trigger → push/toast takeover → acknowledgments recorded

Acceptance (MVP)
- User can sign in, view Today/Tomorrow, join a trip > cutoff window (default 10 min) before departure, be placed in a group with computed cost; leave successfully with rebalancing

## 14) Success Metrics (Targets)

- Adoption: 50+ active users in month 1; 20+ groups/day
- Efficiency: steward coordination < 5 minutes; payment collection > 95% within 1 hour
- Reliability: alert delivery < 10 seconds with ≥ 99.9% success; zero duplicate ticket incidents

## 15) Risks & Mitigations

- Realtime instability → polling fallback, connection health indicators
- OCR accuracy → manual entry fallback; steward confirmation step; screenshot retention ≤ 48h
- Push delivery gaps → SMS fallback (future); retries; multi‑channel notifications
- Grouping bugs → strong unit tests; admin override (future)

## 16) Out of Scope (MVP)

- In‑app money movement, bank integrations, PCI scope
- Multi‑corridor support beyond Kitchener ↔ Union
- Full chat system; advanced social features

## 17) Open Questions

- Admins: initial admin list and capabilities?
- Beta rollout: staged cohort vs full community?
- Branding: product name confirmation and visual identity?
- Support: channel (email/Discord/in‑app) and SLAs?
- Backup steward: flow if steward becomes unavailable after purchase?


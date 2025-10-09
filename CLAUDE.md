# CLAUDE.md - GO Train Group Pass Coordination App

> **Note**: Full implementation examples available in `docs/IMPLEMENTATION_EXAMPLES.md`
> Database schema in `supabase/migrations/001_initial_schema.sql`

## Project Overview

A modern web application that replaces WhatsApp-based coordination for GO Train weekday group passes between Kitchener and Union Station. The app automates group formation, payment tracking, and real-time alerts for fare inspections.

-----

## Recommended MCP Servers

When working on this project, configure these MCP servers in `.claude/mcp.json`:

### Essential MCP Servers

1. **Git MCP** (`@gitmcp/server`)
   - **Use for:** Version control operations, commit history, branch management
   - **Why:** Essential for tracking changes and collaborating on the codebase

2. **Supabase MCP** (`@designcomputer/supabase_mcp_server`)
   - **Use for:** Database queries, auth management, storage operations
   - **Why:** Direct access to Supabase without writing SQL, manages migrations
   - **Requires:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` environment variables

3. **PostgreSQL MCP** (`@modelcontextprotocol/server-postgres`)
   - **Use for:** Advanced database queries, performance optimization, direct SQL access
   - **Why:** Fine-grained control over database operations
   - **Requires:** `POSTGRES_CONNECTION_STRING` environment variable

4. **Filesystem MCP** (`@modelcontextprotocol/server-filesystem`)
   - **Use for:** Fast file operations, search, and directory management
   - **Why:** Efficient file system navigation
   - **Config:** Allowed directories: `/opt/go-train-group`, `/tmp`

### Optional but Recommended

5. **Sequential Thinking MCP** (`@modelcontextprotocol/server-sequential-thinking`)
   - **Use for:** Complex problem solving, algorithm design (especially group formation logic)
   - **Why:** Helps break down complex tasks into manageable steps

6. **Memory MCP** (`@modelcontextprotocol/server-memory`)
   - **Use for:** Maintaining context across sessions, storing decisions and patterns
   - **Why:** Remembers architectural decisions and coding patterns

7. **Fetch MCP** (`@modelcontextprotocol/server-fetch`)
   - **Use for:** Testing API endpoints, fetching GO Transit GTFS feeds
   - **Why:** Essential for external API integration

8. **Brave Search MCP** (`@modelcontextprotocol/server-brave-search`)
   - **Use for:** Researching Next.js 15 patterns, Supabase best practices, tRPC documentation
   - **Why:** Up-to-date documentation for modern frameworks
   - **Requires:** `BRAVE_API_KEY` environment variable

### Configuration File

See `.claude/mcp.json` for the complete configuration. All required environment variables are documented in `.env.example` and `MCP_SETUP.md`.

-----

## Recommended Claude Code Agents

This project has two custom agents configured for specialized tasks:

### 1. GO Train Fullstack Agent (`@go-train-fullstack`)

**Use for:**
- Building new features end-to-end (UI → API → Database)
- Implementing tRPC routers and endpoints
- Creating Next.js pages and components
- Integrating Supabase auth and storage

**Invoke with:**
```
@go-train-fullstack implement the steward volunteer system with database integration
```

**Capabilities:**
- Deep knowledge of project architecture (Next.js 15, tRPC, Supabase, Zustand)
- Understands group formation algorithm and business logic
- Follows project patterns (tRPC router structure, component organization)
- Can write both frontend and backend code

**Best for:**
- Week 2-4 MVP features (core functionality)
- Payment tracking system
- User profile management
- Steward dashboard

### 2. GO Train Realtime Agent (`@go-train-realtime`)

**Use for:**
- Implementing Supabase Realtime subscriptions
- Building fare inspection alert system
- Creating live group update hooks
- WebSocket connection management

**Invoke with:**
```
@go-train-realtime implement real-time group updates when members join/leave
```

**Capabilities:**
- Specialist in Supabase Realtime and WebSocket patterns
- Optimistic UI updates
- Connection recovery and offline handling
- Push notification integration with FCM

**Best for:**
- Week 4 real-time features
- Fare inspection alerts
- Live payment tracking
- Group rebalancing notifications

### General-Purpose Agents

Also available from `@VoltAgent/awesome-claude-code-subagents` (see `AGENTS_GUIDE.md`):
- `@debug-doctor` - Troubleshooting build errors, runtime issues
- `@test-writer` - Creating unit/integration tests
- `@code-reviewer` - Pre-commit code review
- `@docs-writer` - Generating documentation

### Usage Pattern

1. **Starting a new feature:** Use `@go-train-fullstack` for end-to-end implementation
2. **Adding real-time functionality:** Switch to `@go-train-realtime` for WebSocket subscriptions
3. **Debugging issues:** Use `@debug-doctor` to diagnose and fix problems
4. **Before committing:** Run `@code-reviewer` to catch issues early

See `AGENTS_GUIDE.md` for detailed usage examples and workflows.

-----

## Development Practices

### Tactical Agent & MCP Usage

**CRITICAL: Use agents and MCP servers proactively for ALL development tasks.**

**Agent Usage Rules:**
1. **ALWAYS use agents for specialized tasks** - Don't do it yourself if an agent can
2. **Use multiple agents in parallel** - Delegate different aspects of a feature simultaneously
3. **Agent-first mindset** - Before writing code, determine which agent(s) should handle it

**When to Use Which Agent:**
- **@fullstack-developer** - Any feature touching UI + API + Database
- **@go-train-fullstack** - Project-specific features (group formation, payment, trips)
- **@go-train-realtime** - Real-time subscriptions, WebSocket, notifications
- **@go-train-algorithm-specialist** - Group formation logic, cost optimization
- **@go-train-payment-tracker** - Payment workflows, e-Transfer tracking
- **@api-designer** - New tRPC endpoints, API contract design
- **@database-administrator** - Schema changes, migrations, query optimization
- **@code-reviewer** - Pre-commit code review (MANDATORY before every commit)
- **@test-automator** - Writing unit/integration/E2E tests
- **@qa-expert** - Test strategy, quality planning
- **@debugger** - Troubleshooting bugs, diagnosis
- **@devops-engineer** - CI/CD, deployment, infrastructure
- **@platform-engineer** - Infrastructure code, scaling, monitoring

**MCP Usage Rules:**
1. **Use Supabase MCP** for all database queries instead of raw SQL
2. **Use PostgreSQL MCP** for complex queries, performance analysis
3. **Use Memory MCP** to store architectural decisions, patterns learned
4. **Use Fetch MCP** to test API endpoints, fetch external data
5. **Use Sequential Thinking MCP** for complex algorithm design

**Example Tactical Workflow:**
```
Task: Implement user authentication

Step 1: Use @sequential-thinking MCP to plan approach
Step 2: Use @database-administrator to design auth schema
Step 3: Use @fullstack-developer to implement auth flow
Step 4: Use @test-automator to write test suite
Step 5: Use @code-reviewer before commit
```

### Code Quality Standards

**IMPORTANT: Perform regular and extensive code reviews before every commit.**

**Pre-commit Requirements:**
- **MANDATORY:** Run `@code-reviewer` agent for automated review
- Execute `npm run build` (must pass)
- Test functionality in browser (`npm run dev`)
- Verify no console errors/warnings
- Check responsive design (mobile + desktop)
- Review security (XSS, SQL injection, data exposure)
- Ensure proper error handling and user feedback
- Verify accessibility (keyboard navigation, screen readers)
- No `any` types, console.log statements, or commented code blocks
- TypeScript strict mode compliance

### Version Control & Issue Tracking

**CRITICAL: Commit code changes regularly to Gitea repository**

**Commit Frequency:**
- After completing each feature or bug fix
- Minimum: end of each work session
- Create atomic commits (one logical change per commit)

**Commit Message Format:**
```
<type>: <short summary> (50 chars or less)

<optional detailed description>

- Key change 1
- Key change 2

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Commit Types:** `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`

**Issue Tracking:**
- Create Gitea issues for all bugs, features, tasks
- Link commits: `Fixes #123` or `Relates to #123`
- Update status: In Progress → Review → Closed
- Use labels: `bug`, `feature`, `enhancement`, `documentation`, `urgent`

**Branching:**
- `main` - production-ready
- `develop` - integration branch
- `feature/*`, `fix/*`, `hotfix/*`

**Before Pushing:**
- Run full pre-commit checklist
- Verify no sensitive data in code
- Review `git diff`
- Pull latest: `git pull origin main`
- Resolve conflicts

-----

## Tech Stack

### Frontend

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **State Management:** Zustand 4.x
- **Real-time:** Supabase Realtime (WebSocket subscriptions)
- **Forms:** React Hook Form 7.x + Zod 3.x
- **Notifications:** Firebase Cloud Messaging (FCM)
- **PWA:** next-pwa for installability
- **Image Upload:** react-dropzone + sharp
- **Date/Time:** date-fns 3.x

### Backend

- **Database:** Supabase (Postgres 15+)
- **API:** tRPC 10.x (type-safe API layer)
- **Auth:** Supabase Auth + Twilio Verify
- **Storage:** Supabase Storage
- **Background Jobs:** Inngest 3.x
- **OCR:** Tesseract.js 5.x
- **SMS:** Twilio Programmable SMS

### Infrastructure

- **Hosting:** Vercel (edge functions, ISR)
- **Database:** Supabase Cloud
- **CDN:** Vercel Edge Network
- **Monitoring:** Sentry + Vercel Analytics
- **CI/CD:** GitHub Actions

### External APIs

- **GO Transit:** GTFS Static + GTFS Realtime feeds
- **Payments:** Manual (copy-paste Interac e-Transfer)

-----

## Core User Flows

### Flow 1: Committing to a Train (Replaces WhatsApp Poll)

**Current State:** Someone posts WhatsApp poll, people vote, groups fill unevenly (5/5/2 instead of 4/4/4)

**New Flow:**

1. User opens app → sees today + tomorrow trains
1. Taps "Join 6:38 AM KW→Union"
1. Instant feedback: "You're in Group 3 (4 people). Steward: ~BG"
1. Real-time updates as others join (groups auto-rebalance)
1. Countdown timer: "Departs in 2h 15m"

**Key UX:**

- No waiting for poll to close
- See your group assignment immediately
- Steward clearly identified (or "Volunteer to steward" button)
- One-tap unjoin (with 30-min cutoff before departure)

-----

### Flow 2: Steward Workflow

**Current State:** Steward volunteers, buys pass, screenshots, manually creates 4 e-Transfers (copy-paste email, amount, memo 4 times)

**New Flow:**

1. Steward taps "Buy Pass" → opens Presto app
1. Returns to our app → "Upload Pass Screenshot"
1. OCR extracts: ticket number, x4 count, activation timestamp
1. Steward confirms details (or edits if OCR wrong)
1. App generates payment requests with copy-paste fields
1. Steward either:
- Taps "Copy All" → bulk paste into bank app
- OR taps each person's [Copy] to send individual e-Transfers

**Payment Tracking:**

- Group members see: "Pay ~BG $12.50" with tap-to-copy email
- They send e-Transfer → tap "Mark as Sent"
- Steward sees green checkmarks appear in real-time
- If unpaid after 30 min → steward taps "Send Reminder" (push notification)

**Pass Validation:**

- If OCR shows x4 but group has 5 people → warning: "Pass mismatch. Verify you bought correct pass."
- Store ticket number hash → prevent screenshot reuse across groups

-----

### Flow 3: Coach Number Reporting

**Current State:** People type "2429 upper" in chaotic WhatsApp thread, messages get buried

**New Flow:**

1. "I'm Boarding" button appears 30 min before departure
1. User taps → dropdown: coach number (suggests recent coaches like 2429, 4241)
1. Select level: Upper / Lower / Middle
1. Confirmation: "You're in 2429 Upper"
1. Group location board updates in real-time

**Group Location View:**
Shows all members with status:

- ✓ ~Jari: 2429 Upper
- ✓ ~BG: 2429 Upper
- ✓ ~Mandeep: 2429 Middle
- ⚠ ~Simer: Not checked in

If split across coaches: "⚠ Group split: 3 in coach 2429, 1 in coach 2430"

-----

### Flow 4: Fare Inspection Alert

**Current State:** Steward types "FARE INSPECTION" in chat, people are asleep/not checking phone

**New Flow:**

1. Any group member sees inspector → taps floating red "ALERT" button
1. Confirmation modal: "Send alert to 4 people?"
1. On confirm:
- **Push notification:** "🚨 FARE INSPECTION - Meet at 2429 Upper NOW"
- **SMS fallback** (if push fails within 10 sec)
- **In-app takeover:** full-screen red banner with alarm sound
1. Members tap "I'm Ready" (steward sees who acknowledged)
1. 2-min timeout → assume unresponsive members will meet at steward's location

**Abuse Prevention:**

- Rate limit: 1 alert per person per trip
- Logged for admin review (if pattern of false alarms)

-----

### Flow 5: Daily Commitment Reminder

**Current State:** Someone remembers to post tomorrow's poll

**New Flow:**

- Automated push notification at 6 PM every weekday: "Tomorrow's trains are open"
- Users open app → commit to tomorrow's trains
- No manual intervention needed

-----

## Data Model

### Database Schema

**Tables:** `profiles`, `trains`, `trips`, `groups`, `group_memberships`, `fare_inspection_alerts`, `alert_acknowledgments`

**Key Relationships:**
- `trains` → `trips` (1:many, by date)
- `trips` → `groups` (1:many)
- `groups` → `group_memberships` (1:many)
- `profiles` ↔ `group_memberships` (many:many through groups)

**Row Level Security:** Users can read all public data, write only their own records

**Realtime:** Enabled for `groups`, `group_memberships`, `fare_inspection_alerts`, `alert_acknowledgments`

See `supabase/migrations/001_initial_schema.sql` for full schema with indexes and RLS policies.

-----

## Group Formation Algorithm

**Goal:** Balance groups to minimize cost variance, prefer groups of 4-5 people

**Pass Costs:**

- 5 people: $60 total = $12.00 per person
- 4 people: $50 total = $12.50 per person
- 3 people: $40 total = $13.33 per person
- 2 people: $30 total = $15.00 per person

**Algorithm Pattern:**

```typescript
// lib/group-formation.ts
export function formGroups(users: User[]): Group[] {
  // Logic: Distribute evenly to minimize cost variance
  // Examples: 6 → [3,3], 11 → [4,4,3], 12 → [4,4,4], 14 → [5,5,4]
  const numGroups = Math.ceil(count / 5);
  const baseSize = Math.floor(count / numGroups);
  const remainder = count % numGroups;
  // Distribute remainder across first N groups to balance sizes
}
```

**Edge Cases:**
- 0 users: return empty array
- 1 user: solo rider (individual ticket $16.32)
- 2-5 users: single group
- 6+ users: distribute evenly across multiple groups

Full implementation in `lib/group-formation.ts`

-----

## API Layer (tRPC)

### Router Structure

**Base Setup** (`server/trpc.ts`):
- `publicProcedure` - unauthenticated access
- `protectedProcedure` - requires Supabase session, provides `ctx.session` and `ctx.supabase`

### Trips Router

**Endpoints** (`server/routers/trips.ts`):
- `list` - Get trips with nested groups/memberships for date range
- `join` - Add user to trip, rebalance groups (30-min cutoff validation)
- `leave` - Remove user from trip, rebalance remaining groups

**Key Patterns:**
- Timeframe validation: 30-min cutoff before departure
- Group rebalancing: delete old groups, recalculate with `formGroups()`, insert new
- Transaction-like operations: delete then insert in sequence

### Groups Router

**Endpoints** (`server/routers/groups.ts`):
- `volunteerSteward` - Set steward_id (only if null)
- `uploadPass` - Verify steward, validate passenger count, hash ticket number, upload to storage
- `updateLocation` - Update coach number/level with check-in timestamp
- `markPaymentSent` - Update payment timestamp

**Key Patterns:**
- SHA-256 hash ticket numbers to prevent reuse
- Steward-only mutations (verify `ctx.session.user.id === steward_id`)
- Storage operations: base64 → Buffer → Supabase Storage

### Alerts Router

**Endpoints** (`server/routers/alerts.ts`):
- `trigger` - Create alert, fetch members, call notification API route
- `acknowledge` - Insert acknowledgment record

**Key Patterns:**
- Rate limiting: check existing alerts count before insert
- Call separate API route for notifications (avoid tRPC timeout on slow SMS)

Full implementation examples in `docs/IMPLEMENTATION_EXAMPLES.md`

-----

## Real-time Subscriptions

### Pattern

Supabase Realtime channels → React Query invalidation

**Hooks:**

1. **useGroupUpdates** (`hooks/useGroupUpdates.ts`):
   - Subscribe to `groups` + `group_memberships` table changes
   - Filter by `trip_id`
   - On change → invalidate trips query

2. **useFareInspectionAlerts** (`hooks/useFareInspectionAlerts.ts`):
   - Subscribe to `fare_inspection_alerts` INSERT events
   - Check if user in affected group
   - Play alarm + show toast + navigate to group page

**Implementation:** See `docs/IMPLEMENTATION_EXAMPLES.md`

-----

## Notification System

### Architecture

**Primary:** FCM Push Notifications (iOS + Android)
**Fallback:** Twilio SMS (if push fails after 10s)

**Setup:**
- `lib/firebase-admin.ts` - Admin SDK initialization
- `app/api/notifications/fare-inspection/route.ts` - Try FCM → fallback SMS
- `app/api/notifications/payment-reminder/route.ts` - FCM only (non-critical)

**Config:**
- Android: `priority: 'max'`, `channelId: 'fare_inspection'`
- iOS: `interruption-level: 'critical'` (for fare inspection alerts)

**Implementation:** See `docs/IMPLEMENTATION_EXAMPLES.md`

-----

## Background Jobs (Inngest)

**Setup:** `inngest/client.ts` - Initialize Inngest client

**Jobs:**

1. **syncSchedules** (daily 3 AM):
   - Download GTFS feed
   - Seed train schedules
   - Create trip instances for next 7 days

2. **checkDelays** (every 5 min, 6AM-7PM weekdays):
   - Fetch GTFS Realtime
   - Update trip status
   - Notify affected users of delays/cancellations

3. **dailyReminder** (6 PM weekdays):
   - Push "tomorrow's trains open" to all users with FCM tokens

4. **cleanupScreenshots** (daily 4 AM):
   - Delete pass images >48hrs old from Supabase Storage
   - Clear URLs from database

**Implementation:** See `inngest/functions/` and `docs/IMPLEMENTATION_EXAMPLES.md`

-----

## OCR Implementation

**Library:** Tesseract.js (client-side, privacy-first)

**Extraction Patterns** (`lib/ocr.ts`):
- Ticket number: `/[A-Z]{2}\d{8,10}/`
- Passenger count: `/x\s*(\d)/i`
- Activation time: `/\d{1,2}:\d{2}(:\d{2})?\s*[AP]M/i`

**Component Flow** (`components/PassUploadModal.tsx`):
1. File select → OCR extraction
2. Show confidence score + extracted details
3. Validate passenger count vs group size
4. Allow manual edit if confidence <60%
5. Submit: base64 encode → tRPC mutation

**Key UX:**
- Manual fallback always available
- Show warning if passenger count mismatch
- SHA-256 hash ticket number server-side to prevent reuse

**Implementation:** See `docs/IMPLEMENTATION_EXAMPLES.md`

-----

## PWA Configuration

**next-pwa Setup:**
- `dest: 'public'`
- NetworkFirst for Supabase API calls
- CacheFirst for images
- Disabled in development

**Manifest** (`public/manifest.json`):
- App name, icons (192x192, 512x512)
- Shortcuts to `/today`
- Categories: travel, utilities

**Service Worker** (`app/sw.ts`):
- Workbox precaching
- Push event handlers → `showNotification()`
- Notification click → `openWindow()`

**Critical Config:**
- iOS: `interruption-level: 'critical'` for fare inspection
- Android: `priority: 'max'`, custom channel

**Implementation:** See `docs/IMPLEMENTATION_EXAMPLES.md`

-----

## Environment Variables

Required: Supabase (URL + keys), Twilio (SMS), Firebase (FCM), Inngest
Optional: Sentry (monitoring)

See `.env.example` for complete list with descriptions.

-----

## MVP Feature Checklist

### Phase 1 (Core MVP) - Target: 4 weeks

#### Week 1: Foundation

- [ ] Project setup (Next.js 15, TypeScript, Tailwind, shadcn/ui)
- [ ] Supabase project + database schema
- [ ] Authentication (phone verification via Twilio)
- [ ] User profile setup (name, email, photo)
- [ ] Basic routing structure

#### Week 2: Core Features

- [ ] Train schedule display (today + tomorrow)
- [ ] Join/leave trip functionality
- [ ] Real-time group formation algorithm
- [ ] Group display with live updates
- [ ] Steward volunteer system

#### Week 3: Steward & Payment

- [ ] Pass screenshot upload
- [ ] OCR implementation (Tesseract.js)
- [ ] Manual pass entry fallback
- [ ] Payment request generator
- [ ] Payment tracking (mark as sent)
- [ ] Steward dashboard

#### Week 4: Alerts & Polish

- [ ] Coach number + level reporting
- [ ] Group location view
- [ ] Fare inspection alert system
- [ ] Push notifications (FCM)
- [ ] SMS fallback (Twilio)
- [ ] PWA configuration
- [ ] Basic responsive UI
- [ ] Testing & bug fixes

### Phase 2 (Post-Launch) - Target: 8-12 weeks

#### Enhancements

- [ ] Reputation system (payment history, trip completion rate)
- [ ] "Ride with friend" constraints
- [ ] Train delay/cancellation notifications (GO API integration)
- [ ] Historical stats (personal + community)
- [ ] Steward rotation suggestions
- [ ] Multi-day commitment (weekly recurring)

#### Admin & Moderation

- [ ] Admin dashboard
- [ ] User flagging system
- [ ] Dispute resolution tools
- [ ] Analytics dashboard

#### Performance & Reliability

- [ ] Load testing (100+ concurrent users)
- [ ] Database query optimization
- [ ] Error tracking (Sentry)
- [ ] Monitoring dashboards

-----

## Key Technical Decisions

### Why Next.js 15 App Router?

- Server Components for better performance
- Built-in API routes for tRPC
- Excellent Vercel integration
- Strong TypeScript support
- ISR for train schedules

### Why Supabase?

- Postgres database with full control
- Built-in auth (phone verification)
- Real-time subscriptions (critical for live group updates)
- Storage for pass screenshots
- Row-level security
- Free tier suitable for MVP

### Why tRPC?

- End-to-end type safety
- No code generation needed
- Better DX than REST/GraphQL
- Lightweight (no runtime overhead)
- Perfect for Next.js

### Why Zustand over Redux?

- Simpler API, less boilerplate
- Better TypeScript inference
- Smaller bundle size
- Sufficient for this app's complexity

### Why Tesseract.js (client-side OCR)?

- Privacy: no server processing of pass images
- Free: no API costs
- Offline capable: works in PWA
- Good enough accuracy for this use case
- Fallback to manual entry

### Why PWA instead of Native?

- Faster to ship MVP
- Cross-platform (iOS + Android)
- Lower maintenance overhead
- Easier updates (no app store approval)
- Install-to-homescreen for app-like feel
- Can migrate to native later if needed

-----

## Deployment

### Vercel Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Enable Vercel Analytics
# Configure custom domain (optional)
```

### Supabase Setup

```bash
# Create Supabase project
# Run migrations from supabase/migrations/
# Enable Realtime for required tables
# Configure storage bucket 'pass-screenshots' (public read, authenticated write)
# Set up RLS policies
```

### Inngest Setup

```bash
# Create Inngest account
# Deploy functions to Vercel
# Set signing key and event key in env vars
```

### Firebase Setup

```bash
# Create Firebase project
# Enable Cloud Messaging
# Add web app
# Download service account key
# Add to environment variables
```

-----

## Testing Strategy

### Unit Tests

- Group formation algorithm (all edge cases)
- Cost calculation logic
- OCR parsing functions
- Date/time utilities

### Integration Tests

- tRPC API routes
- Supabase queries
- Real-time subscriptions
- Background jobs

### E2E Tests (Playwright)

- Complete user journey: signup → join trip → upload pass → pay
- Steward workflow
- Fare inspection alert flow
- Group rebalancing on join/leave

### Load Testing

- 100+ concurrent users joining same trip
- Real-time update performance
- Database query performance under load

-----

## Security Considerations

### Authentication

- Phone verification required (Twilio Verify)
- No password (passwordless auth)
- Session management via Supabase

### Data Privacy

- Pass screenshots deleted after 48 hours
- Coach numbers only visible to group members
- Phone numbers never exposed in UI
- RLS policies enforce data access

### Payment Security

- No payment processing in app (avoiding PCI compliance)
- No storage of banking details
- Honor system with reputation tracking

### Abuse Prevention

- Rate limiting on fare inspection alerts (1 per trip)
- Group join/leave lockout 30 min before departure
- Duplicate ticket number detection (SHA-256 hash)
- Admin moderation tools

-----

## Success Metrics

### Adoption (Month 1)

- 50+ active users
- 20+ groups formed daily
- 80%+ of WhatsApp community members trying app

### Efficiency (Month 2-3)

- Steward time: <5 min (vs ~15 min current)
- Payment collection: >95% within 1 hour
- Group formation: <10 seconds for 50 riders

### Reliability (Ongoing)

- Fare inspection alert delivery: <10 sec, 99.9% success rate
- Zero duplicate ticket incidents
- <1% no-show rate (vs current ~5%)

### Satisfaction (Month 3)

- NPS score: >50
- User survey: "Easier than WhatsApp?" >90% yes
- Retention: >70% weekly active users

-----

## Risk Mitigation

### Technical Risks

**Risk:** Supabase real-time fails under load
**Mitigation:** Polling fallback every 5 seconds, monitor connection status

**Risk:** OCR accuracy too low
**Mitigation:** Manual entry always available, steward confirms before submitting

**Risk:** Push notifications not delivered
**Mitigation:** SMS fallback within 10 seconds, multiple notification channels

**Risk:** Group formation algorithm bugs
**Mitigation:** Extensive unit tests, manual override by admins

### Product Risks

**Risk:** Users don't adopt, stick with WhatsApp
**Mitigation:** Steward incentives, highlight time savings, community champions

**Risk:** Payment collection worse than current system
**Mitigation:** Reputation system, social pressure via payment status visibility

**Risk:** Fare inspection alerts cause panic/spam
**Mitigation:** Rate limiting, clear UI messaging, user education

### Legal/Compliance Risks

**Risk:** GO Transit ToS violation
**Mitigation:** Legal review, stay within group pass terms, no fraud enablement

**Risk:** Privacy regulations (PIPEDA)
**Mitigation:** Minimal data collection, clear privacy policy, data deletion after 48hr

-----

## Future Enhancements (Phase 3+)

### Advanced Features

- Route expansion (other GO Transit corridors)
- Integration with Presto API (if available)
- Automated payment collection (Interac Request Money)
- Group chat per trip
- Carbon footprint tracking

### Business Model (if scaling)

- Freemium: basic free, premium features for $2/month
- Transaction fee: $0.25 per pass purchased
- Partnership with GO Transit (official endorsement)

-----

## Questions for Clarification

1. **Admin Access:** Who should have admin rights initially? Current WhatsApp community admins?
1. **Beta Testing:** Start with subset of community (~20 people) or full rollout?
1. **Branding:** Does "GO Train Group Pass" work or prefer different name?
1. **Support:** How to handle user support? Discord? Email? In-app chat?
1. **Edge Cases:** What if steward's phone dies before uploading pass? Backup steward system needed?
1. **Historical Data:** Import past WhatsApp poll data to seed reputation scores?
1. **Coach Number Accuracy:** What if someone reports wrong coach? Allow corrections?

-----

This CLAUDE.md provides everything needed to start building the MVP. The tech stack is modern, the architecture is scalable, and the implementation is practical for a 4-week sprint to launch.

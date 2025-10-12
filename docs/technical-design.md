# Technical Design

This document captures the core architecture decisions for the GO Train Group Pass application. It follows the CivicTechWR template format to help maintainers and new contributors ramp quickly.

## System Overview

- **Frontend**: Next.js App Router with React 19 and Tailwind CSS.
- **Backend**: Supabase (Postgres + Edge Functions not yet used) with row-level security enforced via Supabase Auth.
- **API Surface**:
  - RESTful routes under `app/api/*` for Supabase seed/admin workflows.
  - tRPC router (`server/routers`) for authenticated trip and steward actions.
- **State Management**: TanStack Query + tRPC hooks, plus lightweight Zustand stores for UI state.

## Key Components

| Feature                  | Location                                                         | Notes                                                                           |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Trip listings & grouping | `server/routers/trips.ts`, `app/today/page.tsx`                  | Rate-limited join/leave, filters out departed trains.                           |
| Steward dashboard        | `app/steward/page.tsx`, `components/steward/PassUploadModal.tsx` | Pass uploads stored in Supabase Storage, hashed ticket numbers prevent reuse.   |
| Auth flows               | `components/auth/PhoneLoginForm.tsx`, `app/api/auth/*`           | Twilio verification with service-role Supabase client for secure user creation. |
| Security headers         | `lib/security-headers.ts`, `middleware.ts`                       | CSP + COOP/COEP defaults from template security guide.                          |
| Logging                  | `lib/logger.ts`                                                  | Centralized wrapper for info/warn/error/audit events.                           |

## Data Model (Supabase)

Refer to `supabase/migrations/` for full schema. High-level tables:

- `profiles` – Rider/steward metadata.
- `trains` / `trips` – Schedules and daily departures.
- `groups` / `group_memberships` – Passenger assignments and payment tracking.
- `fare_inspection_alerts` – Steward-triggered notifications.

## Security & Compliance

- Admin APIs guarded by environment flag + bearer token (`ENABLE_ADMIN_APIS`).
- Sensitive logging handled via `lib/logger.ts`; default `console` usage removed.
- Demo UI (`/today-demo`) disabled by default behind `NEXT_PUBLIC_ENABLE_DEMO_PAGE`.
- See [SECURITY.md](../SECURITY.md) and [docs/security-guide.md](./security-guide.md) for disclosure and operational guidance.

## Rate Limiting

`lib/rate-limit.ts` provides in-memory guards for auth, trip joins, and steward uploads. For production, replace with a shared cache (Redis/Upstash) so multiple instances share counters.

## Testing Strategy

- **Unit/Integration**: tRPC procedures validated via TypeScript types; expand with Vitest as needed.
- **End-to-End**: Playwright suites under `tests/` including accessibility and multi-user flows.
- **Continuous Quality**: GitHub Actions workflow (`.github/workflows/lint.yml`) runs lint, type-check, format, and security scans aligned with the CTWR template.

## Future Enhancements

- Move rate limit store to Redis.
- Replace ad-hoc admin scripts with Supabase Edge Functions + CLI integration.
- Publish public documentation site via GitHub Pages using `docs/index.md`.

When updating major components, append an entry to `CHANGELOG.md` and sync the relevant sections here.

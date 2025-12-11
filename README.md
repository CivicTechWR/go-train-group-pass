# Go Train Group Pass

[![Lint and Type Check](https://github.com/CivicTechWR/go-train-group-pass/actions/workflows/lint.yml/badge.svg)](https://github.com/CivicTechWR/go-train-group-pass/actions/workflows/lint.yml)
[![Accessibility Audit](https://github.com/CivicTechWR/go-train-group-pass/actions/workflows/accessibility.yml/badge.svg)](https://github.com/CivicTechWR/go-train-group-pass/actions/workflows/accessibility.yml)
[![Security Audit](https://github.com/CivicTechWR/go-train-group-pass/actions/workflows/security.yml/badge.svg)](https://github.com/CivicTechWR/go-train-group-pass/actions/workflows/security.yml)

Interested in helping out? Start with [`CONTRIBUTING.md`](CONTRIBUTING.md) for meetup details, setup steps, and collaboration norms.

## Product Overview

Go Train Group Pass is a civic-tech collaboration that streamlines the purchase and coordination of GO Transit group passes. The platform exposes authenticated APIs, GTFS-powered data services, and admin tools that downstream web or mobile clients use to help riders plan trips, manage eligibility, and share passes across a group.

- [Technical Design Document (Notion, WIP)](https://www.notion.so/Technical-Design-Document-WIP-2a1e01ee4c0080a391bfcd52b067f9a9)
- [Product and UX boards (Figma)](https://www.figma.com/board/5AhW638DdlgCooNjtEZnEG/Metrolinx-Group-Pass?node-id=0-1&t=e1jtwAZg5bLGRAGI-1)

### Product Principles

- **Support stewards, not replace them:** The app augments the existing steward-led process and does not referee peer-to-peer payments.
- **Time-sensitive coordination:** Clear status cues are core to keeping the group aligned in the minutes leading up to boarding and while on the train.
- **Clarity over chat scrollback:** Interfaces focus on surfacing the current itinerary state rather than relying on ad-hoc messaging threads.

### Rider Journey Stages

The stages below map to open issues in this repository:

1. **Pre-board (MVP):** Group formation, check-in, QR/scan, and steward confirmations ([#67–71](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+67..71), [#93–100](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+93..100), [#104–110](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+104..110)).
2. **On board (MVP):** Steward tools for verification and regrouping (same issue sets as above).
3. **Pre-planning (Planned):** Trip search and itinerary creation ([#64–66](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+64..66), [#74–86](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+74..86)).
4. **Post board (Planned):** Ticket purchase, cost splits, and payments/reconciliation ([#72–73](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+72..73), [#107–115](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+107..115)).

```mermaid
flowchart LR
    subgraph Riders
        EndUsers[Group riders]
    end
    subgraph CivicTechWR Platform
        Clients[Web & future mobile apps]
        API[NestJS + Fastify API]
        AuthGuard[Supabase Auth integration]
        Data[GTFS + Pass entities]
    end
    subgraph Infrastructure
        SupabaseAuth[Supabase Auth]
        SupabaseDB[Supabase PostgreSQL]
    end

    EndUsers --> Clients --> API
    API --> AuthGuard
    AuthGuard --> SupabaseAuth
    API --> Data --> SupabaseDB
    SupabaseAuth --> SupabaseDB
```

## Technology Stack

- **Backend:** NestJS 11 (Fastify adapter), TypeScript, MikroORM (PostgreSQL)
- **Authentication:** Supabase Auth (JWT session tokens)
- **Data Source:** GO Transit GTFS feeds mapped into Supabase PostgreSQL 17
- **Frontend (planned):** Next.js + React web client (see issues [#26](https://github.com/CivicTechWR/go-train-group-pass/issues/26) and [#52](https://github.com/CivicTechWR/go-train-group-pass/issues/52))
- **Tooling:** ESLint, Prettier, Vitest, SWC, ts-node
- **Automation:** GitHub Actions for linting, accessibility audits, and security scans

Reference: `backend/package.json` and [`backend/README.md`](backend/README.md#tech-stack).

## Architecture Overview

- High-level flow: the Mermaid chart above captures rider, platform, and Supabase interactions. The broader MVP coordination stages live in the Technical Design Document linked in the Product Overview.
- Backend modules and entities are documented in [`backend/README.md`](backend/README.md#project-structure) and [`backend/AUTH_SETUP.md`](backend/AUTH_SETUP.md#architecture).
- Supabase infrastructure and local parity live in [`backend/SUPABASE_SETUP.md`](backend/SUPABASE_SETUP.md).

## Getting Started

Follow the guide for the area you plan to work on:

| Surface            | Status       | Setup Guide                                                                                                                                                    |
| ------------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend API        | Active       | [`backend/README.md#getting-started`](backend/README.md#getting-started)                                                                                       |
| Supabase stack     | Active       | [`backend/SUPABASE_SETUP.md`](backend/SUPABASE_SETUP.md)                                                                                                       |
| Frontend (Next.js) | Planned      | Track via issues [#26](https://github.com/CivicTechWR/go-train-group-pass/issues/26) and [#52](https://github.com/CivicTechWR/go-train-group-pass/issues/52); setup docs will follow |

## Project Structure

- **`backend/`** — NestJS application modules, MikroORM entities, and Vitest suites. See [`backend/README.md#project-structure`](backend/README.md#project-structure) for file-level detail.
- **`supabase/`** — Local Supabase configuration (CLI, database, auth) that mirrors hosted infrastructure.
- **`.github/workflows/`** — Automation pipelines for linting, accessibility, and security checks that gate pull requests.
- **UX & product specs** — Living documents in [Notion](https://www.notion.so/Technical-Design-Document-WIP-2a1e01ee4c0080a391bfcd52b067f9a9#2a1e01ee4c00805b9432d69102af7a43) and [Figma](https://www.figma.com/board/5AhW638DdlgCooNjtEZnEG/Metrolinx-Group-Pass?node-id=0-1&t=e1jtwAZg5bLGRAGI-1) capture workflows and visual design decisions that have not yet landed in this repo.

## Key Features

### Current state (in repo)

- Supabase-authenticated REST endpoints for signup/signin/refresh/password flows (`backend/src/auth`).
- GTFS data models defined via MikroORM entities (`backend/src/entities`), ready for ingestion and API layers.
- CI workflows for linting, accessibility smoke tests, and security scans (see badges above).

### Planned/backlog (open issues)

- Trip search and itinerary creation APIs: [#64–66](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+64..66), [#74–86](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+74..86)
- Group formation, check-in, steward views, QR/scan, and confirmations: [#67–71](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+67..71), [#93–100](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+93..100), [#104–110](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+104..110)
- Ticket purchase, cost split, payments, and mark-paid flows: [#72–73](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+72..73), [#107–115](https://github.com/CivicTechWR/go-train-group-pass/issues?q=is%3Aissue+is%3Aopen+107..115)
- GTFS ingestion and schedule import: [#3](https://github.com/CivicTechWR/go-train-group-pass/issues/3), [#13](https://github.com/CivicTechWR/go-train-group-pass/issues/13)
- Frontend Next.js/React app and hosting decisions: [#26](https://github.com/CivicTechWR/go-train-group-pass/issues/26), [#27](https://github.com/CivicTechWR/go-train-group-pass/issues/27), [#52](https://github.com/CivicTechWR/go-train-group-pass/issues/52)

Refer to the [Technical Design Document](https://www.notion.so/Technical-Design-Document-WIP-2a1e01ee4c0080a391bfcd52b067f9a9) for the broader roadmap; keep the README aligned with open issues when adding new commitments.

## Development Workflow

- Work from feature branches aligned with the contribution templates in [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/) and [`pull_request_template.md`](.github/pull_request_template.md).
- Automated checks run on every push/PR; monitor the GitHub Action badges or run equivalents locally (`npm run lint`, `npm run type-check`, `npm run test`).
- Consult the [Notion workflow analysis section](https://www.notion.so/Technical-Design-Document-WIP-2a1e01ee4c0080a391bfcd52b067f9a9#2a1e01ee4c0080c0beaa576dc85df8ba) for sprint cadence and release planning.

## Coding Standards

- Style and linting rules are defined in `backend/.eslintrc.json` and enforced through `npm run lint` (see [`backend/README.md#code-quality`](backend/README.md#code-quality)).
- Formatting relies on Prettier; use `npm run format` / `npm run format:check`.
- All pull requests must pass the GitHub workflows (lint, accessibility, security) before merging.
- Domain-driven patterns and DTO validation details live in the corresponding backend documentation sections to reduce duplication.

## Testing

- A full overview of unit, integration, e2e, coverage, and accessibility testing lives in [`backend/README.md#testing`](backend/README.md#testing) and the associated scripts (`package.json`).
- CI executes the same commands, including accessibility audits via Playwright + axe (`npm run test:a11y`) and scheduled security scans.

## Contributing

- Review the [Notion product roadmap](https://www.notion.so/Technical-Design-Document-WIP-2a1e01ee4c0080a391bfcd52b067f9a9) and [Figma flows](https://www.figma.com/board/5AhW638DdlgCooNjtEZnEG/Metrolinx-Group-Pass?node-id=0-1&t=e1jtwAZg5bLGRAGI-1) for context before drafting solutions.
- Use the issue templates to capture requirements; follow the pull-request checklist to surface tests, migrations, and Supabase changes.
- Reference code patterns in `backend/src` and examples in future `docs/` entries rather than duplicating snippets here, keeping the README evergreen.

## License

This repository does not yet declare a license. Coordinate with CivicTechWR maintainers before using the code outside the project.

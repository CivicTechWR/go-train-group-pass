# Getting Started – GO Train Group Pass

Welcome to the CivicTechWR GO Train Group Pass coordination app! This QuickStart follows the [CTWR Project Template](https://github.com/CivicTechWR/CTWR-Project-Template-New) and covers everything you need to bootstrap a local development environment in under 10 minutes.

## 1. Clone and Install

```bash
git clone https://github.com/CivicTechWR/go-train-group-pass.git
cd go-train-group-pass
npm install
```

> Tip: The project targets **Node.js 20+**. Use `nvm use` if you have multiple runtimes installed.

## 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the required keys:

```bash
cp .env.example .env.local
```

Minimum variables:

| Key                             | Purpose                                             |
| ------------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key                                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Used for secure admin flows                         |
| `ENABLE_ADMIN_APIS`             | Set to `false` in day-to-day development            |
| `ADMIN_API_TOKEN`               | Token required if you temporarily enable admin APIs |
| `NEXT_PUBLIC_ENABLE_DEMO_PAGE`  | Optional mock UI toggle for `/today-demo`           |

Optional Twilio keys enable SMS verification (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`, `TWILIO_PHONE_NUMBER`).

See [SETUP.md](./SETUP.md) for Supabase provisioning details.

## 3. Initialize Supabase

Apply the SQL migrations using the Supabase dashboard or CLI. The required SQL lives in `supabase/migrations/`. To seed data locally, run the helper API endpoints:

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Authorization: Bearer $ADMIN_API_TOKEN"

curl -X POST http://localhost:3000/api/create-real-go-trips \
  -H "Authorization: Bearer $ADMIN_API_TOKEN"
```

Set `ENABLE_ADMIN_APIS=true` temporarily while running the seed commands, then revert it to `false`.

## 4. Run the App

```bash
npm run dev
```

Access the app at <http://localhost:3000>. The steward dashboard, trip list, and authentication flow are all available locally.

## 5. Quality Checks

Before opening a pull request, run the standard template checks:

```bash
npm run lint         # ESLint with template-aligned rules
npm run type-check   # TypeScript project validation
npm run test         # Playwright end-to-end suite
npm run test:a11y    # Accessibility audit (axe-core)
```

## 6. Documentation & Next Steps

- `README.md` – High-level project overview.
- `docs/index.md` – Documentation hub following the CTWR template.
- `docs/user-guide.md` – User-facing walkthrough.
- `docs/project-management.md` – Sprint cadence, rituals, and tooling.
- `docs/technical-design.md` – Architecture overview, Supabase schema, and key workflows.

Need live support? Reach out in the CivicTechWR Slack (`#go-train-group-pass`) or open a GitHub discussion.

Happy building!

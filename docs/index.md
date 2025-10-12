# Documentation Hub

Welcome to the GO Train Group Pass documentation center. This structure mirrors the [CivicTechWR project template](https://github.com/CivicTechWR/CTWR-Project-Template-New) so contributors can quickly find the right playbook.

| Audience          | Start Here                                    | Highlights                                              |
| ----------------- | --------------------------------------------- | ------------------------------------------------------- |
| New contributors  | [Getting Started](../GETTING_STARTED.md)      | Clone, configure Supabase, run quality checks           |
| Riders / Stewards | [User Guide](./user-guide.md)                 | Authentication, joining trips, steward responsibilities |
| Engineering team  | [Technical Design](./technical-design.md)     | System architecture, Supabase schema, rate limiting     |
| Delivery leads    | [Project Management](./project-management.md) | Cadence, rituals, backlog hygiene, reporting            |
| Security & Ops    | [Security Guide](./security-guide.md)         | Disclosure policy, logging, secrets management          |

## Setup & Operations

- [setup/SETUP.md](./setup/SETUP.md) – Local environment configuration.
- [setup/SUPABASE_AUTH_SETUP.md](./setup/SUPABASE_AUTH_SETUP.md) – Supabase auth and service role guidance.
- [setup/MIGRATION_GUIDE.md](./setup/MIGRATION_GUIDE.md) – Notes for environment migrations.
- [setup/SECURITY_AUDIT_REPORT.md](./setup/SECURITY_AUDIT_REPORT.md) – Historical security findings.
- [setup/TWILIO_SETUP.md](./setup/TWILIO_SETUP.md) – SMS integration instructions.

## Testing & QA

- [testing/E2E_TESTING_GUIDE.md](./testing/E2E_TESTING_GUIDE.md) – Playwright and multi-user test instructions.

## Related Resources

- [CHANGELOG.md](../CHANGELOG.md) – Release notes and template version alignment.
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) – Community expectations.
- [SECURITY.md](../SECURITY.md) – Coordinated vulnerability disclosure.
- [docs/legacy/](./legacy/README.md) – Archived CivicTechWR pilot deliverables.

For documentation PRs, follow the labeling guide in `.github/` and add entries to `CHANGELOG.md` when you modify project processes.

# Project Management Playbook

This playbook describes how the GO Train Group Pass team operates during a CivicTechWR season. It mirrors the structure in the CTWR project template so facilitators can reuse it across teams.

## Cadence

- **Weekly Sprint**: Core sync happens Wednesday evenings during CivicTechWR meetups. Use Slack updates the rest of the week for async status.
- **Board**: GitHub Projects with columns _Backlog → In Progress → Review → Done_.
- **Checkpoints**: Demo at the end of every sprint, retro every two weeks.

## Roles

| Role | Responsibilities |
| ---- | ---------------- |
| Product Lead | Define weekly goals, groom backlog, triage feedback. |
| Tech Lead | Owns Supabase schema, CI/CD health, and release readiness. |
| Delivery Lead | Facilitates stand-ups, ensures blockers are surfaced quickly. |
| Steward Champion | Coordinates rider feedback and steward workflows. |

Update `docs/team.md` with team members’ names and contact handles once the season roster is set.

## Rituals

1. **Sprint Planning (45 min)** – Kick off at the Wednesday meeting; review impact metrics, select top goals, assign owners.
2. **Async Stand-up** – Post brief updates in the dedicated Slack channel (`#go-train-group-pass`) at least twice per week.
3. **Demo Prep (30 min)** – Use the template slides in `docs/demo-slides.md` to showcase progress.
4. **Retrospective (30 min)** – Rotate facilitators, capture action items in `ISSUES_TRACKING.md`.

## Tooling

- **Code Quality**: `npm run lint`, `npm run type-check`, Playwright suites (`tests/`).
- **Operations**: Saved Supabase SQL scripts (`CREATE_*`) and admin API workflows (`scripts/`).
- **Docs**: Maintain this folder and keep `CHANGELOG.md` current per sprint.

## Reporting

- Update `docs/IMPACT_TRACKING.md` (or create one) mid-sprint with rider counts and steward feedback.
- Post weekly progress to CivicTechWR’s Notion or Slack using the key wins, learnings, next steps format.

Need a new ritual or artifact? Start with the sample decks and markdown guides in the [CTWR Project Template wiki](https://github.com/CivicTechWR/CTWR-Project-Template-New/tree/main/wiki-template) and tailor them to transit riders’ needs.

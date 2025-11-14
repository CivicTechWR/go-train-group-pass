# Contributing to Go Train Group Pass

We welcome contributions from volunteers of all experience levels. This guide covers how to get plugged into the community, set up your environment, and collaborate effectively on changes.

## Community & Meetings

- **Weekly meetup:** Wednesdays from 6-8pm at Builders Club (165 King St W).
- **RSVP & calendar:** Keep an eye on [our Meetup page](https://www.meetup.com/civictechwr/) or the Luma listing (placeholder: add current Luma link) for session topics, schedule changes, and reminders.
- **Hybrid participation:** If you cannot attend in person, drop a note in Slack so we can arrange dial-in details when available.

## Communication Channels

- **Slack:** Join via [this invite link](https://join.slack.com/t/civictechwr/shared_invite/zt-2ldijjy0i-gaGvPkuafPt9Zpn7jml70w) and head straight to `#project-go-train-group-pass` for project updates and pairing requests.
- **Sensitive matters:** Email `civictechwr@gmail.com` for anything that should not live in public channels or GitHub issues.
- **GitHub issues:** Use issue templates for bugs, features, and project questions so maintainers can triage quickly.

## Development Environment

Our active code lives in the `backend/` directory. To contribute effectively:

- Install **Node.js v18+** and **npm v9+** (or newer). We recommend using `nvm` or a similar version manager to stay aligned with CI.
- Install the **Supabase CLI** and **Docker** to run the local database and auth stack. Follow the step-by-step instructions in [`backend/SUPABASE_SETUP.md`](backend/SUPABASE_SETUP.md).
- Initialize the backend by following [`backend/README.md#getting-started`](backend/README.md#getting-started) for environment variables, migrations, and local commands.
- Run `npm run start:dev` from `backend/` for the API, and keep `npm run lint`, `npm run type-check`, and `npm run test` handy before opening a pull request.

## Contribution Workflow

1. **Pick or propose work:** Comment on an open issue or create a new one using the templates in `.github/ISSUE_TEMPLATE/`.
2. **Create a branch:** Use a feature branch such as `feature/add-trip-endpoint` or `fix/auth-timeout`.
3. **Build iteratively:** Commit early and often, keeping changes scoped so they are reviewable.
4. **Check quality gates:** Lint, type-check, and run relevant tests (`npm run test`, `npm run test:e2e`) before pushing.
5. **Open a pull request:** Reference the issue, describe the change, and complete the PR checklist.

## Semantic Commit Messages

We follow conventional, semantic commit messages to keep the history clean and to power automated tooling.

```text
type(scope?): short summary in present tense
```

Common types include:

- `feat`: new user-facing functionality
- `fix`: bug fixes or behavior corrections
- `docs`: documentation-only changes
- `style`: code formatting or cosmetic updates without logic changes
- `refactor`: restructuring code without changing behavior
- `test`: adding or updating tests
- `build`: build system or dependency changes
- `ci`: CI/CD configuration updates
- `chore`: repository maintenance tasks
- `revert`: revert a previous commit

Use a scope (e.g., `auth`, `gtfs`, `docs`) when it clarifies the impacted area: `feat(auth): support refreshed tokens`.

## Pull Request Expectations

- Keep PRs focused; split large efforts into a series of smaller, reviewable changes when possible.
- Include screenshots or API examples when the change affects user-facing behavior or contract surfaces.
- Note any follow-up tasks or known gaps so maintainers can plan the next iteration.
- Flag migrations or Supabase changes in the PR checklist to alert reviewers of operational impacts.

## Reporting Security or Privacy Concerns

If you discover a potential security vulnerability or sensitive data exposure, avoid filing a public issue. Instead, email `civictechwr@gmail.com` with the details so maintainers can coordinate a response.

## Additional Resources

- [`README.md`](README.md) for project overview and quick links to product specs
- [`backend/README.md`](backend/README.md) for detailed API setup, scripts, and project structure
- [`backend/SUPABASE_SETUP.md`](backend/SUPABASE_SETUP.md) for database and auth infrastructure parity

Thanks for contributing to CivicTechWR and helping riders travel together more easily!

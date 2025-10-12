# User Guide

This guide walks riders and stewards through the GO Train Group Pass experience. It supplements the UX copy in the app and keeps the documentation aligned with the CivicTechWR template.

## 1. Sign In

1. Visit <http://localhost:3000> (or the deployed environment).
2. Enter your phone number on the login screen.
3. Retrieve the SMS code and confirm your session.
4. Set a display name so other riders can recognize you.

> Having trouble receiving codes? See the troubleshooting section in [docs/MCP_TROUBLESHOOTING.md](./MCP_TROUBLESHOOTING.md).

## 2. Join a Trip

1. Open the **Today** tab to see available trips that have not yet departed.
2. Select **Join Train** for the departure you want.
3. The system auto-assigns you to an existing group or creates a new one to keep 2–5 riders together.

## 3. Steward Dashboard

Riders who volunteer as stewards gain access to `/steward`:

- Review each assigned group, passenger count, and payment status.
- Upload pass screenshots securely (hashes prevent reuse between groups).
- Generate payment reminders and track who has paid.

Refer to [docs/AVAILABLE_AGENTS.md](./AVAILABLE_AGENTS.md) for AI assistant playbooks that can assist stewards during busy commutes.

## 4. Alerts & Safety

- Fare inspection alerts notify all group members when a steward raises a concern.
- Use the **Today** tab to track real-time updates and connect with riders before boarding.

## 5. Support

Need help? Reach out via:

- CivicTechWR Slack (`#go-train-group-pass`).
- GitHub Discussions or Issues.
- Email the maintainers listed in [docs/team.md](./team.md) (once populated).

For advanced topics, see the [Technical Design](./technical-design.md) document.

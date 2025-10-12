# Security Guide

This guide supplements [SECURITY.md](../SECURITY.md) with operational practices for the GO Train Group Pass project.

## Secrets Management

- Store Supabase and Twilio credentials in `.env.local` for local work and in GitHub repository secrets or your hosting platform’s secret store for deployed environments. Never commit `.env` files or plaintext credentials to the repository.
- Never commit `.env` files or share service role keys in issues.
- Rotate the `ADMIN_API_TOKEN` after maintenance windows.

## Logging

- Use `lib/logger.ts` for consistent structured logging.
- Sensitive fields (phone numbers, pass ticket numbers) are hashed or omitted from logs.
- `logger.audit` is reserved for steward pass uploads and security events.

## Middleware & Headers

- `middleware.ts` injects the security headers defined in `lib/security-headers.ts`.
- Content Security Policy restricts scripts, images, and connections to trusted origins.
- `validateRequestSize` guards against oversized bodies (10 MB default).

## Rate Limiting

- Authentication, pass uploads, and trip join actions share a central limiter (`lib/rate-limit.ts`).
- To harden for production, replace the in-memory map with Redis/Upstash and add IP-based identifiers where possible.

## Vulnerability Reporting

- Follow the process detailed in [SECURITY.md](../SECURITY.md).
- Maintain an up-to-date incident log in a private CivicTechWR workspace.
- Disclose fixes in `CHANGELOG.md` with credit to reporters when applicable.

## Dependency Monitoring

- Run `npm run security` (npm audit) as part of the release checklist.
- Keep GitHub Dependabot alerts triaged weekly.

## Secret Scanning

- Every push and scheduled security run executes the `gitleaks` scanner (see `.github/workflows/security.yml`) to prevent accidental credential commits.
- Treat any scanner failure as a high-severity incident: rotate the affected secret, purge the commit, and document the follow-up in the incident log.

## Incident Response Checklist

1. Acknowledge the report within 3 business days.
2. Reproduce and triage severity.
3. Assign an owner and create a private GitHub issue.
4. Patch, test, and deploy.
5. Update documentation, changelog, and notify the reporter.

Stay aligned with the CivicTechWR security policies to ensure rider data remains safe.

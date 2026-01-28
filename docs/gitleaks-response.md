# Gitleaks Response Guide

This document explains the maintainers' recommended steps when the repository's Gitleaks scan flags potential secrets.

1. Triage the finding
   - Review the redacted report attached to the workflow run or the pull request comment to identify the affected file(s).
   - Determine whether the exposed value is a secret (API key, token, password) or a false positive.

2. Contain the exposure
   - If a secret is confirmed, remove it from the repository immediately (revert the change or replace it in a follow-up commit).
   - Rotate the exposed credential in the relevant service (Supabase, third-party API, etc.).

3. Clean history if needed
   - If the secret existed in commit history, follow the documented process for removing sensitive data from history (e.g., `git filter-repo` or provider guidance).
   - Coordinate with maintainers before rewriting shared branch history.

4. Notify maintainers and affected teams
   - Add a comment to the pull request describing the remediation steps taken and the credential rotation status.
   - For anything high-risk, email `civictechwr@gmail.com` to escalate privately.

5. Re-run scans
   - After remediation, re-run the CI scan to confirm no further findings remain.

## Notes

- Gitleaks output is redacted in CI artifacts. Use the attached artifact to inspect findings and avoid pasting secrets into issue comments.
- This file is intentionally high-level. For step-by-step tooling commands or escalation templates, contact repository maintainers.

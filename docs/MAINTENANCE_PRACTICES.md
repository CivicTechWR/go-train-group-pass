# Maintenance Practices

## Claude Code Memory Cues

# Remember: Keep the repository clean. Remove temp files, scratch notes, logs, and generated Markdown after each session.

# Remember: Track TODOs and bugs in Gitea issues, not as inline comments. Link commits to issues.

# Remember: Commit in small, atomic steps with clear messages. Run @code-reviewer before merges.

# Remember: Prefer agents and MCP servers when available. Use Supabase MCP for database tasks.

These routines keep the GO Train Group Pass app repo healthy and manageable.

---

## 🧹 Regular Cleanup

- Delete temporary files, scratch notes, logs, or generated Markdown after each development session.
- Remove any `tmp/`, `.cache/`, or `__generated__` directories.
- Keep `/docs` for long-term reference, not for per-session notes.
- Commit only meaningful files. Avoid committing `.env`, build artifacts, or AI output drafts.

---

## ✅ Issue Tracking

- Use **Gitea issues** for all TODOs, bugs, and features.
- Label appropriately: `feature`, `bug`, `enhancement`, `docs`, `urgent`.
- Link commits to issues (`Fixes #123`, `Relates to #456`).
- Keep one issue per logical concern to avoid noise.

---

## 🗓️ Session Routine

### Start of Session

- Pull latest from `develop` (or `main` if hotfix).
- Open the linked issue for the task at hand.
- Run `npm run build` once to catch breakages early.

### End of Session

- Remove temp files and generated docs.
- Run `@code-reviewer`.
- Commit and push with an issue reference (`Relates to #123` or `Fixes #123`).
- Open or update the PR.

## 💾 Commit & Review Routine

1. Finish your feature or fix.
2. Run `@code-reviewer` before committing.
3. Commit with:
   ```
   feat: implement X
   fix: resolve Y
   ```
4. Push to `feature/*` or `fix/*` branch.
5. Open a pull request → assign reviewer or run `@qa-expert`.
6. Merge only after all checks pass.

---

## 🔁 End-of-Week Cleanup

- Run `git status` and ensure no orphaned files.
- Review `/docs` for outdated notes.
- Verify `CLAUDE.md` still matches actual architecture.
- Close or triage stale issues in Gitea.

---

# Remember: A clean repo is a fast repo. Keep it lean, reviewed, and documented.

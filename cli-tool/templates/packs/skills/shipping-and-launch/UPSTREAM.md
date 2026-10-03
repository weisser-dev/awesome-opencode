# Upstream and license

This folder is an adapted copy of `skills/shipping-and-launch/` from an MIT-licensed upstream repository.

| Field | Value |
|---|---|
| Source repository | https://github.com/addyosmani/agent-skills |
| Path | `skills/shipping-and-launch/` |
| Pinned commit | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` |
| Retrieved | 2026-10-03 |
| Upstream SKILL.md sha256 | `1055d25dfe6cfeb6ae31eba3e2328fd0e7c66b285f0e44c40f67c77a59813281` |
| License | MIT License, Copyright (c) 2025 Addy Osmani (full text: `LICENSE`) |

## Changes made in this copy

- Copied the shared reference `references/accessibility-checklist.md` into the skill folder and pointed links at it.
- Copied the shared reference `references/definition-of-done.md` into the skill folder and pointed links at it.
- Copied the shared reference `references/performance-checklist.md` into the skill folder and pointed links at it.
- Copied the shared reference `references/security-checklist.md` into the skill folder and pointed links at it.
- Added the local-use ground rules block under the front matter.
- Added an agent-role rule: deploys/pushes/migrations/flags only on explicit instruction.

Everything else is upstream text, unchanged.

## Updating

Review `git diff a06bc63b3f8b829c14b0bbf53d99fefc39d58092 <new-sha> -- skills/shipping-and-launch/ references/`, re-run `packs/adapt-agent-skills.py <checkout>` (it applies the changes above as exact replacements and fails if upstream text moved), update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

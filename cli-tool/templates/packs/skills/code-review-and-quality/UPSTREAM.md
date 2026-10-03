# Upstream and license

This folder is an adapted copy of `skills/code-review-and-quality/` from an MIT-licensed upstream repository.

| Field | Value |
|---|---|
| Source repository | https://github.com/addyosmani/agent-skills |
| Path | `skills/code-review-and-quality/` |
| Pinned commit | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` |
| Retrieved | 2026-10-03 |
| Upstream SKILL.md sha256 | `2db1e850379f255fd3091ef278cde24cd6c7d2ba23e360cc52ea522c40d4396e` |
| License | MIT License, Copyright (c) 2025 Addy Osmani (full text: `LICENSE`) |

## Changes made in this copy

- Copied the shared reference `references/performance-checklist.md` into the skill folder and pointed links at it.
- Copied the shared reference `references/security-checklist.md` into the skill folder and pointed links at it.
- Added the local-use ground rules block under the front matter.
- `npm audit` only with consent (network).

Everything else is upstream text, unchanged.

## Updating

Review `git diff a06bc63b3f8b829c14b0bbf53d99fefc39d58092 <new-sha> -- skills/code-review-and-quality/ references/`, re-run `packs/adapt-agent-skills.py <checkout>` (it applies the changes above as exact replacements and fails if upstream text moved), update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

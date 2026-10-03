# Upstream and license

This folder is an adapted copy of `skills/security-and-hardening/` from an MIT-licensed upstream repository.

| Field | Value |
|---|---|
| Source repository | https://github.com/addyosmani/agent-skills |
| Path | `skills/security-and-hardening/` |
| Pinned commit | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` |
| Retrieved | 2026-10-03 |
| Upstream SKILL.md sha256 | `2e3fc60eed5aba97fe416f3f3c9317fdb014a682925ec70a733c3ff99e4b9858` |
| License | MIT License, Copyright (c) 2025 Addy Osmani (full text: `LICENSE`) |

## Changes made in this copy

- Copied the shared reference `references/security-checklist.md` into the skill folder and pointed links at it.
- Added the local-use ground rules block under the front matter.
- Audits run in CI or with consent (network).
- Installs only with approval.
- Audit wording follows the consent rule.

Everything else is upstream text, unchanged.

## Updating

Review `git diff a06bc63b3f8b829c14b0bbf53d99fefc39d58092 <new-sha> -- skills/security-and-hardening/ references/`, re-run `packs/adapt-agent-skills.py <checkout>` (it applies the changes above as exact replacements and fails if upstream text moved), update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

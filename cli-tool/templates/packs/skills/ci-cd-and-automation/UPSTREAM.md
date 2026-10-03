# Upstream and license

This folder is an adapted copy of `skills/ci-cd-and-automation/` from an MIT-licensed upstream repository.

| Field | Value |
|---|---|
| Source repository | https://github.com/addyosmani/agent-skills |
| Path | `skills/ci-cd-and-automation/` |
| Pinned commit | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` |
| Retrieved | 2026-10-03 |
| Upstream SKILL.md sha256 | `a6ed8ed56456b01ff8314c44eefc69897d9905ae4e06bb2b7036286efb79b5f0` |
| License | MIT License, Copyright (c) 2025 Addy Osmani (full text: `LICENSE`) |

## Changes made in this copy

- Added the local-use ground rules block under the front matter.
- Pushing a fix now requires the user's confirmation.
- Commits stay local unless the user confirms a push.
- Auto-merge is a team decision, not an agent action.

Everything else is upstream text, unchanged.

## Updating

Review `git diff a06bc63b3f8b829c14b0bbf53d99fefc39d58092 <new-sha> -- skills/ci-cd-and-automation/ references/`, re-run `packs/adapt-agent-skills.py <checkout>` (it applies the changes above as exact replacements and fails if upstream text moved), update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

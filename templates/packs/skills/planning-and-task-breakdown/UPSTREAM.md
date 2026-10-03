# Upstream and license

This folder is an adapted copy of `skills/planning-and-task-breakdown/` from an MIT-licensed upstream repository.

| Field | Value |
|---|---|
| Source repository | https://github.com/addyosmani/agent-skills |
| Path | `skills/planning-and-task-breakdown/` |
| Pinned commit | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` |
| Retrieved | 2026-10-03 |
| Upstream SKILL.md sha256 | `ed0f90cc5951ddd4bcab7f871f64efec93a49af9279ef93bc470da77ad8da3f7` |
| License | MIT License, Copyright (c) 2025 Addy Osmani (full text: `LICENSE`) |

## Changes made in this copy

- Copied the shared reference `references/definition-of-done.md` into the skill folder and pointed links at it.
- Added the local-use ground rules block under the front matter.

Everything else is upstream text, unchanged.

## Updating

Review `git diff a06bc63b3f8b829c14b0bbf53d99fefc39d58092 <new-sha> -- skills/planning-and-task-breakdown/ references/`, re-run `packs/adapt-agent-skills.py <checkout>` (it applies the changes above as exact replacements and fails if upstream text moved), update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

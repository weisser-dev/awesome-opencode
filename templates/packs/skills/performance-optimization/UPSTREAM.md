# Upstream and license

This folder is an adapted copy of `skills/performance-optimization/` from an MIT-licensed upstream repository.

| Field | Value |
|---|---|
| Source repository | https://github.com/addyosmani/agent-skills |
| Path | `skills/performance-optimization/` |
| Pinned commit | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` |
| Retrieved | 2026-10-03 |
| Upstream SKILL.md sha256 | `665a83a7218d6aebd02ca329a7b2422cf28f7c55cb56f870c05e12047770245c` |
| License | MIT License, Copyright (c) 2025 Addy Osmani (full text: `LICENSE`) |

## Changes made in this copy

- Copied the shared reference `references/performance-checklist.md` into the skill folder and pointed links at it.
- Added the local-use ground rules block under the front matter.
- CrUX (external Google dataset) replaced by the team's own RUM/field data.
- Chrome DevTools MCP replaced by the local playwright-cli skill.
- Removed CrUX reference.
- CI examples marked as file content; Lighthouse CI uploads to the filesystem only.

Everything else is upstream text, unchanged.

## Updating

Review `git diff a06bc63b3f8b829c14b0bbf53d99fefc39d58092 <new-sha> -- skills/performance-optimization/ references/`, re-run `packs/adapt-agent-skills.py <checkout>` (it applies the changes above as exact replacements and fails if upstream text moved), update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

# Upstream and license

This folder is an adapted copy of `skills/test-driven-development/` from an MIT-licensed upstream repository.

| Field | Value |
|---|---|
| Source repository | https://github.com/addyosmani/agent-skills |
| Path | `skills/test-driven-development/` |
| Pinned commit | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` |
| Retrieved | 2026-10-03 |
| Upstream SKILL.md sha256 | `7c0c6ac057c19d7f8be65d9f49c3a638703b868f4625c78b70da5439d5d74fca` |
| License | MIT License, Copyright (c) 2025 Addy Osmani (full text: `LICENSE`) |

## Changes made in this copy

- Copied the shared reference `references/testing-patterns.md` into the skill folder and pointed links at it.
- Added the local-use ground rules block under the front matter.
- Browser verification no longer depends on Chrome DevTools MCP.
- Browser testing via local playwright-cli instead of Chrome DevTools MCP.
- Pointer to the excluded browser-testing-with-devtools skill replaced.

Everything else is upstream text, unchanged.

## Updating

Review `git diff a06bc63b3f8b829c14b0bbf53d99fefc39d58092 <new-sha> -- skills/test-driven-development/ references/`, re-run `packs/adapt-agent-skills.py <checkout>` (it applies the changes above as exact replacements and fails if upstream text moved), update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

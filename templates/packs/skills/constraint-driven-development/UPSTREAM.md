# Upstream and license

This folder is an adapted copy of `skills/constraint-driven-development/` from an MIT-licensed upstream repository.

| Field | Value |
|---|---|
| Source repository | https://github.com/addyosmani/agent-skills |
| Path | `skills/constraint-driven-development/` |
| Pinned commit | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` |
| Retrieved | 2026-10-03 |
| Upstream SKILL.md sha256 | `06479d4305f286d23cfb99f5dc85695896785269664e1f6a8d800e3b71e70c10` |
| License | MIT License, Copyright (c) 2025 Addy Osmani (full text: `LICENSE`) |

## Changes made in this copy

- Added the local-use ground rules block under the front matter.
- Agent-instruction files are changed only after the user agrees.
- Step 4 now proposes installs instead of installing; network-using scanners are CI-only by default.
- Verification wording follows the approval rule.

Everything else is upstream text, unchanged.

## Updating

Review `git diff a06bc63b3f8b829c14b0bbf53d99fefc39d58092 <new-sha> -- skills/constraint-driven-development/ references/`, re-run `packs/adapt-agent-skills.py <checkout>` (it applies the changes above as exact replacements and fails if upstream text moved), update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

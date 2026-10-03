# Upstream and license

This folder is an adapted copy of `skills/doubt-driven-development/` from an MIT-licensed upstream repository.

| Field | Value |
|---|---|
| Source repository | https://github.com/addyosmani/agent-skills |
| Path | `skills/doubt-driven-development/` |
| Pinned commit | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` |
| Retrieved | 2026-10-03 |
| Upstream SKILL.md sha256 | `6fa1fcd8420c28daf7e53c5b08b0f20b907911efd2a6d9bce0b9740da20a4008` |
| License | MIT License, Copyright (c) 2025 Addy Osmani (full text: `LICENSE`) |

## Changes made in this copy

- Added the local-use ground rules block under the front matter.
- Replaced "Cross-model escalation" (piping the artifact to external Gemini/Codex CLIs) with an optional manual second opinion; the agent never sends the artifact to other services.
- Removed the link to the upstream orchestration-patterns reference (not installed).
- Reviewer personas are optional (upstream agents/ folder is not installed).
- Removed cross-model CLI rows/flags/checks and the source-driven-development reference (not installed).

Everything else is upstream text, unchanged.

## Updating

Review `git diff a06bc63b3f8b829c14b0bbf53d99fefc39d58092 <new-sha> -- skills/doubt-driven-development/ references/`, re-run `packs/adapt-agent-skills.py <checkout>` (it applies the changes above as exact replacements and fails if upstream text moved), update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

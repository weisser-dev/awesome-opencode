# Upstream and license

`SKILL.md` in this folder is an adapted copy of an MIT-licensed upstream skill.

| Field | Value |
|---|---|
| Source repository | https://github.com/Leonxlnx/taste-skill (site: https://www.tasteskill.dev/) |
| File | `skills/gpt-tasteskill/SKILL.md` |
| Pinned commit | `ce26fc25c0e5e8cab638f883de62d9a86ee5e45b` |
| Retrieved | 2026-10-03 |
| Upstream sha256 | `2e64c269953f2656c21bf5a0fa6b4568e82fe0c72b36e8f84758e090349966a5` |
| License | MIT License, Copyright (c) 2026 Leonxlnx (full text: `LICENSE`) |

## Changes made in this copy

- Added an offline note under the title.
- Section 5: GSAP is proposed (pinned) for approval if missing instead of assumed/installed.
- Section 7: `https://picsum.photos/...` images replaced by project assets or labeled local placeholders; hotlinking forbidden.

Everything else is upstream text, unchanged.

## Updating

Review the upstream diff from the pinned commit (`git diff ce26fc25c0e5e8cab638f883de62d9a86ee5e45b <new-sha> -- skills/gpt-tasteskill/SKILL.md`), re-apply the changes above, update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

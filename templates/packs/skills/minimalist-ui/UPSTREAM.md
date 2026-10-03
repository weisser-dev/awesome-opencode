# Upstream and license

`SKILL.md` in this folder is an adapted copy of an MIT-licensed upstream skill.

| Field | Value |
|---|---|
| Source repository | https://github.com/Leonxlnx/taste-skill (site: https://www.tasteskill.dev/) |
| File | `skills/minimalist-skill/SKILL.md` |
| Pinned commit | `ce26fc25c0e5e8cab638f883de62d9a86ee5e45b` |
| Retrieved | 2026-10-03 |
| Upstream sha256 | `36bc7328f085405f43b476938e62460fa573bf7e984e949e072bcf014831a44c` |
| License | MIT License, Copyright (c) 2026 Leonxlnx (full text: `LICENSE`) |

## Changes made in this copy

- Added an offline note under the title.
- Section 6: `https://picsum.photos/...` placeholder images replaced by labeled local placeholder blocks; hotlinking forbidden.

Everything else is upstream text, unchanged.

## Updating

Review the upstream diff from the pinned commit (`git diff ce26fc25c0e5e8cab638f883de62d9a86ee5e45b <new-sha> -- skills/minimalist-skill/SKILL.md`), re-apply the changes above, update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

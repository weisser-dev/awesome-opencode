# Upstream and license

`SKILL.md` in this folder is an adapted copy of an MIT-licensed upstream skill.

| Field | Value |
|---|---|
| Source repository | https://github.com/Leonxlnx/taste-skill (site: https://www.tasteskill.dev/) |
| File | `skills/taste-skill/SKILL.md` |
| Pinned commit | `ce26fc25c0e5e8cab638f883de62d9a86ee5e45b` |
| Retrieved | 2026-10-03 |
| Upstream sha256 | `aa194351b246b8b4799099d4ed7b033d29eab6e6e3d58d8d2172978be7b3ec89` |
| License | MIT License, Copyright (c) 2026 Leonxlnx (full text: `LICENSE`) |

## Changes made in this copy

- Added an offline note under the title and to the description.
- Section 0.A: do not browse URLs the user linked unless explicitly asked (use provided screenshots/files).
- Section 2.A / 3.F: never install packages autonomously; propose a pinned install command and wait for approval (shadcn row no longer shows an unpinned `npx shadcn@latest`).
- Section 4.8: asset priority is now project/brief assets, then image generation only with user consent, then labeled local placeholders; hotlinking external image/logo CDNs (picsum.photos, cdn.simpleicons.org) is forbidden.
- Section 6.D: run Lighthouse only if available locally, never download it ad hoc.
- Section 9.E and the pre-flight checklist: "use picsum.photos" replaced by "no hotlinked images"; logos from project assets or an installed icon package.
- Appendix A: marked as commands for the user to run after approval, with pinned versions; Shopify CDN script flagged as Shopify-only.
- Appendix B: the list of documentation URLs was removed (agents must not fetch docs at run time); use the docs shipped with installed packages.

Everything else is upstream text, unchanged.

## Updating

Review the upstream diff from the pinned commit (`git diff ce26fc25c0e5e8cab638f883de62d9a86ee5e45b <new-sha> -- skills/taste-skill/SKILL.md`), re-apply the changes above, update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

# Upstream and license

`references/web-interface-guidelines.md` is an unmodified copy of `command.md` from
Vercel Labs' Web Interface Guidelines.

| Field | Value |
|---|---|
| Source repository | https://github.com/vercel-labs/web-interface-guidelines |
| File | `command.md` |
| Pinned commit | `e3d624baaf29dc1fc645aff3e38f03e564d2d6b1` (2026-08-18) |
| Retrieved | 2026-10-03 |
| sha256 | `5a775e6411f790f518dbc9c1fa7c50a89e6873502d9a3530a6eb223a590bcfe8` |
| License | MIT License, Copyright (c) 2025 Vercel Labs (full text: `references/LICENSE-vercel-web-interface-guidelines`) |

`SKILL.md` in this folder is our own text. It is **not** a copy of
`vercel-labs/agent-skills/skills/web-design-guidelines/SKILL.md` (that repository has no license
file) and, unlike that skill, it does not fetch the rules from the internet at run time.

## Updating

1. Review the upstream diff, e.g.
   `git -C web-interface-guidelines diff e3d624baaf29dc1fc645aff3e38f03e564d2d6b1 <new-sha> -- command.md`.
2. Check the new text for instructions that call tools, fetch URLs or run commands.
3. Copy the new `command.md` over `references/web-interface-guidelines.md` without edits.
4. Update the commit, date and sha256 here and in `packs/sources.lock.json`.
5. Run `packs/check-vendored.sh --online`.

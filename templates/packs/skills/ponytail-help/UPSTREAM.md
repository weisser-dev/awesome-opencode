# Upstream and license

`SKILL.md` in this folder is an adapted copy of an MIT-licensed upstream skill.

| Field | Value |
|---|---|
| Source repository | https://github.com/DietrichGebert/ponytail |
| File | `skills/ponytail-help/SKILL.md` |
| Pinned commit | `c982cd411abb53323c4baa1baa3c2f020b8d0b08` (package version 4.10.3) |
| Retrieved | 2026-10-03 |
| Upstream sha256 | `23d9baf1b9a9464b40ebe1b5b50752795210b934fc8e248e791496e4c9a39fd2` |
| License | MIT License, Copyright (c) 2026 DietrichGebert (full text: `LICENSE`) |

## Changes made in this copy

- Removed `ponytail-gain` from the skill table (not installed: it only prints the author's
  benchmark claims).
- Removed the "Configure Default Mode" section (environment variable and
  `~/.config/ponytail/config.json` are read by the upstream hooks, which are not installed).
- Removed the "Update" section (plugin marketplace auto-update and a global
  `npm install -g ...@latest`) and the "More" link.
- Removed the Codex `$ponytail` invocation note; added a note that installed skills are slash
  commands in Claude Code and OpenCode, and a scope note.

## Updating

Review `git diff c982cd411abb53323c4baa1baa3c2f020b8d0b08 <new-sha> -- skills/ponytail-help/SKILL.md`,
re-apply the changes above, update commit and sha256 here and in `packs/sources.lock.json`,
then run `packs/check-vendored.sh --online`.

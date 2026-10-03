# Upstream and license (NOTICE)

`SKILL.md` in this folder is a modified, shortened derivative of the playwright-cli agent skill.

| Field | Value |
|---|---|
| Source repository | https://github.com/microsoft/playwright-cli |
| File | `skills/playwright-cli/SKILL.md` |
| Pinned commit | `b85c7a736bb473bf55b584e54a09ffa698d6d871` (= npm `@playwright/cli@0.1.22`, `gitHead`) |
| Retrieved | 2026-10-03 |
| Upstream sha256 | `9bba755285a4c9ad72a4a41b9c7baef6fb516d329c0b44ed0573715f4479b906` |
| License | Apache License 2.0, Copyright (c) Microsoft Corporation (full text: `LICENSE`) |

## Changes made in this copy (Apache-2.0 section 4(b))

- Rewritten and shortened to the commands needed for local visual verification
  (open, resize, screenshot, color scheme, reduced motion, forced colors, contrast, snapshot,
  find, console, requests, close).
- Removed the `allowed-tools` pre-approval (`Bash(playwright-cli:*)`, `Bash(npx playwright:*)`).
- Removed the instruction to install `@playwright/cli@latest` globally; the CLI must be a pinned
  dev dependency installed by the user, and calls use `npx --no-install`.
- Added `NO_UPDATE_NOTIFIER=1` to suppress the CLI's daily update check against the npm registry.
- Restricted targets to localhost / 127.0.0.1 / `file://` unless the user names a URL.
- Removed commands that reach real user data or other hosts: `attach` (CDP / browser extension),
  cookie, localStorage, sessionStorage and storage-state commands, persistent profiles, WebMCP
  tool calls, network routing to external hosts, and the section on uploading screenshots and
  videos to pull requests with `gh --attach`.
- Removed the reference documents (`references/*.md`) of the upstream skill.

## Updating

Review `git diff b85c7a736bb473bf55b584e54a09ffa698d6d871 <new-sha> -- skills/playwright-cli/SKILL.md`
for new commands, check them against the ground rules above, update the pinned commit, npm
version and sha256 here and in `packs/sources.lock.json`, then run
`packs/check-vendored.sh --online`.

# Upstream and license (commands)

The slash commands in this folder are adapted from `.claude/commands/` of an MIT-licensed upstream repository. They work unchanged in Claude Code (`.claude/commands/` or `~/.claude/commands/`) and OpenCode (`.opencode/commands/` or `~/.config/opencode/commands/`): front matter uses only `description`, the body uses `$ARGUMENTS`, and no file contains shell injection (`!` + backtick).

| Field | Value |
|---|---|
| Source repository | https://github.com/addyosmani/agent-skills |
| Path | `.claude/commands/` |
| Pinned commit | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` |
| Retrieved | 2026-10-03 |
| License | MIT License, Copyright (c) 2025 Addy Osmani (full text: `LICENSE-agent-skills`) |

Upstream sha256 per file:

| File | sha256 |
|---|---|
| `build.md` | `74cc85b5092f8e209bcda36441a4ce17a5cd9efd2a7d8ce76ba202816088e277` |
| `code-simplify.md` | `71e9e8d38c5cbab5b7ecff324ed4ea0f1aaa4fd053ea6c2b717f2fbadfb65a91` |
| `constraints.md` | `f6d8fdf69be74059db907cf474149eae336b6fbfbcbfb791546e321085612171` |
| `plan.md` | `91d961b2a7011209bc6771c176932e72e11b99d0c524e3f63c9f2e2a94fbc993` |
| `review.md` | `8ad7da75873b430b737328d1bdd95fc8d2de4a4866737087feb4d218abe4e88f` |
| `ship.md` | `02d2d0fc10bfb58bb62dcfe22ed396cd2b9f55dced7d5cd92fce6d29f0da4ace` |
| `spec.md` | `82325b4cc75ae2413c7bf4b6f84804eb662935d9df98edab50eef2b39ff904b0` |
| `test.md` | `62f72b64cfac6db984db072fdc987a23e6049876191297da5f37367def986ff2` |
| `webperf.md` | `74c0c1335f1397a5138a78eda4275e4e5deba16c4537f3a4b4971c3280d0ba27` |

## Changes made in this copy

- All files: removed the plugin namespace prefix `agent-skills:` from skill names (skills are installed as plain folders); added an attribution comment at the end.
- `code-simplify.md`: reads the project's agent instructions (CLAUDE.md / AGENTS.md), not only CLAUDE.md.
- `test.md`: browser verification through the local `playwright-cli` skill instead of `browser-testing-with-devtools` (Chrome DevTools MCP).
- `constraints.md`: step 4 proposes tool installs (pinned) and waits for approval instead of installing; tools that call online services run in CI unless the user wants them locally; the CLAUDE.md/AGENTS.md line is added only after the user agrees.
- `ship.md`: rewritten fan-out that uses the user's own reviewer agents if present, otherwise general-purpose subagents briefed with `code-review-and-quality`, `security-and-hardening` and `test-driven-development` (the upstream `agents/` personas are not installed); `/ship` never deploys, pushes, migrates or flips flags by itself; dependency checks without network audits unless the user consents.
- `webperf.md`: rewritten to quick mode plus deep mode from local artifacts only; removed PageSpeed Insights, CrUX API, Chrome DevTools MCP, `npx` downloads and the `web-performance-auditor` subagent (not installed).
- `build.md`, `plan.md`, `review.md`, `spec.md`: only the namespace change.

## Updating

Review `git diff a06bc63b3f8b829c14b0bbf53d99fefc39d58092 <new-sha> -- .claude/commands/`, re-apply the changes above, update commit and hashes here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

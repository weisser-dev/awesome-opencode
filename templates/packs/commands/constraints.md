---
description: Define and enforce this project's quality bar — interview, sane defaults, CONSTRAINTS.md
---

Invoke the constraint-driven-development skill.

$ARGUMENTS

Default behaviour with no arguments: set up constraints for this repository.

1. **Detect first.** Read package.json / pyproject.toml / go.mod, the test runner, existing lint configs, current coverage output, CI workflows, and the agent harness in use. Report what you found in two lines. Never ask for anything you can read.

2. **Interview, at most four questions.** One at a time, each with your best guess and a usable default so "I don't know" still produces a working config:
   - Which dimensions beyond the floor (coverage, security, performance, accessibility, architecture)
   - Block or warn when a check fails mid-task
   - Target numbers, or measure today's values and hold them
   - Slowest check tolerated before handing work back

3. **Write CONSTRAINTS.md** at the repo root with a Floor section, enforced numbers, measured-only metrics with today's values, and an exceptions table with owners and expiry dates. Every number needs a stated reason.

4. **Propose the tool each picked dimension needs; install nothing yourself.** A dimension with a number and no tool behind it is an aspiration. Present the exact install commands (pinned versions) and wait for the user's approval before anything is installed. Use the de facto tool so existing config keeps working: Semgrep for code scanning, gitleaks (always `--redact`) for secrets, osv-scanner for dependencies, axe-core for accessibility, Lighthouse for web vitals, size-limit for bundles, dependency-cruiser for boundaries, Stryker for assertion quality. Record the exact command next to each rule in CONSTRAINTS.md. Accessibility and performance need a running URL; if the project has none, say so and drop the dimension rather than inventing a check. Add the commands to package.json as check:fast / check:task / check:full. Tools that contact online services when they run (Semgrep registry rule packs, osv-scanner's vulnerability API, Lighthouse/axe against a deployed URL) go into CI only unless the user explicitly wants them locally; local checks must run offline.

5. **Place each check by cost.** Types, lint and secrets in the edit loop (seconds). Related tests and changed-line coverage at task end (under 90s). Everything else at review or in CI. Scope checks to the diff, not the whole repo.

6. **Point the agent at it.** Propose a line for the project's agent instructions (CLAUDE.md / AGENTS.md) telling agents to read CONSTRAINTS.md and never weaken it to make a change pass; add it only after the user agrees.

7. **Verify.** Run the locally installed constraints against the current branch. If anything fails that the user disagrees with, fix the constraint now rather than leaving a gate people will learn to ignore.

Sub-commands:
- `/constraints check` — run the current constraints against this branch and report
- `/constraints guard` — inspect the diff for a weakened bar: lowered thresholds, skipped or deleted tests, new suppression comments, unfinished stubs, new exceptions
- `/constraints ratchet` — record today's measured values as the floor that must not fall

<!-- Adapted from addyosmani/agent-skills .claude/commands/constraints.md (MIT, Copyright (c) 2025 Addy Osmani), commit a06bc63b3f8b829c14b0bbf53d99fefc39d58092. Changes: see commands/UPSTREAM.md in weisser-dev/agentic-skills. -->

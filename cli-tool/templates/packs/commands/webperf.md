---
description: Run a local web performance audit (static source review plus any local measurement artifacts)
---

Invoke the performance-optimization skill.

`/webperf` targets web applications specifically. Do not use it for utility libraries, CLIs, or server-only code with no browser-facing output.

$ARGUMENTS

## Determine the mode

**Deep mode** — only from local material the user provides or that already exists in the project:
- A Lighthouse JSON report file the user produced (for example with a project-installed Lighthouse: `npx --no-install lighthouse http://localhost:<port> --output json --output-path ./report.json`)
- A DevTools performance trace or HAR file exported by the user
- Local measurements from the `playwright-cli` skill against the local dev server (screenshots, console, requests)

Do not call online services (PageSpeed Insights, CrUX or other APIs), do not install Lighthouse or DevTools tooling, and do not add MCP servers. If deep mode would need any of that, say what the user could run locally and continue in quick mode.

**Quick mode** — default when none of the above is available. Scan the source for structural anti-patterns and label every finding as `potential impact`.

## Run the audit

Review the files, components, or diff under review (or the scope the user named), using the skill's checklist (`references/performance-checklist.md` in the performance-optimization skill). For deep mode, read the provided artifacts and cite only values that are actually in them.

## Output

- Scorecard with only sourced values (artifact + metric), never estimates presented as measurements
- Ranked findings: impact, location (file:line), fix
- Positive observations
- Recommendations, including CI budgets the team could add

<!-- Adapted from addyosmani/agent-skills .claude/commands/webperf.md (MIT, Copyright (c) 2025 Addy Osmani), commit a06bc63b3f8b829c14b0bbf53d99fefc39d58092. Changes: see commands/UPSTREAM.md in weisser-dev/agentic-skills. -->

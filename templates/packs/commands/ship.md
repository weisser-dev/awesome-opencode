---
description: Run the pre-launch checklist via parallel fan-out to three specialist reviews, then synthesize a go/no-go decision
---

Invoke the shipping-and-launch skill.

`/ship` is a **fan-out orchestrator**. It runs three specialist reviews in parallel against the current change, then merges their reports into a single go/no-go decision with a rollback plan. The reviews operate independently — no shared state, no ordering — which is what makes parallel execution safe and useful here.

`/ship` decides and documents. It does not deploy, push, run migrations or flip feature flags; those happen only when the user explicitly instructs it.

## Phase A — Parallel fan-out

If the harness can spawn subagents, start three in a single turn so they run in parallel. Use the user's own reviewer agents if they exist (e.g. `code-reviewer`, `security-auditor`, `test-engineer`); otherwise use general-purpose subagents with these briefs:

1. **Code review** — load the `code-review-and-quality` skill. Five-axis review (correctness, readability, architecture, security, performance) of the staged changes or recent commits. Output Critical / Important / Suggestion findings with file:line.
2. **Security audit** — load the `security-and-hardening` skill. Vulnerability and threat-model pass: OWASP Top 10, secrets handling, auth/authz, dependency risk (from the lockfile and existing CI results; no network audits without the user's consent). Output findings by severity with file:line.
3. **Test coverage** — load the `test-driven-development` skill. Coverage analysis for the change: happy path, edge cases, error paths, concurrency. Output gaps with suggested tests.

Subagents must not spawn further subagents. Each returns only its report.

Without subagent support, run the three reviews sequentially in the main session and treat the outputs as if returned in parallel — the merge phase still works.

## Phase B — Merge in main context

Once all three reports are back, the main agent synthesizes them:

1. **Code Quality** — Aggregate Critical/Important findings and any failing tests, lint, or build output. Resolve duplicates between reviewers.
2. **Security** — Promote any Critical/High security findings to launch blockers. Cross-reference with the code review's security axis.
3. **Performance** — Pull from the code review's performance axis; cross-check Core Web Vitals if applicable (local measurements only).
4. **Accessibility** — Verify keyboard nav, screen reader support, contrast (use the shipping-and-launch accessibility checklist).
5. **Infrastructure** — Env vars, migrations, monitoring, feature flags. Verify by reading config; change nothing.
6. **Documentation** — README, ADRs, changelog. Verify directly.

## Phase C — Decision and rollback

Produce a single output:

```markdown
## Ship Decision: GO | NO-GO

### Blockers (must fix before ship)
- [Source review: Critical finding + file:line]

### Recommended fixes (should fix before ship)
- [Source review: Important finding + file:line]

### Acknowledged risks (shipping anyway)
- [Risk + mitigation]

### Rollback plan
- Trigger conditions: [what signals would prompt rollback]
- Rollback procedure: [exact steps, executed by the user or on the user's explicit instruction]
- Recovery time objective: [target]

### Specialist reports (full)
- [code review report]
- [security audit report]
- [test coverage report]
```

## Rules

1. The three Phase A reviews run in parallel when the harness supports it.
2. Reviews do not call each other. The main agent merges in Phase B.
3. The rollback plan is mandatory before any GO decision.
4. If any review returns a Critical finding, the default verdict is NO-GO unless the user explicitly accepts the risk.
5. **Skip the fan-out only if all of the following are true:** the change touches 2 files or fewer, the diff is under 50 lines, and it does not touch auth, payments, data access, or config/env. Otherwise, default to fan-out.

<!-- Adapted from addyosmani/agent-skills .claude/commands/ship.md (MIT, Copyright (c) 2025 Addy Osmani), commit a06bc63b3f8b829c14b0bbf53d99fefc39d58092. Changes: see commands/UPSTREAM.md in weisser-dev/agentic-skills. -->

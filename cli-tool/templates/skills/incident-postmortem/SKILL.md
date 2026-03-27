---
name: incident-postmortem
description: Guide creation of blameless postmortem with timeline, root cause analysis, impact assessment, and action items
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: general
---

## What I do

- Guide the creation of a blameless incident postmortem
- Structure a precise timeline from detection to resolution
- Facilitate root cause analysis using the 5 Whys technique
- Quantify impact across users, revenue, and SLA metrics
- Generate action items with owners and due dates

## When to use me

Use this skill when you need to:
- Document a production incident after resolution
- Conduct a root cause analysis for a service outage
- Create a structured postmortem for stakeholder review
- Generate action items to prevent recurrence
- Prepare for an incident review meeting

## Process

1. **Gather context**: Collect incident details
   - When was the issue detected? By whom or what (alert, user report)?
   - What services/systems were affected?
   - When was it resolved? What was the resolution?

2. **Build timeline**: Construct minute-by-minute chronology
   - Detection time and method
   - Key investigation steps
   - Escalation points
   - Mitigation actions taken
   - Resolution confirmation

3. **Root cause analysis**: Apply the 5 Whys
   - Start with the observable failure
   - Ask "Why?" iteratively until the systemic cause is reached
   - Distinguish between proximate cause and root cause
   - Identify contributing factors

4. **Assess impact**: Quantify the blast radius
   - Number of users affected
   - Duration of impact
   - Revenue impact if applicable
   - SLA/SLO violations
   - Data loss or integrity issues

5. **Draft action items**: Concrete follow-ups to prevent recurrence
   - Each item has an owner and a due date
   - Categorize: prevent, detect, mitigate, process

6. **Write the postmortem**: Assemble into the template below

## Postmortem Template

```markdown
# Incident Postmortem: [Title]

**Date:** YYYY-MM-DD
**Severity:** SEV-1 / SEV-2 / SEV-3
**Duration:** X hours Y minutes
**Authors:** [names]
**Status:** Draft / Reviewed / Complete

## Summary

One paragraph describing what happened, the impact, and how it was resolved.

## Impact

- **Users affected:** N
- **Duration:** HH:MM
- **SLO impact:** e.g., availability dropped to 99.2% against 99.9% target
- **Revenue impact:** $X (if applicable)

## Timeline (all times UTC)

| Time  | Event |
|-------|-------|
| 14:03 | Alert fired: error rate > 5% on payments-service |
| 14:07 | On-call engineer acknowledged |
| ...   | ...   |
| 15:22 | Root cause identified |
| 15:45 | Fix deployed, metrics recovering |
| 16:00 | Incident resolved |

## Root Cause Analysis (5 Whys)

1. **Why** did payments fail? → Database connection pool exhausted
2. **Why** was the pool exhausted? → Long-running queries holding connections
3. **Why** were queries long-running? → Missing index on new column
4. **Why** was the index missing? → Migration did not include index
5. **Why** was this not caught? → No query performance test in CI

**Root cause:** Missing database index combined with lack of query performance testing.

## Contributing Factors

- Deployment happened Friday afternoon with reduced staffing
- Alert thresholds were too lenient, delaying detection

## Action Items

| ID | Action | Type | Owner | Due |
|----|--------|------|-------|-----|
| 1  | Add index to payments table | Prevent | @eng | YYYY-MM-DD |
| 2  | Add query performance tests to CI | Prevent | @eng | YYYY-MM-DD |
| 3  | Tighten error rate alert threshold | Detect | @sre | YYYY-MM-DD |
| 4  | Add connection pool exhaustion alert | Detect | @sre | YYYY-MM-DD |
| 5  | Document deploy freeze policy for Fridays | Process | @lead | YYYY-MM-DD |

## Lessons Learned

- What went well
- What went poorly
- Where we got lucky
```

## Rules

- Always blameless: focus on systems and processes, never individuals
- Timelines must use UTC and be as precise as possible
- Every action item must have exactly one owner
- Distinguish between root cause and contributing factors
- Review the postmortem with all involved parties before finalizing

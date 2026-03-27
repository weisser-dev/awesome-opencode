---
name: adr-write
description: Create Architecture Decision Records using the Michael Nygard template with context, decision, alternatives, and consequences
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: general
---

## What I do

- Create Architecture Decision Records (ADRs) following the Michael Nygard template
- Document the context, decision drivers, and constraints
- Enumerate considered alternatives with pros and cons
- Articulate consequences (positive, negative, and neutral)
- Assign a sequential ADR number and manage status lifecycle

## When to use me

Use this skill when you need to:
- Document a significant architectural or technical decision
- Evaluate alternatives for a technology choice
- Record why a specific approach was chosen over others
- Create a decision log for a new or existing project
- Revisit or supersede a previous architectural decision

## Process

1. **Discover**: Check for existing ADRs in the project
   - Look for `doc/adr/`, `docs/adr/`, `docs/decisions/`, or `adr/` directories
   - Identify the numbering scheme and naming convention
   - Read recent ADRs to match the project's style

2. **Gather context**: Understand the decision to be made
   - What is the problem or requirement driving this decision?
   - What are the constraints (technical, organizational, timeline)?
   - Who are the stakeholders?

3. **Enumerate alternatives**: List all viable options
   - For each option, document pros, cons, and trade-offs
   - Include the "do nothing" option when relevant
   - Reference benchmarks, documentation, or prior art

4. **Draft the ADR**: Write using the template below

5. **Assign number and status**: Follow the project's convention
   - Number sequentially: `0001`, `0002`, etc.
   - Set initial status to `Proposed` or `Accepted`

6. **File the ADR**: Save to the project's ADR directory
   - Filename: `NNNN-short-title.md` (e.g., `0012-use-postgresql.md`)

## ADR Template

```markdown
# ADR-NNNN: Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXXX

## Context

Describe the forces at play. What is the issue that motivates this decision?
Include technical context, business requirements, and constraints.

## Decision Drivers

- Driver 1 (e.g., performance requirements)
- Driver 2 (e.g., team expertise)
- Driver 3 (e.g., operational cost)

## Considered Alternatives

### Option A: [Name]
- **Pros:** ...
- **Cons:** ...

### Option B: [Name]
- **Pros:** ...
- **Cons:** ...

### Option C: [Name]
- **Pros:** ...
- **Cons:** ...

## Decision

State the decision clearly: "We will use [Option X] because..."

## Consequences

### Positive
- Benefit 1
- Benefit 2

### Negative
- Trade-off 1
- Trade-off 2

### Neutral
- Observation that is neither positive nor negative

## References

- [Link to relevant documentation]
- [Link to benchmark results]
```

## ADR Status Lifecycle

```
Proposed -> Accepted -> (Deprecated | Superseded by ADR-XXXX)
```

- **Proposed**: Under discussion, not yet agreed upon
- **Accepted**: Decision has been agreed upon and is in effect
- **Deprecated**: Decision is no longer relevant
- **Superseded**: A newer ADR replaces this one (link to it)

## Rules

- One decision per ADR; do not combine multiple decisions
- ADRs are immutable once accepted; create a new ADR to change a decision
- Always include at least two alternatives (including the chosen one)
- Write in neutral, factual tone; avoid advocacy language
- Keep ADRs concise: aim for 1-2 pages maximum
- Link to related ADRs when decisions are connected
- Store ADRs in version control alongside the code they describe

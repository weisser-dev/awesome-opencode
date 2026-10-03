---
description: Start spec-driven development — write a structured specification before writing code
---

Invoke the spec-driven-development skill.

Begin by understanding what the user wants to build. Ask clarifying questions about:
1. The objective and target users
2. Core features and acceptance criteria
3. Tech stack preferences and constraints
4. Known boundaries (what to always do, ask first about, and never do)

Then generate a structured spec covering all six core areas: objective, commands, project structure, code style, testing strategy, and boundaries.

If the request bundles several independently testable capabilities, first propose a capability map (module ids, dependency direction, build order) per the skill's Phase 0 and get it approved, then spec each module in dependency order.

Save the spec as SPEC.md in the project root and confirm with the user before proceeding.

<!-- Adapted from addyosmani/agent-skills .claude/commands/spec.md (MIT, Copyright (c) 2025 Addy Osmani), commit a06bc63b3f8b829c14b0bbf53d99fefc39d58092. Changes: see commands/UPSTREAM.md in weisser-dev/agentic-skills. -->

---
description: Simplify code for clarity and maintainability — reduce complexity without changing behavior
---

Invoke the code-simplification skill.

Simplify recently changed code (or the specified scope) while preserving exact behavior:

1. Read the project's agent instructions (CLAUDE.md / AGENTS.md) and study project conventions
2. Identify the target code — recent changes unless a broader scope is specified
3. Understand the code's purpose, callers, edge cases, and test coverage before touching it
4. Scan for simplification opportunities:
   - Deep nesting → guard clauses or extracted helpers
   - Long functions → split by responsibility
   - Nested ternaries → if/else or switch
   - Generic names → descriptive names
   - Duplicated logic → shared functions
   - Dead code → remove after confirming
5. Apply each simplification incrementally — run tests after each change
6. Verify all tests pass, the build succeeds, and the diff is clean

If tests fail after a simplification, revert that change and reconsider. Use `code-review-and-quality` to review the result.

<!-- Adapted from addyosmani/agent-skills .claude/commands/code-simplify.md (MIT, Copyright (c) 2025 Addy Osmani), commit a06bc63b3f8b829c14b0bbf53d99fefc39d58092. Changes: see commands/UPSTREAM.md in weisser-dev/agentic-skills. -->

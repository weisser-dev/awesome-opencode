---
name: error-triage
description: Parse stack traces and error logs to identify root cause, find related code, and suggest fixes with severity classification
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: general
---

## What I do

- Parse stack traces, error logs, and exception output
- Identify the root cause and distinguish it from symptoms
- Locate the relevant source code files and lines
- Classify severity and assess blast radius
- Suggest concrete fixes with code examples

## When to use me

Use this skill when you need to:
- Debug a stack trace or error message from production or development
- Triage an error report from a monitoring system
- Understand why a specific exception is being thrown
- Get a quick diagnosis and fix suggestion for a failing test or build

## Process

1. **Parse the error**: Extract structured information
   - Error type/class (e.g., `NullPointerException`, `TypeError`, `ConnectionRefused`)
   - Error message text
   - Stack trace frames (file, line number, function name)
   - Originating frame vs. propagation frames
   - Relevant context (request URL, input data, environment)

2. **Identify the root frame**: Find where the error originates
   - Filter out framework and library frames
   - Focus on application code in the stack trace
   - Identify the first application frame where the error was thrown

3. **Read the source code**: Examine the relevant code
   - Read the file and function where the error originates
   - Check for obvious issues (null access, type mismatch, missing config)
   - Look at recent changes to the file (`git log -5 <file>`)

4. **Classify the error**: Determine type and severity

5. **Diagnose root cause**: Explain why the error occurs
   - What condition triggers it?
   - Is it a code bug, configuration issue, or environment problem?
   - Can it be reproduced reliably?

6. **Suggest fix**: Provide a concrete remediation

## Error Classification

### By Severity

| Severity | Criteria | Response |
|----------|----------|----------|
| **Critical** | Data loss, security breach, full outage | Immediate fix required |
| **High** | Feature broken for all users, degraded performance | Fix within hours |
| **Medium** | Feature broken for some users, workaround exists | Fix within days |
| **Low** | Cosmetic, non-blocking, edge case | Fix in next sprint |

### By Category

| Category | Examples | Typical Cause |
|----------|----------|---------------|
| **Null/Undefined** | NPE, TypeError: undefined | Missing null check, uninitialized variable |
| **Type Mismatch** | ClassCastException, TypeError | Wrong type passed, serialization issue |
| **Connection** | ConnectionRefused, Timeout | Service down, wrong config, network |
| **Authentication** | 401, 403, InvalidToken | Expired token, wrong credentials, permissions |
| **Validation** | 400, ValidationError | Invalid input, schema mismatch |
| **Resource** | OOM, disk full, file not found | Resource exhaustion, missing file |
| **Concurrency** | Deadlock, race condition | Shared state, missing synchronization |
| **Configuration** | Missing env var, invalid config | Missing or incorrect configuration |

## Diagnosis Output Format

```markdown
## Error Diagnosis

**Error:** `TypeError: Cannot read property 'id' of undefined`
**File:** `src/services/user-service.ts:47`
**Severity:** High
**Category:** Null/Undefined

### Root Cause

The `getUser()` function returns `undefined` when the user is not found in the
database, but the caller at line 47 accesses `.id` without a null check.

### Stack Trace Analysis

| # | Location | Notes |
|---|----------|-------|
| 1 | `src/services/user-service.ts:47` | **Root frame** - `.id` access on undefined |
| 2 | `src/handlers/order.ts:23` | Caller that passes userId |
| 3 | `src/routes/api.ts:15` | Route handler |

### Suggested Fix

\`\`\`typescript
// Before
const userName = getUser(userId).id;

// After
const user = getUser(userId);
if (!user) {
  throw new NotFoundError(`User ${userId} not found`);
}
const userName = user.id;
\`\`\`

### Related Considerations

- Check if other callers of `getUser()` have the same issue
- Consider making `getUser()` throw instead of returning undefined
- Add a test case for the "user not found" scenario
```

## Common Patterns

### JavaScript/TypeScript
- `Cannot read property 'x' of undefined` -> null check missing
- `is not a function` -> wrong import, wrong type, or typo
- `ECONNREFUSED` -> target service not running

### Java
- `NullPointerException` -> null check missing, use Optional
- `ClassNotFoundException` -> missing dependency or classpath issue
- `OutOfMemoryError` -> memory leak or undersized heap

### Python
- `AttributeError: 'NoneType'` -> null check missing
- `ImportError` -> missing package or circular import
- `KeyError` -> missing dict key, use `.get()` with default

## Rules

- Always read the actual source code before diagnosing; do not guess
- Distinguish between the root cause and downstream symptoms
- Check recent git history for the file to see if a recent change caused it
- Suggest defensive fixes (null checks, validation) even if the upstream bug is also fixed
- If the error is environment-specific, note the environment details
- Provide a test case suggestion that would catch the bug

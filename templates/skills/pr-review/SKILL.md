---
name: pr-review
description: Structured pull request review with checklist, security scan, and actionable feedback
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: github
---

## What I do

- Perform a structured review of pull request changes
- Check against a standard review checklist
- Identify security, performance, and maintainability issues
- Provide actionable feedback with severity ratings

## When to use me

Use this skill when reviewing a PR or when asked to check code changes before merging.

## Review Checklist

### Code Quality
- [ ] Code follows project style guide
- [ ] No unnecessary complexity
- [ ] Functions/methods are reasonably sized
- [ ] Clear naming conventions
- [ ] No code duplication

### Security
- [ ] No hardcoded secrets or credentials
- [ ] Input validation in place
- [ ] No SQL injection or XSS vulnerabilities
- [ ] Proper authentication/authorization checks

### Testing
- [ ] New code has tests
- [ ] Edge cases covered
- [ ] Tests are readable and maintainable
- [ ] No flaky test patterns

### Performance
- [ ] No N+1 queries
- [ ] Appropriate caching
- [ ] No unnecessary memory allocations
- [ ] No blocking operations in async contexts

### Documentation
- [ ] Public APIs documented
- [ ] Complex logic has comments
- [ ] README updated if needed
- [ ] Breaking changes documented

## Feedback Format

```
### [Severity: Critical/Warning/Suggestion] Title

**File:** `path/to/file.ts:42`

**Issue:** Clear description of the problem.

**Suggestion:**
\`\`\`diff
- old code
+ new code
\`\`\`
```

## Process

1. Read the PR description to understand intent
2. Review the diff file by file
3. Check against the review checklist
4. Write findings sorted by severity
5. Provide an overall summary with approval recommendation

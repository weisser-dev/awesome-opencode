---
name: dependency-audit
description: Scan dependencies for CVEs, outdated packages, license issues, and unused deps to produce a prioritized remediation list
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: general
---

## What I do

- Scan project dependencies for known CVEs and security advisories
- Identify outdated packages with available updates
- Detect license incompatibilities against project license
- Find unused or phantom dependencies
- Produce a prioritized remediation list sorted by severity

## When to use me

Use this skill when you need to:
- Audit dependencies before a release or compliance review
- Investigate a security advisory affecting your supply chain
- Clean up unused dependencies to reduce attack surface
- Verify license compatibility for open-source distribution
- Perform periodic dependency hygiene

## Process

1. **Detect**: Identify package manager and lockfiles
   - `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` (Node.js)
   - `requirements.txt` / `poetry.lock` / `Pipfile.lock` (Python)
   - `pom.xml` / `build.gradle` (Java)
   - `go.sum` (Go)
   - `Cargo.lock` (Rust)

2. **Scan for vulnerabilities**: Run the appropriate audit command
   ```bash
   # Node.js
   npm audit --json
   # Python
   pip-audit --format=json
   # Go
   govulncheck ./...
   ```

3. **Check for outdated packages**: List packages behind latest
   ```bash
   npm outdated --json
   pip list --outdated --format=json
   ```

4. **Detect unused dependencies**: Cross-reference imports against declared deps
   - Search source files for actual import/require statements
   - Compare against declared dependencies
   - Flag any dependency not referenced in source code

5. **License audit**: Extract license from each dependency
   - Flag copyleft licenses (GPL, AGPL) in permissive-licensed projects
   - Flag unknown or missing license declarations
   - Note dual-licensed packages

6. **Prioritize findings**: Produce a remediation table

## Output Format

```markdown
## Dependency Audit Report

### Critical Vulnerabilities
| Package | Version | CVE | Severity | Fix Version |
|---------|---------|-----|----------|-------------|
| example | 1.2.3   | CVE-2024-XXXXX | Critical | 1.2.4 |

### Outdated Packages
| Package | Current | Latest | Type |
|---------|---------|--------|------|
| example | 1.0.0   | 2.0.0  | Major |

### License Issues
| Package | License | Issue |
|---------|---------|-------|
| example | GPL-3.0 | Incompatible with MIT project |

### Unused Dependencies
- `unused-pkg` — not imported anywhere in source
```

## Severity Classification

- **Critical**: Actively exploited CVE or critical severity CVSS >= 9.0
- **High**: High severity CVE (CVSS 7.0-8.9) or copyleft license violation
- **Medium**: Moderate CVE (CVSS 4.0-6.9) or major version behind
- **Low**: Minor version behind or informational license note

## Rules

- Always check both direct and transitive dependencies
- Prefer patching over major upgrades when resolving CVEs
- Flag if a lockfile is missing or out of sync with the manifest
- Recommend pinning versions if not already done
- Never suppress a critical or high finding without justification

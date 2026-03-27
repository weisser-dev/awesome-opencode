---
name: env-setup
description: Bootstrap developer environment by detecting project type, listing prerequisites, generating .env.example, and producing a Getting Started guide
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: general
---

## What I do

- Detect the project type, language, and framework from repo contents
- Identify all required prerequisites (runtimes, databases, tools)
- Generate a `.env.example` file with all required environment variables
- Produce a Getting Started guide with step-by-step setup instructions
- Verify the environment is correctly configured

## When to use me

Use this skill when you need to:
- Onboard a new developer to a project
- Document the local development setup process
- Create or update `.env.example` with missing variables
- Troubleshoot a broken local development environment
- Standardize development environment across the team

## Process

1. **Detect project type**: Scan repository for configuration files
   - `package.json` -> Node.js (check for `next`, `react`, `express`, etc.)
   - `pom.xml` / `build.gradle` -> Java (check for Spring Boot, Quarkus)
   - `requirements.txt` / `pyproject.toml` -> Python (check for Django, Flask)
   - `go.mod` -> Go
   - `Cargo.toml` -> Rust
   - `docker-compose.yml` -> Containerized services

2. **Identify prerequisites**: List everything needed
   - Runtime version (check `.node-version`, `.python-version`, `.tool-versions`)
   - Package manager (`npm`, `yarn`, `pnpm`, `maven`, `pip`, `poetry`)
   - Databases and services (scan docker-compose, connection strings)
   - External tools (Docker, Redis, Elasticsearch, etc.)
   - CLI tools referenced in scripts

3. **Generate `.env.example`**: Extract all environment variables
   - Scan source for `process.env.*`, `os.environ`, `System.getenv`
   - Scan existing `.env` files (redact actual values)
   - Scan docker-compose for environment variables
   - Categorize: required vs. optional, with sensible defaults

4. **Produce Getting Started guide**: Write step-by-step instructions

5. **Verify setup**: Provide verification commands

## `.env.example` Format

```bash
# =============================================================================
# Application
# =============================================================================
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# =============================================================================
# Database
# =============================================================================
# Required: PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/myapp_dev

# =============================================================================
# Authentication
# =============================================================================
# Required: Generate with `openssl rand -base64 32`
JWT_SECRET=replace-with-generated-secret
JWT_EXPIRY=3600

# =============================================================================
# External Services (optional in development)
# =============================================================================
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASSWORD=

# =============================================================================
# Feature Flags
# =============================================================================
ENABLE_CACHE=false
ENABLE_RATE_LIMIT=false
```

## Getting Started Template

```markdown
# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) v20+ (check with `node --version`)
- [Docker](https://www.docker.com/) v24+ (check with `docker --version`)
- [Git](https://git-scm.com/) v2.40+

## Setup

1. Clone the repository:
   \`\`\`bash
   git clone <repo-url>
   cd <project-name>
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your local values
   \`\`\`

4. Start infrastructure services:
   \`\`\`bash
   docker compose up -d
   \`\`\`

5. Run database migrations:
   \`\`\`bash
   npm run db:migrate
   \`\`\`

6. Seed development data (optional):
   \`\`\`bash
   npm run db:seed
   \`\`\`

7. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Verify

- Application: http://localhost:3000
- API docs: http://localhost:3000/api-docs
- Health check: `curl http://localhost:3000/health`

## Common Issues

| Problem | Solution |
|---------|----------|
| Port already in use | Change `PORT` in `.env` or kill the process on that port |
| Database connection refused | Ensure Docker is running: `docker compose ps` |
| Missing environment variable | Compare `.env` with `.env.example` |
```

## Rules

- Never include real secrets or credentials in `.env.example`
- Always include comments explaining what each variable does
- Mark required vs. optional variables clearly
- Provide sensible development defaults where possible
- Test the Getting Started guide on a clean machine when feasible
- Include version requirements for all prerequisites
- Document platform-specific steps (macOS, Linux, Windows) if they differ

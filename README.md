# OpenCode Best Practices

The most comprehensive collection of agents, skills, and tooling for [OpenCode](https://opencode.ai) -- the open-source AI coding agent.

**108 agents** | **15 skills** | **3 skill packs** | **18 curated MCP servers** | **Live MCP registry search** | **Smart model detection**

> Inspired by [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents), fully adapted for OpenCode with permissions, skills, and markdown agent format.

---

## Quickstart

```bash
npx @weisser-dev/awesome-opencode
```

One command. It analyzes your project, walks you through agent/skill/model/MCP setup interactively, generates everything, and launches OpenCode.

---

## What it Does

```shell
  Awesome OpenCode
  108 agents, 15 skills, 3 skill packs, smart model config
  https://github.com/weisser-dev/awesome-opencode

? How would you like to set up your project?
❯ Auto-detect languages (recommended for existing projects)
  Select languages manually (recommended for fresh projects)

✔ Project analyzed

  Auto-detected:
    - TypeScript
    - Python

? Select project languages (2 detected / 28 total, scroll with arrows):
  ── Auto-Detected (2) ──
    ◉ JavaScript / TypeScript
    ◉ Python
  ── Other (26) ──
    ◯ Java
    ◯ Go
    ◯ Rust
    ...

? Select agents (12 recommended / 108 total, scroll with arrows):
  ── Recommended for your project (12/108) ──
    ◉ code-reviewer - Code quality review (default)
    ◉ test-writer - Test generation (default)
    ◉ devops-engineer - CI/CD pipelines (default)
    ◉ typescript-pro - TypeScript specialist (JavaScript / TypeScript)
    ◉ python-pro - Python ecosystem master (Python)
    ◉ fastapi-developer - FastAPI async APIs (Python)
    ...
  ── Core Development (3) ──
    ◯ backend-developer
    ...
  (108 agents across 10 categories)

? Select skills (5 recommended / 15 total, scroll with arrows):
    ◉ git-release - Release notes and version bumps
    ◉ ci-pipeline - CI pipeline configuration
    ◉ dependency-audit - Audit dependencies for vulnerabilities
    ◉ test-patterns - Test generation following project conventions
    ◉ changelog-generate - Changelog generation from commit history
    ◯ pr-review
    ...

  Models found in your config:

    my-provider/eu.anthropic.claude-sonnet-4-6
      -> claude-sonnet-4 (anthropic) | Strong | Cost: $$$ | Coding: 90/100
    my-provider/eu.anthropic.claude-haiku-4-5-20251001-v1:0
      -> claude-haiku-4 (anthropic) | Fast   | Cost: $$  | Coding: 75/100
    my-provider/eu.anthropic.claude-opus-4-6-v1
      -> claude-opus-4 (anthropic) | Frontier | Cost: $$$$ | Coding: 95/100

? Model strategy:
❯ Auto-optimize YOUR models (Build: claude-opus-4, Plan/Explore: claude-haiku-4)
  Cost Optimized (Haiku for Plan/Explore, Sonnet for Build)
  Quality Focused (Opus for Build, Sonnet for others)
  OpenAI Stack
  Mixed
  Keep existing

? Select MCP servers (14 available for your languages, scroll with arrows):
  ── Universal ──
    ◉ context7 - Library documentation search
    ◉ git - Read, search, and manipulate Git repos
    ◯ memory - Persistent knowledge graph (official)
    ...
  ── Database ──
    ◯ postgres - PostgreSQL read-only access (official)
    ...

? Search mcp.so for additional MCP servers? Yes
? Search mcp.so: playwright
  Found 45 server(s) on mcp.so:
? Select servers to add (45 found, scroll with arrows):
    ◯ Playwright Mcp (microsoft)
    ...

? Apply recommended step limits per agent? (controls context/cost) Yes
  Code-writing agents: unlimited | Review agents: 10-15 | Fast agents: 5-10

✔ No AGENTS.md found. Generate one with project-specific rules? Yes

  Generated:
    .opencode/agents/ (5 agents)
    .opencode/skills/ (3 skills)
    opencode.json (updated)
    .opencode/advanced.json (state)
    AGENTS.md (generated)

  Setup complete!

? Run OpenCode in a sandbox? (Docker, recommended for enterprise) No
? Start OpenCode? Yes

  Starting OpenCode...
```

On **re-run**, it remembers your setup:

```shell
  Awesome OpenCode
  108 agents, 15 skills, 3 skill packs, smart model config
  https://github.com/weisser-dev/awesome-opencode

  Already configured!
  Last setup: 2026-03-27
  Languages:  node, python
  Agents:     code-reviewer, test-writer, typescript-pro, python-pro
  Skills:     git-release, ci-pipeline, dependency-audit
  Models:     auto

? What would you like to do?
❯ Start OpenCode
  Start OpenCode (Sandboxed via Docker)
  Reconfigure (run setup again)
  Configure agents
  Configure skills
  Configure models
  Configure MCP servers
  Exit
```

---

## Features

### 108 Agents in 10 Categories

<details>
<summary><strong>Core Development</strong> (8 agents)</summary>

| Agent | Description |
|-------|-------------|
| `api-designer` | REST/GraphQL API design and schema-first approach |
| `backend-developer` | Server-side expert for scalable APIs and backend systems |
| `frontend-developer` | UI/UX specialist for React, Vue, Angular and modern web |
| `fullstack-developer` | End-to-end feature development across frontend and backend |
| `graphql-architect` | GraphQL schema design, federation, and resolver patterns |
| `microservices-architect` | Distributed systems design and service decomposition |
| `mobile-developer` | Cross-platform mobile development |
| `websocket-engineer` | Real-time communication and event-driven systems |
</details>

<details>
<summary><strong>Language Specialists</strong> (22 agents)</summary>

| Agent | Description |
|-------|-------------|
| `angular-architect` | Angular 15+ enterprise patterns, signals, RxJS |
| `cpp-pro` | Modern C++20/23, RAII, templates, memory management |
| `csharp-developer` | ASP.NET Core, EF Core, LINQ, async patterns |
| `django-developer` | Django 4+ ORM, REST framework, Celery |
| `elixir-expert` | Elixir/OTP, GenServer, Phoenix, LiveView |
| `fastapi-developer` | FastAPI, Pydantic, dependency injection |
| `flutter-expert` | Flutter 3+ widgets, state management |
| `golang-pro` | Go concurrency, goroutines, channels, interfaces |
| `java-architect` | Enterprise Java, Spring patterns, JVM tuning |
| `javascript-pro` | ES2024+, async patterns, module systems |
| `kotlin-specialist` | Coroutines, Kotlin Multiplatform, DSLs |
| `laravel-specialist` | Laravel 10+ Eloquent, Livewire, queues |
| `nextjs-developer` | Next.js 14+ App Router, Server Actions, RSC |
| `php-pro` | PHP 8.x, Composer, PSR standards |
| `python-pro` | Python typing, asyncio, packaging |
| `react-specialist` | React 18+ hooks, server components, Suspense |
| `ruby-pro` | Ruby metaprogramming, Rails patterns |
| `rust-engineer` | Ownership, lifetimes, async Rust |
| `spring-boot-engineer` | Spring Boot 3+ WebFlux, Security, Data JPA |
| `swift-expert` | SwiftUI, Combine, async/await |
| `typescript-pro` | Strict typing, generics, utility types |
| `vue-expert` | Vue 3 Composition API, Pinia, Nuxt |
</details>

<details>
<summary><strong>Infrastructure</strong> (13 agents)</summary>

| Agent | Description |
|-------|-------------|
| `azure-infra-engineer` | Azure ARM/Bicep, AKS, Azure DevOps |
| `cloud-architect` | AWS/GCP/Azure multi-cloud architecture |
| `database-administrator` | DB replication, backup, recovery |
| `deployment-engineer` | Blue/green, canary, rollback automation |
| `devops-engineer` | CI/CD pipelines and build automation |
| `docker-expert` | Dockerfile optimization and container security |
| `incident-responder` | System incident triage and recovery |
| `kubernetes-specialist` | K8s, Helm, service mesh, cluster management |
| `network-engineer` | DNS, load balancing, firewalls |
| `platform-engineer` | Internal developer platform and golden paths |
| `security-engineer` | IAM, encryption, network segmentation |
| `sre-engineer` | SLI/SLO, observability, incident response |
| `terraform-engineer` | Infrastructure as Code with Terraform |
</details>

<details>
<summary><strong>Quality & Security</strong> (11 agents)</summary>

| Agent | Description |
|-------|-------------|
| `accessibility-tester` | WCAG 2.1 compliance and inclusive design |
| `architect-reviewer` | Architecture review and ADR creation |
| `chaos-engineer` | Resilience testing and failure injection |
| `code-reviewer` | Code quality, security, and performance review |
| `compliance-auditor` | GDPR, SOC2, HIPAA, and OSS license audit |
| `debugger` | Bug investigation and root cause analysis |
| `error-detective` | Systemic error pattern analysis |
| `penetration-tester` | OWASP testing and ethical hacking |
| `performance-engineer` | Performance profiling and optimization |
| `security-auditor` | Security vulnerability scanning |
| `test-automator` | E2E/integration test framework design |
</details>

<details>
<summary><strong>Data & AI</strong> (12 agents)</summary>

| Agent | Description |
|-------|-------------|
| `ai-engineer` | AI system design and deployment architecture |
| `data-analyst` | Data insights, visualization, BI |
| `data-engineer` | ETL/ELT pipelines, streaming, data lakes |
| `data-scientist` | Statistical analysis, predictive modeling |
| `database-optimizer` | Schema, query, and index optimization |
| `llm-architect` | RAG, fine-tuning, prompt engineering, evaluation |
| `machine-learning-engineer` | ML model training and optimization |
| `mlops-engineer` | ML deployment, monitoring, lifecycle |
| `nlp-engineer` | Tokenization, embeddings, transformers |
| `postgres-pro` | PostgreSQL advanced queries, extensions, tuning |
| `prompt-engineer` | Prompt optimization and chain-of-thought design |
| `sql-pro` | Window functions, CTEs, query optimization |
</details>

<details>
<summary><strong>Developer Experience</strong> (11 agents)</summary>

| Agent | Description |
|-------|-------------|
| `build-engineer` | Build systems (webpack, vite, esbuild, gradle) |
| `cli-developer` | Command-line tool design and implementation |
| `dependency-manager` | Dependency audit, CVEs, license checks |
| `docs-writer` | Technical documentation writer |
| `dx-optimizer` | Developer experience and workflow optimization |
| `git-workflow-manager` | Branching strategy and commit hygiene |
| `legacy-modernizer` | Incremental legacy codebase modernization |
| `mcp-developer` | MCP server development and integration |
| `refactorer` | Code refactoring with test verification |
| `test-writer` | Test generation following project patterns |
| `tooling-engineer` | Linters, formatters, IDE plugins |
</details>

<details>
<summary><strong>Specialized Domains</strong> (8 agents)</summary>

| Agent | Description |
|-------|-------------|
| `blockchain-developer` | Solidity, smart contracts, DeFi |
| `embedded-systems` | Firmware, RTOS, hardware interfaces |
| `fintech-engineer` | Payment processing, compliance, ledgers |
| `game-developer` | Game loops, physics, rendering |
| `iot-engineer` | MQTT, edge computing, sensor data |
| `mobile-app-developer` | Native iOS/Android, app store deployment |
| `payment-integration` | Stripe, PayPal, PCI compliance |
| `seo-specialist` | Technical SEO, Core Web Vitals |
</details>

<details>
<summary><strong>Business & Product</strong> (9 agents)</summary>

| Agent | Description |
|-------|-------------|
| `business-analyst` | Requirements, user stories, process analysis |
| `content-marketer` | Content strategy, SEO writing |
| `legal-advisor` | Software licensing and compliance |
| `product-manager` | Product strategy and roadmaps |
| `project-manager` | Project planning and timelines |
| `sales-engineer` | Technical demos and proof-of-concept |
| `scrum-master` | Agile ceremonies and sprint planning |
| `technical-writer` | API docs, tutorials, guides |
| `ux-researcher` | User research and usability testing |
</details>

<details>
<summary><strong>Meta & Orchestration</strong> (7 agents)</summary>

| Agent | Description |
|-------|-------------|
| `agent-organizer` | Multi-agent coordination and task routing |
| `context-manager` | Token optimization and context management |
| `error-coordinator` | Cross-system error handling and recovery |
| `knowledge-synthesizer` | Multi-source knowledge aggregation |
| `multi-agent-coordinator` | Complex workflow orchestration |
| `task-distributor` | Task allocation and load balancing |
| `workflow-orchestrator` | End-to-end workflow automation |
</details>

<details>
<summary><strong>Research & Analysis</strong> (7 agents)</summary>

| Agent | Description |
|-------|-------------|
| `competitive-analyst` | Competitive intelligence and positioning |
| `data-researcher` | Dataset evaluation and statistical analysis |
| `market-researcher` | Market analysis and consumer insights |
| `research-analyst` | Comprehensive research and source evaluation |
| `scientific-literature-researcher` | Paper search and evidence synthesis |
| `search-specialist` | Advanced information retrieval |
| `trend-analyst` | Technology trend forecasting |
</details>

### 15 Skills

| Skill | Description |
|-------|-------------|
| `git-release` | Release notes and semantic version bumps |
| `pr-review` | Structured PR review checklist |
| `migration` | Database/framework migration with rollback |
| `test-patterns` | Test generation following project conventions |
| `deploy` | CI/CD pipeline and deployment setup |
| `dependency-audit` | CVE scan, license check, unused dependencies |
| `incident-postmortem` | Blameless postmortem with 5 Whys |
| `docker-optimize` | Dockerfile multi-stage and security hardening |
| `adr-write` | Architecture Decision Records (Nygard template) |
| `api-contract` | OpenAPI/AsyncAPI spec generation and validation |
| `changelog-generate` | CHANGELOG.md from git history (Keep a Changelog) |
| `ci-pipeline` | CI/CD config generation (GitHub Actions, GitLab CI) |
| `env-setup` | Developer environment bootstrap |
| `error-triage` | Stack trace parsing and root cause classification |
| `performance-profile` | Performance hotspot analysis and optimization plan |

### Skill Packs (design / process / behavior)

Reviewed third-party skill collections, adapted for local use and pinned to exact upstream
commits. Source of truth, review notes and adaptation tooling:
[weisser-dev/agentic-skills](https://github.com/weisser-dev/agentic-skills/tree/main/packs).

| Pack | Contents | In `--pack all` |
|------|----------|-----------------|
| `design` | Frontend design: `design-workflow`, `web-design-guidelines` (vendored Web Interface Guidelines), taste skills (`design-taste-frontend`, `redesign-existing-projects`, `minimalist-ui`, `high-end-visual-design`, `industrial-brutalist-ui`), `image-to-code`, `design-md-reference` (72 DESIGN.md references), `playwright-cli` (local screenshots); opt-in: `gpt-taste`, `full-output-enforcement` | yes |
| `process` | 23 engineering lifecycle skills + commands `/spec` `/plan` `/build` `/test` `/constraints` `/review` `/webperf` `/code-simplify` `/ship` (from addyosmani/agent-skills, adapted) | yes |
| `behavior` | `ponytail` minimal-code mode (+ review/audit/debt/help) | no, opt-in |

```bash
npx @weisser-dev/awesome-opencode packs --list               # packs and items
npx @weisser-dev/awesome-opencode packs --dry-run            # plan for the design pack
npx @weisser-dev/awesome-opencode packs                      # design pack -> ./.opencode/skills
npx @weisser-dev/awesome-opencode packs --pack all           # design + process (skills + commands)
npx @weisser-dev/awesome-opencode packs --pack behavior      # ponytail, only if you want it
npx @weisser-dev/awesome-opencode packs --pack all --global  # ~/.config/opencode/{skills,commands}
npx @weisser-dev/awesome-opencode design-pack                # alias for "packs --pack design"
```

The interactive menu offers the same under **Install skill packs**, and the full setup asks once
at the end. Skills go to `.opencode/skills/<name>/SKILL.md` (or `~/.config/opencode/skills/`),
commands to `.opencode/commands/<name>.md` (or `~/.config/opencode/commands/`), the locations
OpenCode scans. Re-running is safe: unchanged items are skipped; items you edited are only
replaced with `--force` (the old version is kept in `.agentic-pack-backups/`).

Notes: the ponytail figures (fewer lines, lower cost) are the upstream author's own benchmarks
and the mode can reduce thoroughness, so it is never installed by default. `playwright-cli` needs
`@playwright/cli` as a pinned dev dependency of your project
(`npm install --save-dev --save-exact @playwright/cli@0.1.22`); the skill never installs it.

#### Security model

- Bundled items (our own skills and the reviewed, adapted copies) are copied from the package; no network.
- The few items that are installed unmodified from upstream (two taste skills, the opt-in output skill,
  the DESIGN.md references, four ponytail skills) are downloaded only from
  `raw.githubusercontent.com` for the repository and commit pinned in
  `templates/packs/sources.lock.json`, and every file must match its sha256 pin before anything is written.
- Nothing is executed: no upstream scripts, hooks, plugins or MCP servers are installed.
- Installed skills and commands do not fetch anything, call external services or install tools at run time;
  pushes, deploys and migrations need an explicit instruction.
- No other sources are added without an explicit owner decision and a new review.

| Source | License | Pinned commit |
|--------|---------|---------------|
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | MIT | `ce26fc25` |
| [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | MIT | `e3d624ba` |
| [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | MIT | `f6961238` |
| [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) | Apache-2.0 | `b85c7a73` |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT | `a06bc63b` |
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | MIT | `c982cd41` |

### Smart Model Detection

The CLI recognizes models from **any provider** -- including custom Bedrock, Azure, or self-hosted endpoints:

```shell
abcd/eu.anthropic.claude-opus-4-6-v1     -> claude-opus-4   | Frontier | $$$$  | Coding: 95/100
abcd/eu.anthropic.claude-sonnet-4-6      -> claude-sonnet-4 | Strong   | $$$   | Coding: 90/100
abcd/eu.anthropic.claude-haiku-4-5       -> claude-haiku-4  | Fast     | $$    | Coding: 75/100
```

Supports 26+ model fingerprints across Anthropic, OpenAI, Google, DeepSeek, Meta, and Mistral.

**Agent-tier mapping** assigns the right model quality per agent type:
- **Frontier** (Opus, GPT-5.2, o3): Code-writing agents, language specialists
- **Strong** (Sonnet, GPT-5.1): Code review, architecture, security
- **Fast** (Haiku, Flash, mini): Exploration, docs, context management

### 18 Curated MCP Servers + Live Registry Search

| Category | Servers |
|----------|---------|
| **Universal** | context7, gh-grep, memory, fetch, sequential-thinking |
| **Git** | git |
| **Monitoring** | sentry, axiom |
| **Database** | postgres, sqlite, redis |
| **Cloud** | aws, kubernetes |
| **Deployment** | vercel |
| **Testing** | puppeteer |
| **Collaboration** | atlassian, linear |
| **Design** | figma |

MCP servers are **filtered by your selected languages** -- Terraform projects see AWS/K8s, Node projects see Vercel/Figma.

Plus: **live search** of the official MCP Registry (`registry.modelcontextprotocol.io`) to find and install any registered server.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Agents](docs/01-agents.md) | Primary & sub-agents, built-in vs. custom, markdown definitions, permissions |
| [Skills](docs/02-skills.md) | SKILL.md structure, examples, discovery mechanism |
| [MCP Servers](docs/03-mcp-servers.md) | Local & remote servers, OAuth, recommended servers |
| [Models](docs/04-models.md) | Model recommendations per task, token optimization, costs |
| [Rules](docs/05-rules.md) | AGENTS.md, custom instructions, project conventions |
| [Tools & Custom Tools](docs/06-tools-and-custom-tools.md) | Built-in tools, creating custom tools |
| [Permissions](docs/07-permissions.md) | Granular permissions, wildcards, per-agent config |

---

## Installation

### Via npx (recommended)

```bash
npx @weisser-dev/awesome-opencode
```

### Global install

```bash
npm install -g @weisser-dev/awesome-opencode
awesome-opencode
```

### CLI Subcommands

```bash
awesome-opencode                      # Interactive setup or re-run menu
awesome-opencode configure            # Reconfigure everything
awesome-opencode configure agents     # Add/remove agents
awesome-opencode configure skills     # Add/remove skills
awesome-opencode configure models     # Change model strategy
awesome-opencode configure mcp        # Add/remove MCP servers
awesome-opencode configure packs      # Choose and install skill packs interactively
awesome-opencode packs [options]      # Install skill packs (see "Skill Packs")
awesome-opencode design-pack          # Same as "packs --pack design"
awesome-opencode --help               # Show help
```

### Flags

```bash
awesome-opencode --config <path>      # Use external opencode.json
awesome-opencode --crt <path>         # Custom CA certificate (.crt/.pem)
awesome-opencode --skipSSL            # Disable TLS verification
```

Flags can be combined with subcommands and with each other:

```bash
# Corporate setup: custom cert + external config
awesome-opencode --crt /etc/ssl/corporate-ca.crt --config ~/shared/opencode.json

# Behind proxy with self-signed cert
awesome-opencode --skipSSL configure mcp

# All flags are forwarded into Docker sandbox automatically
awesome-opencode --crt /certs/ca.pem --skipSSL
```

### Sandboxed Mode (Docker)

Run OpenCode in an isolated Docker container where only the current project is accessible:

```shell
? Select dev environment (Docker image):
  ── Recommended for your project ──
    ❯ Java 21 + Maven (Spring Boot, enterprise)
      Java 21 + Gradle
  ── Other environments ──
      Node.js 22 (JavaScript, TypeScript)
      Python 3.13 (pip)
      ...
  ── General purpose ──
      Ubuntu 24.04 (apt available — install anything)
      Generic Node.js 22 (works for any project)

? Which LLM provider are you using?
❯ AWS Bedrock

? Configure corporate proxy? No
? Configure artifact registry (Nexus, JFrog, PyPI mirror)? Yes
? Select artifact registries:
    ◉ Nexus Repository (Maven)
? MAVEN_MIRROR_URL (required): https://nexus.example.com/repository/maven-public/

  Docker command:
  docker run -it --rm \
    -v "$PWD":"$PWD" \
    -w "$PWD" \
    -e AWS_BEARER_TOKEN_BEDROCK \
    -e AWS_REGION="eu-central-1" \
    -e MAVEN_MIRROR_URL="https://nexus.example.com/repository/maven-public/" \
    maven:3-eclipse-temurin-21 \
    bash -c "mkdir -p ~/.m2 && echo '<settings>...</settings>' > ~/.m2/settings.xml && apt-get install -y nodejs npm && npm i -g opencode-ai && opencode"

? Run this Docker command now? Yes
```

**20 supported dev environments** — all official images:

| Language | Image |
|----------|-------|
| Node.js 22 | `node:22` |
| Bun | `oven/bun:latest` |
| Python 3.13 | `python:3.13-slim` |
| Python + uv | `ghcr.io/astral-sh/uv:python3.13-bookworm-slim` |
| Java + Maven | `maven:3-eclipse-temurin-21` |
| Java + Gradle | `gradle:8-jdk21` |
| Kotlin | `openjdk:21-slim-bookworm` |
| Go 1.24 | `golang:1.24` |
| Rust | `rust:1-slim-bookworm` |
| Ruby 3.3 | `ruby:3.3-slim` |
| PHP 8.4 | `php:8.4-cli` |
| .NET 9 | `mcr.microsoft.com/dotnet/sdk:9.0` |
| Swift 6.1 | `swift:6.1` |
| Dart 3.7 | `dart:3.7` |
| Elixir 1.18 | `elixir:1.18-slim` |
| C/C++ | `gcc:14` |
| Terraform | `hashicorp/terraform:latest` |
| Ansible | `cytopia/ansible:latest` |
| Ubuntu 24.04 | `ubuntu:24.04` *(apt — install anything)* |
| Generic | `node:22` |

Supports 7 LLM providers: Anthropic, OpenAI, AWS Bedrock, Azure OpenAI, Google AI, OpenRouter, Custom.
Supports corporate proxy + artifact registries: Nexus (npm + Maven), JFrog (npm + Maven), PyPI mirror.

### Manual setup (without CLI)

```bash
# 1. Copy agents
mkdir -p .opencode/agents
cp templates/agents/code-reviewer.md .opencode/agents/
cp templates/agents/typescript-pro.md .opencode/agents/

# 2. Copy skills
mkdir -p .opencode/skills/git-release
cp templates/skills/git-release/SKILL.md .opencode/skills/git-release/

# 3. Copy config
cp templates/configs/cost-optimized.json opencode.json

# 4. Generate AGENTS.md
opencode    # then /init in the TUI
```

---

## Development

```bash
git clone https://github.com/weisser-dev/awesome-opencode
cd awesome-opencode/cli-tool
npm install
npm link

# Test in any project:
cd ~/my-project
awesome-opencode

# Run tests:
npm test

# Unlink when done:
npm unlink -g @weisser-dev/awesome-opencode
```

### Publishing to npm

```bash
cd cli-tool
npm run prepublishOnly   # sync templates from repo root
npm pack --dry-run       # verify contents
npm publish              # publish (requires npm login + org access)
```

---

## Project Structure

```
awesome-opencode/
  README.md                    # This file
  CHANGELOG.md                 # Release history
  AGENTS.md                    # Project rules for OpenCode
  LICENSE                      # MIT
  docs/                        # Comprehensive documentation (7 files)
  templates/
    agents/                    # 108 agent definitions (.md)
    skills/                    # 15 skill definitions (SKILL.md)
    configs/                   # 5 opencode.json presets
    packs/                     # skill packs: sources.lock.json + bundled skills/commands
  cli-tool/                    # @weisser-dev/awesome-opencode
    src/
      index.js                 # Entry point and flow control
      setup.js                 # Detection, prompts, generation (~1800 lines)
    templates/                 # Bundled copy for npm package
    scripts/
      sync-templates.js        # Pre-publish template sync
      import-packs.js          # Import packs from a weisser-dev/agentic-skills checkout
    package.json
```

---

## Inspiration & Credits

This project builds on the work of several open-source communities:

- **[VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)** -- The agent collection (127+ subagents) served as the primary inspiration. All agents were adapted for OpenCode with permissions, skill integration, and markdown format.
- **[darrenhinde/OpenAgentsControl](https://github.com/darrenhinde/OpenAgentsControl)** -- Agent configuration patterns and workflows.
- **[OpenCode Official Docs](https://opencode.ai/docs/)** -- Agents, skills, MCP, permissions, and configuration reference.
- **[pricepertoken.com](https://pricepertoken.com/leaderboards/coding)** -- Model benchmark rankings and pricing data for the model intelligence feature.
- **[models.dev](https://models.dev)** -- Open-source database of AI models (by anomalyco). Model fingerprints sourced from here.
- **[registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io)** -- Official MCP server registry API for live search.
- **Skill packs** -- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines), [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md), [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli), [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills), [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail); license texts ship with each skill.

## Also by weisser-dev

- **[agentic-ai.weisser.dev](https://agentic-ai.weisser.dev)** -- Free, ad-free self-learning platform for Agentic AI. Want to learn more about agents, MCP, and AI-assisted development? Start here.
- **[opencode-remote-telegram](https://github.com/weisser-dev/opencode-remote-telegram)** -- Control OpenCode remotely via Telegram. Run sessions from your phone.

## Resources

- [OpenCode Docs](https://opencode.ai/docs/)
- [OpenCode GitHub](https://github.com/anomalyco/opencode)
- [OpenCode Discord](https://opencode.ai/discord)
- [OpenCode Ecosystem](https://opencode.ai/docs/ecosystem/)
- [MCP Server Directory](https://mcp.so)
- [Official MCP Registry](https://registry.modelcontextprotocol.io)
- [pricepertoken.com](https://pricepertoken.com) -- LLM pricing and benchmarks
- [VoltAgent Subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)

## License

MIT

## Contributing

Pull requests welcome! Especially for:

- New agent templates (add to `templates/agents/` and `AVAILABLE_AGENTS` in setup.js)
- New skill definitions (add to `templates/skills/<name>/SKILL.md` and `AVAILABLE_SKILLS`)
- Framework-specific config presets
- Model fingerprint additions (new providers/models)
- MCP server recommendations
- Documentation improvements
- Translations

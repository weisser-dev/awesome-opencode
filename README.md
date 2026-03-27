# OpenCode Best Practices

The most comprehensive collection of agents, skills, and tooling for [OpenCode](https://opencode.ai) -- the open-source AI coding agent.

**108 agents** | **15 skills** | **18 curated MCP servers** | **Live MCP registry search** | **Smart model detection**

> Inspired by [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents), fully adapted for OpenCode with permissions, skills, and markdown agent format.

---

## Quickstart

```bash
npx @weisser-dev/awesome-opencode
```

One command. It analyzes your project, walks you through agent/skill/model/MCP setup interactively, generates everything, and launches OpenCode.

---

## What it Does

```
  OpenCode Advanced Setup
  Best practices for agents, skills, models & more
  https://github.com/weisser-dev/awesome-opencode

? How would you like to set up your project?
❯ Auto-detect languages (recommended for existing projects)
  Select languages manually (recommended for fresh projects)

✔ Project analyzed

  Auto-detected:
    - TypeScript
    - Python

? Select project languages: (space to toggle)
  ◉ JavaScript / TypeScript  (auto-detected)
  ◉ Python                   (auto-detected)
  ◯ Java
  ◯ Go
  ...

✔ Select agents to install:
  ── Core Development ──
    ◉ code-reviewer
    ◉ test-writer
    ◯ backend-developer
    ...
  ── Language Specialists ──
    ◯ typescript-pro
    ◯ python-pro
    ...
  (108 agents across 10 categories)

✔ Select skills to install:
    ◉ git-release
    ◉ ci-pipeline
    ◉ dependency-audit
    ...
  (15 skills)

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

✔ Select MCP servers (filtered by your languages):
  ── Universal ──
    ◉ context7 - Library documentation search
    ◯ memory - Persistent knowledge graph (official)
    ...
  ── Database ──
    ◯ postgres - PostgreSQL (official)
    ...

? Search the official MCP Registry for more servers? Yes
? Search MCP Registry: terraform
  Found 4 server(s):
    ◯ Terraform Cloud MCP (hashicorp/terraform-mcp@1.0.0)
    ...

✔ No AGENTS.md found. Generate one with project-specific rules? Yes

  Generated:
    .opencode/agents/ (5 agents)
    .opencode/skills/ (3 skills)
    opencode.json (updated)
    .opencode/advanced.json (state)
    AGENTS.md (generated)

  Setup complete!

? Start OpenCode now? Yes
```

On **re-run**, it remembers your setup:

```
  Already configured!
  Last setup: 2026-03-27
  Languages:  node, python
  Agents:     code-reviewer, test-writer, python-pro
  Skills:     git-release, ci-pipeline, dependency-audit
  Models:     auto

? What would you like to do?
❯ Start OpenCode
  Reconfigure (run setup again)
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

### Smart Model Detection

The CLI recognizes models from **any provider** -- including custom Bedrock, Azure, or self-hosted endpoints:

```
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
awesome-opencode --help               # Show help
```

### Sandboxed Mode (Docker)

Run OpenCode in an isolated Docker container where only the current project is accessible:

```
? Run OpenCode in a sandbox? (Docker, only this project accessible — recommended for enterprise) Yes

? Which LLM provider are you using?
❯ AWS Bedrock
  ...

  Docker command:
  docker run -it --rm \
    -v "$(pwd)":/workspace \
    -w /workspace \
    -e AWS_BEARER_TOKEN_BEDROCK \
    -e AWS_REGION="eu-central-1" \
    node:22 \
    bash -c "npm i -g opencode-ai && opencode"

? Run this Docker command now? Yes
```

Supports 7 providers: Anthropic, OpenAI, AWS Bedrock, Azure OpenAI, Google AI, OpenRouter, Custom.

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
  cli-tool/                    # @weisser-dev/awesome-opencode
    src/
      index.js                 # Entry point and flow control
      setup.js                 # Detection, prompts, generation (~1800 lines)
    templates/                 # Bundled copy for npm package
    scripts/
      sync-templates.js        # Pre-publish template sync
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

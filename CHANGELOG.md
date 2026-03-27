# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-03-27

### Added

**108 Agents across 10 categories** (up from 23):
- Core Development (8): api-designer, backend-developer, frontend-developer, fullstack-developer, graphql-architect, microservices-architect, mobile-developer, websocket-engineer
- Language Specialists (22): typescript-pro, javascript-pro, python-pro, java-architect, kotlin-specialist, golang-pro, rust-engineer, swift-expert, cpp-pro, csharp-developer, php-pro, ruby-pro, react-specialist, vue-expert, angular-architect, nextjs-developer, django-developer, fastapi-developer, spring-boot-engineer, laravel-specialist, flutter-expert, elixir-expert
- Infrastructure (13): azure-infra-engineer, cloud-architect, database-administrator, deployment-engineer, devops-engineer, docker-expert, incident-responder, kubernetes-specialist, network-engineer, platform-engineer, security-engineer, sre-engineer, terraform-engineer
- Quality & Security (11): accessibility-tester, architect-reviewer, chaos-engineer, code-reviewer, compliance-auditor, debugger, error-detective, penetration-tester, performance-engineer, security-auditor, test-automator
- Data & AI (12): ai-engineer, data-analyst, data-engineer, data-scientist, database-optimizer, llm-architect, machine-learning-engineer, mlops-engineer, nlp-engineer, postgres-pro, prompt-engineer, sql-pro
- Developer Experience (11): build-engineer, cli-developer, dependency-manager, docs-writer, dx-optimizer, git-workflow-manager, legacy-modernizer, mcp-developer, refactorer, test-writer, tooling-engineer
- Specialized Domains (8): blockchain-developer, embedded-systems, fintech-engineer, game-developer, iot-engineer, mobile-app-developer, payment-integration, seo-specialist
- Business & Product (9): business-analyst, content-marketer, legal-advisor, product-manager, project-manager, sales-engineer, scrum-master, technical-writer, ux-researcher
- Meta & Orchestration (7): agent-organizer, context-manager, error-coordinator, knowledge-synthesizer, multi-agent-coordinator, task-distributor, workflow-orchestrator
- Research & Analysis (7): competitive-analyst, data-researcher, market-researcher, research-analyst, scientific-literature-researcher, search-specialist, trend-analyst

**Smart Model Detection**:
- Model fingerprinting recognizes Claude, GPT, Gemini, DeepSeek, Llama, Mistral from any provider ID
- Works with custom providers (Bedrock: `eu.anthropic.claude-opus-4-6-v1`, Azure, self-hosted)
- 26 model fingerprints with coding benchmark scores (0-100) and cost tiers ($-$$$$$)
- Auto-optimize option: uses YOUR existing models for best frontier/fast mix
- Agent-tier mapping: which agents need frontier vs. strong vs. fast models

**MCP Registry Search**:
- Live search via official `registry.modelcontextprotocol.io` API
- Browse, select, and auto-configure any registered MCP server
- Results show name, version, description with interactive checkbox

### Changed

- CLI AVAILABLE_AGENTS expanded from 23 to 108 entries across 10 categories
- Model strategy prompt now detects and displays existing models with benchmark data
- Model presets still available as fallback when no models detected

## [0.2.0] - 2026-03-27

### Added

**23 Agents in 7 categories** (up from 6):
- Core (6): code-reviewer, docs-writer, security-auditor, debugger, refactorer, test-writer
- Development (3): api-designer, microservices-architect, architect-reviewer
- Quality (4): performance-engineer, accessibility-tester, compliance-auditor, chaos-engineer
- Infrastructure (3): devops-engineer, docker-expert, sre-engineer
- Data (1): database-optimizer
- Productivity (4): dependency-manager, git-workflow-manager, legacy-modernizer, error-detective
- Orchestration (2): context-manager, workflow-orchestrator

**15 Skills** (up from 5):
- New: dependency-audit, incident-postmortem, docker-optimize, adr-write, api-contract, changelog-generate, ci-pipeline, env-setup, error-triage, performance-profile

**18 curated MCP servers** (up from 3) filtered by selected languages:
- Universal: context7, gh-grep, memory, fetch, sequential-thinking
- Git: git
- Monitoring: sentry, axiom
- Database: postgres, sqlite, redis
- Cloud: aws, kubernetes
- Deployment: vercel
- Testing: puppeteer
- Collaboration: atlassian, linear
- Design: figma

**New CLI flow**:
- Fresh vs existing project detection ("Auto-detect or Select manually")
- Multi-select languages (auto-detected are pre-checked, add others freely)
- 27+ language/technology options with file-extension scanning for unknown projects
- `.opencode/advanced.json` state file to remember setup
- Re-run shows "Already configured! Start / Reconfigure / Exit"
- AGENTS.md auto-generation with language-specific conventions, agents, and skills
- OpenCode auto-launch after setup

### Changed

- CLI renamed from `opencode-advanced-setup` to `opencode-advanced`
- npm package renamed to `@weisser-dev/opencode-advanced`
- `project.languages` is now an array (multi-language support)
- Agent categories reorganized with visual separator lines in the checkbox prompt

## [0.1.0] - 2026-03-27

### Added

- Initial project setup
- 7 documentation files covering agents, skills, MCP servers, models, rules, tools, and permissions
- 6 agent templates: code-reviewer, docs-writer, security-auditor, debugger, refactorer, test-writer
- 5 skill templates: git-release, pr-review, migration, test-patterns, deploy
- 5 config presets: cost-optimized, node-typescript, java-spring, python, security-focused
- CLI tool `opencode-advanced-setup` with:
  - Project detection (Node, Java, Python, Go, Rust)
  - Framework detection (Next.js, Spring Boot, Django, FastAPI, etc.)
  - Interactive agent/skill/model/MCP selection
  - `opencode.json` generation with model optimization
  - 4 model strategy presets (Cost Optimized, Quality Focused, OpenAI, Mixed)
  - 3 MCP servers (context7, gh-grep, sentry)
- README with documentation, templates, and quickstart
- MIT license

[Unreleased]: https://github.com/weisser-dev/opencode-best-practices/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/weisser-dev/opencode-best-practices/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/weisser-dev/opencode-best-practices/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/weisser-dev/opencode-best-practices/releases/tag/v0.1.0

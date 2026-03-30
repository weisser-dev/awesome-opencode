# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2026-03-30

### Added

**20 Docker Dev Environments** (up from 1 generic):

All images are official Docker Hub / vendor images. Smart selection: recommended images shown first based on your detected project languages.

| Language | Image | Package Manager |
|----------|-------|-----------------|
| Node.js 22 | `node:22` | npm |
| Bun | `oven/bun:latest` | bun |
| Python 3.13 | `python:3.13-slim` | pip |
| Python + uv | `ghcr.io/astral-sh/uv:python3.13-bookworm-slim` | uv |
| Java + Maven | `maven:3-eclipse-temurin-21` | maven |
| Java + Gradle | `gradle:8-jdk21` | gradle |
| Kotlin | `openjdk:21-slim-bookworm` + sdkman | gradle |
| Go 1.24 | `golang:1.24` | go |
| Rust | `rust:1-slim-bookworm` | cargo |
| Ruby 3.3 | `ruby:3.3-slim` | bundler |
| PHP 8.4 | `php:8.4-cli` | composer |
| .NET 9 SDK | `mcr.microsoft.com/dotnet/sdk:9.0` | dotnet |
| Swift 6.1 | `swift:6.1` | swift |
| Dart 3.7 | `dart:3.7` | pub |
| Elixir 1.18 | `elixir:1.18-slim` | mix |
| C/C++ (GCC 14) | `gcc:14` | make |
| Terraform | `hashicorp/terraform:latest` | terraform |
| Ansible | `cytopia/ansible:latest` | ansible |
| Ubuntu 24.04 | `ubuntu:24.04` | apt (general — install anything) |
| Generic | `node:22` | npm (fallback) |

**Proxy & Artifact Registry Configuration** (offered during sandbox setup):
- HTTP/HTTPS corporate proxy
- Nexus npm registry + Maven mirror
- JFrog Artifactory npm + Maven
- PyPI mirror for pip/uv
- `preInstall` commands auto-generated per registry type

**Unit Tests — 87 tests, 0 failures** (`npm test`):
- Agents, skills, models, fingerprinting, Docker images, MCP, languages

**Codebase split into modules** (was single 2699-line setup.js):
- `src/data/` — pure data (agents, skills, models, MCP, docker, languages)
- `src/lib/` — logic (detect, prompts, generate, docker sandbox)
- `src/setup.js` — 35-line re-export hub

### Changed

- Sandbox image selection now groups: Recommended → Other → General Purpose
- `getRecommendedEnvironments()` returns `generals[]` instead of `generic`
- Proxy + artifact registry config offered after provider setup in sandbox mode

### Added

**Sandboxed OpenCode via Docker**:
- New prompt: "Run OpenCode in a sandbox?" (shown when Docker is available)
- Docker container mounts only current project directory as `/workspace`
- Provider-aware environment variable configuration for 7 providers:
  Anthropic, OpenAI, AWS Bedrock, Azure OpenAI, Google AI, OpenRouter, Custom
- Auto-detects existing env vars in host shell, asks to reuse (masked display)
- Shows full Docker command for review/copy before execution
- Recommended for enterprise environments to avoid accidental access outside project

**CLI Subcommands**:
- `awesome-opencode --help` — show usage
- `awesome-opencode configure` — full reconfigure
- `awesome-opencode configure agents` — add/remove agents only
- `awesome-opencode configure skills` — add/remove skills only
- `awesome-opencode configure models` — change model strategy only
- `awesome-opencode configure mcp` — add/remove MCP servers only

**Improved Re-Run Menu** (when already configured):
- Start OpenCode (direct, no sandbox question)
- Start OpenCode (Sandboxed) (direct Docker launch)
- Reconfigure (full setup again)
- Configure agents / skills / models / MCP (targeted changes)
- Exit

**MCP Search via mcp.so** (replaces registry.modelcontextprotocol.io):
- Live search against mcp.so (reliable, fast)
- Parses server cards with title, author, description
- Filters out mirrors automatically
- Supports multiple searches in a loop ("Search for more?")
- Asks for npm package name confirmation per selected server

**Existing Config Detection**:
- Shows custom providers found in config (e.g. `aws`, `azure-gpt`)
- Shows existing agents (e.g. `review`)
- Shows existing MCP servers (e.g. `MCP_DOCKER`, `MCP_PLAYWRIGHT`)

**GPT-5.3 Model Fingerprints**:
- Added GPT-5.3, GPT-5.3 Codex, GPT-5.3 Chat patterns
- Reordered OpenAI patterns (most specific first)

### Changed

- `launchOpenCode()` accepts `{ forceSandbox: true|false }` parameter
- Re-run menu now has 8 options instead of 3

## [1.0.0] - 2026-03-27

### Added

- Initial public release
- 108 agent templates across 10 categories
- 15 skill templates
- 18 curated MCP servers filtered by project language
- Smart model detection with 26 fingerprints (Anthropic, OpenAI, Google, DeepSeek, Meta, Mistral)
- Auto-optimize option for custom provider models
- Agent-tier mapping (frontier/strong/fast) with step limits per agent
- Step limits and cost control per agent type
- Interactive CLI with fresh vs existing project detection
- Multi-select languages with file-extension scanning (28 languages)
- Language-aware agent recommendations with reason tags
- AGENTS.md auto-generation with language-specific conventions
- Re-run detection via `.opencode/advanced.json`
- OpenCode auto-launch after setup
- Comprehensive language-to-agent mapping for all 28 languages
- 7 documentation files (agents, skills, MCP, models, rules, tools, permissions)
- 5 config presets (cost-optimized, node-typescript, java-spring, python, security-focused)
- CI/CD workflows (ci.yml + release.yml)
- MIT license

[Unreleased]: https://github.com/weisser-dev/awesome-opencode/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/weisser-dev/awesome-opencode/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/weisser-dev/awesome-opencode/releases/tag/v1.0.0

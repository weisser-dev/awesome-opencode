# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-03-27

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

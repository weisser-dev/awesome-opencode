# OpenCode Best Practices -- Project Rules

This is a Node.js/TypeScript project providing an open-source collection of agent templates, skill definitions, and a CLI tool for OpenCode.

## Project Structure

- `docs/` -- 7 documentation files covering OpenCode concepts (agents, skills, MCP, models, rules, tools, permissions)
- `templates/agents/` -- 108 agent markdown definitions organized by category
- `templates/skills/` -- 15 skill definitions (each in `<name>/SKILL.md`)
- `templates/configs/` -- 5 opencode.json preset configurations
- `templates/packs/` -- skill packs (design, process, behavior): `sources.lock.json` + bundled skills/commands, imported from weisser-dev/agentic-skills via `cli-tool/scripts/import-packs.js`; never edit by hand
- `cli-tool/` -- The `@weisser-dev/awesome-opencode` npm package
  - `cli-tool/src/index.js` -- Entry point, flow control, re-run detection
  - `cli-tool/src/setup.js` -- Core logic: detection, prompts, model intelligence, file generation (~1800 lines)
  - `cli-tool/templates/` -- Bundled copy of templates for npm distribution
  - `cli-tool/scripts/sync-templates.js` -- Pre-publish script to sync templates from repo root
  - `cli-tool/src/lib/packs.js` / `packs-cli.js` -- skill pack installer (pinned sources, sha256 verification, no execution)

## Architecture

The CLI tool (`cli-tool/src/setup.js`) is the main codebase. It is a single-file ESM module using:
- `@inquirer/prompts` for interactive CLI prompts (checkbox, select, confirm, input)
- `chalk` for terminal colors
- `ora` for spinner animations
- `node:fs`, `node:path` for file operations
- `node:child_process` for spawning OpenCode after setup

Key data structures:
- `EXTENSION_HINTS` -- Maps file extensions to language/category for auto-detection
- `LANGUAGE_OPTIONS` -- 27+ selectable languages/technologies
- `AVAILABLE_AGENTS` -- 108 agents with name, description, and category
- `AVAILABLE_SKILLS` -- 15 skills with name and description
- `MODEL_FINGERPRINTS` -- 26 regex patterns to identify models from any provider
- `AGENT_TIERS` -- Maps agent names to model quality requirements (frontier/strong/fast)
- `AVAILABLE_MCP` -- 19 curated MCP servers with language relevance tags
- `MODEL_PRESETS` -- 4 preset model strategies + keep + auto-optimize

## Code Standards

- Pure ESM (`"type": "module"` in package.json)
- Node.js 22.13+ required (uses global `fetch`, `AbortSignal.timeout`)
- No build step -- raw JavaScript, not TypeScript
- All functions are exported and imported explicitly (no default exports except in index.js)
- Template files use YAML frontmatter for agent/skill metadata

## Commands

- **Install:** `npm install` (in cli-tool/)
- **Run locally:** `node src/index.js` (in cli-tool/)
- **Link globally:** `npm link` (in cli-tool/)
- **Sync templates:** `node scripts/sync-templates.js` (in cli-tool/)
- **Check syntax:** `node --check src/setup.js`
- **Dry-run publish:** `npm pack --dry-run` (in cli-tool/)

## Testing

There are currently no automated tests. To verify changes:
1. `node --check cli-tool/src/setup.js` -- Syntax validation
2. `npm link` in cli-tool/ then run `awesome-opencode` in a test project
3. Verify all exports match: `grep "^export " cli-tool/src/setup.js`
4. Count agents: `grep "category:" cli-tool/src/setup.js | grep "value:" | wc -l` (should be 108)
5. Count skills: `awk '/^const AVAILABLE_SKILLS/,/^];/' cli-tool/src/setup.js | grep "value:" | wc -l` (should be 15)

## Conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Agent filenames are kebab-case matching the agent name (e.g., `typescript-pro.md`)
- Skill directories are kebab-case matching the skill name (e.g., `git-release/SKILL.md`)
- Skill names must match regex: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Agent markdown uses YAML frontmatter with `description`, `mode`, `model`, `temperature`, `permission`
- All template files in `templates/` are the source of truth; `cli-tool/templates/` is a synced copy

## Custom Agents

The following subagents are available for this project:

- **@code-reviewer**: Code review with security & performance focus
- **@docs-writer**: Technical documentation writer
- **@test-writer**: Test generation following project patterns

## Available Skills

- **git-release**: Release notes and version bumps
- **changelog-generate**: CHANGELOG.md from git history
- **ci-pipeline**: CI/CD pipeline configuration
- **dependency-audit**: CVE scan, license check, unused dependencies

## Key Design Decisions

1. **Single setup.js file**: All logic in one file for simplicity. Trade-off: file is ~1800 lines. Acceptable because it is all closely related setup logic.
2. **Templates as files, not embedded strings**: Agent/skill templates are markdown files, not JS strings. This makes them editable by users and reviewable in PRs.
3. **Bundled templates in npm package**: `cli-tool/templates/` is a copy of `templates/` synced via `prepublishOnly`. This ensures `npx` works without the full repo.
4. **Model fingerprinting via regex**: Simple pattern matching against model IDs. Works for all known providers. Easy to extend with new patterns.
5. **No runtime API calls for pricing**: Model benchmark scores and cost tiers are embedded, not fetched live. This avoids network dependencies during setup.
6. **MCP registry search is optional**: Curated list is shown first, registry search is offered as a follow-up step. This keeps the happy path fast.

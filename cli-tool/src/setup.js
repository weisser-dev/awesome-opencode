// ─── Setup orchestration ─────────────────────────────────────────────────────
// This file re-exports everything index.js needs, now split across data/ + lib/.

import chalk from 'chalk';

// ── Data re-exports ──────────────────────────────────────────────────────────
export { AVAILABLE_AGENTS, DEFAULT_AGENTS, LANGUAGE_AGENT_MAP } from './data/agents.js';
export { AVAILABLE_SKILLS, DEFAULT_SKILLS } from './data/skills.js';
export { MODEL_FINGERPRINTS, MODEL_PRESETS, AGENT_TIERS, COST_LABELS, TIER_LABELS, getAgentTier, fingerprintModel, detectModelsInConfig } from './data/models.js';
export { AVAILABLE_MCP } from './data/mcp.js';
export { DEV_ENVIRONMENTS, PROVIDER_ENV_CONFIGS, getRecommendedEnvironments } from './data/docker.js';
export { EXTENSION_HINTS, LANGUAGE_OPTIONS, detectYamlCategory, scanProjectFiles, detectFromExtensions } from './data/languages.js';

// ── Lib re-exports ───────────────────────────────────────────────────────────
export { checkExistingSetup, detectProject } from './lib/detect.js';
export { promptAgents, promptSkills, promptModels, promptMcp, promptMcpSearch, promptCostControl } from './lib/prompts.js';
export { generateFiles, promptAgentsMd } from './lib/generate.js';
export { launchOpenCode } from './lib/docker.js';

// ─── Intro ───────────────────────────────────────────────────────────────────

export function intro() {
  console.log('');
  console.log(chalk.bold.cyan('  Awesome OpenCode'));
  console.log(chalk.gray('  108 agents, 15 skills, smart model config'));
  console.log(chalk.gray('  https://github.com/weisser-dev/awesome-opencode'));
  console.log('');
}

// ─── Outro ───────────────────────────────────────────────────────────────────

export function outro() {
  console.log(chalk.bold.green('  Setup complete!'));
  console.log('');
}

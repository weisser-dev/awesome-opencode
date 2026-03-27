import { checkbox, confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';

const CWD = process.cwd();

// ─── Intro ──────────────────────────────────────────────────────────────────

export function intro() {
  console.log('');
  console.log(chalk.bold.cyan('  OpenCode Advanced Setup'));
  console.log(chalk.gray('  Best practices for agents, skills, models & more'));
  console.log(chalk.gray('  https://github.com/weisser-dev/opencode-best-practices'));
  console.log('');
}

// ─── Project Detection ──────────────────────────────────────────────────────

export async function detectProject() {
  const spinner = ora('Analyzing project...').start();

  const project = {
    path: CWD,
    language: null,
    framework: null,
    hasOpenCodeConfig: false,
    existingConfig: null,
    packageManager: null,
  };

  // Detect existing opencode.json
  const configPath = path.join(CWD, 'opencode.json');
  if (fs.existsSync(configPath)) {
    project.hasOpenCodeConfig = true;
    try {
      project.existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch { /* ignore parse errors */ }
  }

  // Detect language and framework
  if (fs.existsSync(path.join(CWD, 'package.json'))) {
    project.language = 'node';
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(CWD, 'package.json'), 'utf-8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps['next']) project.framework = 'nextjs';
      else if (allDeps['nuxt']) project.framework = 'nuxt';
      else if (allDeps['react']) project.framework = 'react';
      else if (allDeps['vue']) project.framework = 'vue';
      else if (allDeps['svelte'] || allDeps['@sveltejs/kit']) project.framework = 'svelte';
      else if (allDeps['express']) project.framework = 'express';
      else if (allDeps['fastify']) project.framework = 'fastify';
      else if (allDeps['hono']) project.framework = 'hono';
    } catch { /* ignore */ }

    if (fs.existsSync(path.join(CWD, 'bun.lockb')) || fs.existsSync(path.join(CWD, 'bun.lock'))) {
      project.packageManager = 'bun';
    } else if (fs.existsSync(path.join(CWD, 'pnpm-lock.yaml'))) {
      project.packageManager = 'pnpm';
    } else if (fs.existsSync(path.join(CWD, 'yarn.lock'))) {
      project.packageManager = 'yarn';
    } else {
      project.packageManager = 'npm';
    }
  } else if (fs.existsSync(path.join(CWD, 'pom.xml'))) {
    project.language = 'java';
    project.framework = 'maven';
    if (fs.existsSync(path.join(CWD, 'pom.xml'))) {
      try {
        const pom = fs.readFileSync(path.join(CWD, 'pom.xml'), 'utf-8');
        if (pom.includes('spring-boot')) project.framework = 'spring-boot';
        else if (pom.includes('quarkus')) project.framework = 'quarkus';
        else if (pom.includes('micronaut')) project.framework = 'micronaut';
      } catch { /* ignore */ }
    }
  } else if (fs.existsSync(path.join(CWD, 'build.gradle')) || fs.existsSync(path.join(CWD, 'build.gradle.kts'))) {
    project.language = 'java';
    project.framework = 'gradle';
    try {
      const gradleFile = fs.existsSync(path.join(CWD, 'build.gradle.kts'))
        ? 'build.gradle.kts' : 'build.gradle';
      const gradle = fs.readFileSync(path.join(CWD, gradleFile), 'utf-8');
      if (gradle.includes('spring-boot') || gradle.includes('org.springframework')) project.framework = 'spring-boot';
      else if (gradle.includes('quarkus')) project.framework = 'quarkus';
    } catch { /* ignore */ }
  } else if (fs.existsSync(path.join(CWD, 'requirements.txt')) || fs.existsSync(path.join(CWD, 'pyproject.toml')) || fs.existsSync(path.join(CWD, 'setup.py'))) {
    project.language = 'python';
    try {
      const files = ['requirements.txt', 'pyproject.toml', 'setup.py'].map(f => {
        try { return fs.readFileSync(path.join(CWD, f), 'utf-8'); } catch { return ''; }
      }).join('\n');
      if (files.includes('django')) project.framework = 'django';
      else if (files.includes('fastapi')) project.framework = 'fastapi';
      else if (files.includes('flask')) project.framework = 'flask';
    } catch { /* ignore */ }

    if (fs.existsSync(path.join(CWD, 'poetry.lock'))) project.packageManager = 'poetry';
    else if (fs.existsSync(path.join(CWD, 'uv.lock'))) project.packageManager = 'uv';
    else project.packageManager = 'pip';
  } else if (fs.existsSync(path.join(CWD, 'go.mod'))) {
    project.language = 'go';
  } else if (fs.existsSync(path.join(CWD, 'Cargo.toml'))) {
    project.language = 'rust';
  }

  spinner.succeed('Project analyzed');
  console.log('');
  console.log(chalk.gray('  Detected:'));
  console.log(chalk.gray(`    Language:  ${project.language || 'unknown'}`));
  console.log(chalk.gray(`    Framework: ${project.framework || 'none'}`));
  console.log(chalk.gray(`    Existing config: ${project.hasOpenCodeConfig ? 'yes' : 'no'}`));
  if (project.packageManager) {
    console.log(chalk.gray(`    Package manager: ${project.packageManager}`));
  }
  console.log('');

  return project;
}

// ─── Agent Selection ────────────────────────────────────────────────────────

const AVAILABLE_AGENTS = [
  { name: 'code-reviewer', value: 'code-reviewer', description: 'Code review with security & performance focus' },
  { name: 'docs-writer', value: 'docs-writer', description: 'Technical documentation writer' },
  { name: 'security-auditor', value: 'security-auditor', description: 'Security vulnerability scanner' },
  { name: 'debugger', value: 'debugger', description: 'Bug investigation and root cause analysis' },
  { name: 'refactorer', value: 'refactorer', description: 'Code refactoring with test verification' },
  { name: 'test-writer', value: 'test-writer', description: 'Test generation following project patterns' },
];

export async function promptAgents(project) {
  const install = await confirm({
    message: 'Install custom agents (subagents)?',
    default: true,
  });

  if (!install) return [];

  const selected = await checkbox({
    message: 'Select agents to install:',
    choices: AVAILABLE_AGENTS.map(a => ({
      name: `${a.name} - ${a.description}`,
      value: a.value,
      checked: ['code-reviewer', 'test-writer'].includes(a.value),
    })),
  });

  return selected;
}

// ─── Skill Selection ────────────────────────────────────────────────────────

const AVAILABLE_SKILLS = [
  { name: 'git-release', value: 'git-release', description: 'Release notes and version bumps' },
  { name: 'pr-review', value: 'pr-review', description: 'Structured PR review checklist' },
  { name: 'migration', value: 'migration', description: 'Database/framework migration planning' },
  { name: 'test-patterns', value: 'test-patterns', description: 'Test generation following project conventions' },
  { name: 'deploy', value: 'deploy', description: 'CI/CD pipeline and deployment setup' },
];

export async function promptSkills(project) {
  const install = await confirm({
    message: 'Install skills (SKILL.md)?',
    default: true,
  });

  if (!install) return [];

  const selected = await checkbox({
    message: 'Select skills to install:',
    choices: AVAILABLE_SKILLS.map(s => ({
      name: `${s.name} - ${s.description}`,
      value: s.value,
      checked: ['git-release', 'test-patterns'].includes(s.value),
    })),
  });

  return selected;
}

// ─── Model Optimization ─────────────────────────────────────────────────────

const MODEL_PRESETS = {
  'cost-optimized': {
    label: 'Cost Optimized (Haiku for Plan/Explore, Sonnet for Build)',
    model: 'anthropic/claude-sonnet-4-5-20250929',
    small_model: 'anthropic/claude-haiku-4-5-20250929',
    agents: {
      build: { model: 'anthropic/claude-sonnet-4-5-20250929' },
      plan: { model: 'anthropic/claude-haiku-4-5-20250929' },
      explore: { model: 'anthropic/claude-haiku-4-5-20250929' },
      general: { model: 'anthropic/claude-haiku-4-5-20250929' },
    },
  },
  'quality-focused': {
    label: 'Quality Focused (Opus for Build, Sonnet for others)',
    model: 'anthropic/claude-opus-4-5-20250918',
    small_model: 'anthropic/claude-haiku-4-5-20250929',
    agents: {
      build: { model: 'anthropic/claude-opus-4-5-20250918' },
      plan: { model: 'anthropic/claude-sonnet-4-5-20250929' },
      explore: { model: 'anthropic/claude-haiku-4-5-20250929' },
      general: { model: 'anthropic/claude-sonnet-4-5-20250929' },
    },
  },
  'openai': {
    label: 'OpenAI Stack (GPT 5.2 for Build, GPT 5.1 Codex for others)',
    model: 'openai/gpt-5.2',
    small_model: 'openai/gpt-5.1-codex',
    agents: {
      build: { model: 'openai/gpt-5.2' },
      plan: { model: 'openai/gpt-5.1-codex' },
      explore: { model: 'openai/gpt-5.1-codex' },
      general: { model: 'openai/gpt-5.1-codex' },
    },
  },
  'mixed': {
    label: 'Mixed (Best of each provider)',
    model: 'anthropic/claude-sonnet-4-5-20250929',
    small_model: 'anthropic/claude-haiku-4-5-20250929',
    agents: {
      build: { model: 'anthropic/claude-sonnet-4-5-20250929' },
      plan: { model: 'anthropic/claude-haiku-4-5-20250929' },
      explore: { model: 'anthropic/claude-haiku-4-5-20250929' },
      general: { model: 'anthropic/claude-haiku-4-5-20250929' },
    },
  },
  'keep': {
    label: 'Keep existing model config',
  },
};

export async function promptModels(project) {
  const choices = Object.entries(MODEL_PRESETS).map(([key, preset]) => ({
    name: preset.label,
    value: key,
  }));

  // If existing config has a model, suggest keeping it
  if (project.existingConfig?.model) {
    console.log(chalk.gray(`  Current model: ${project.existingConfig.model}`));

    // Check if they could save money
    const currentModel = project.existingConfig.model;
    if (currentModel.includes('opus') || currentModel.includes('gpt-5.2')) {
      console.log(chalk.yellow('  Tip: You could save costs by using Haiku for Plan/Explore agents'));
    }
    console.log('');
  }

  const selected = await select({
    message: 'Model strategy:',
    choices,
    default: project.hasOpenCodeConfig ? 'keep' : 'cost-optimized',
  });

  if (selected === 'keep') return null;
  return MODEL_PRESETS[selected];
}

// ─── MCP Selection ──────────────────────────────────────────────────────────

const AVAILABLE_MCP = [
  {
    name: 'context7',
    value: 'context7',
    description: 'Documentation search (context7.com)',
    config: { type: 'remote', url: 'https://mcp.context7.com/mcp' },
  },
  {
    name: 'gh-grep',
    value: 'gh-grep',
    description: 'GitHub code search (grep.app)',
    config: { type: 'remote', url: 'https://mcp.grep.app' },
  },
  {
    name: 'sentry',
    value: 'sentry',
    description: 'Sentry error tracking',
    config: { type: 'remote', url: 'https://mcp.sentry.dev/mcp', oauth: {} },
  },
];

export async function promptMcp(project) {
  const install = await confirm({
    message: 'Configure MCP servers?',
    default: true,
  });

  if (!install) return [];

  const selected = await checkbox({
    message: 'Select MCP servers:',
    choices: AVAILABLE_MCP.map(m => ({
      name: `${m.name} - ${m.description}`,
      value: m.value,
      checked: m.value === 'context7',
    })),
  });

  return selected;
}

// ─── File Generation ────────────────────────────────────────────────────────

export async function generateFiles({ project, agents, skills, modelConfig, mcpConfig }) {
  const spinner = ora('Generating files...').start();
  const templateBase = getTemplateBase();

  // Create .opencode directory structure
  if (agents.length > 0) {
    const agentsDir = path.join(CWD, '.opencode', 'agents');
    fs.mkdirSync(agentsDir, { recursive: true });

    for (const agent of agents) {
      const src = path.join(templateBase, 'templates', 'agents', `${agent}.md`);
      const dest = path.join(agentsDir, `${agent}.md`);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }
    spinner.text = `Installed ${agents.length} agent(s)`;
  }

  if (skills.length > 0) {
    for (const skill of skills) {
      const skillDir = path.join(CWD, '.opencode', 'skills', skill);
      fs.mkdirSync(skillDir, { recursive: true });

      const src = path.join(templateBase, 'templates', 'skills', skill, 'SKILL.md');
      const dest = path.join(skillDir, 'SKILL.md');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }
    spinner.text = `Installed ${skills.length} skill(s)`;
  }

  // Generate/update opencode.json
  const configPath = path.join(CWD, 'opencode.json');
  let config = project.existingConfig || { '$schema': 'https://opencode.ai/config.json' };

  if (modelConfig) {
    config.model = modelConfig.model;
    config.small_model = modelConfig.small_model;
    if (!config.agent) config.agent = {};
    for (const [agentName, agentConfig] of Object.entries(modelConfig.agents)) {
      config.agent[agentName] = { ...config.agent[agentName], ...agentConfig };
    }
  }

  if (mcpConfig.length > 0) {
    if (!config.mcp) config.mcp = {};
    for (const mcpName of mcpConfig) {
      const mcpDef = AVAILABLE_MCP.find(m => m.value === mcpName);
      if (mcpDef) {
        config.mcp[mcpName] = mcpDef.config;
      }
    }
  }

  // Add compaction defaults if not present
  if (!config.compaction) {
    config.compaction = { auto: true, prune: true };
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

  spinner.succeed('Files generated');
  console.log('');

  // Summary
  console.log(chalk.bold('  Generated:'));
  if (agents.length > 0) {
    console.log(chalk.green(`    .opencode/agents/ (${agents.length} agents)`));
    for (const a of agents) console.log(chalk.gray(`      - ${a}.md`));
  }
  if (skills.length > 0) {
    console.log(chalk.green(`    .opencode/skills/ (${skills.length} skills)`));
    for (const s of skills) console.log(chalk.gray(`      - ${s}/SKILL.md`));
  }
  console.log(chalk.green('    opencode.json (updated)'));
  console.log('');
}

// ─── Template Resolution ────────────────────────────────────────────────────

function getTemplateBase() {
  // When running via npx, templates are in the package directory
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const packageDir = path.resolve(scriptDir, '..');

  // Check if templates exist relative to package
  if (fs.existsSync(path.join(packageDir, 'templates'))) {
    return packageDir;
  }

  // Fallback: check parent (repo root)
  const repoRoot = path.resolve(packageDir, '..');
  if (fs.existsSync(path.join(repoRoot, 'templates'))) {
    return repoRoot;
  }

  console.warn(chalk.yellow('Warning: Template directory not found. Creating empty files.'));
  return packageDir;
}

// ─── Outro ──────────────────────────────────────────────────────────────────

export function outro() {
  console.log(chalk.bold.green('  Setup complete!'));
  console.log('');
  console.log(chalk.gray('  Next steps:'));
  console.log(chalk.gray('    1. Review generated files in .opencode/'));
  console.log(chalk.gray('    2. Customize agent prompts to your needs'));
  console.log(chalk.gray('    3. Run: opencode'));
  console.log(chalk.gray('    4. Try: Tab to switch agents, @agent-name to use subagents'));
  console.log('');
  console.log(chalk.gray('  Docs: https://github.com/weisser-dev/opencode-best-practices'));
  console.log('');
}

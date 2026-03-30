// ─── Project Detection ──────────────────────────────────────────────────────

import { checkbox, select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { LANGUAGE_OPTIONS, scanProjectFiles, detectFromExtensions } from '../data/languages.js';

const CWD = process.cwd();
const ADVANCED_JSON_PATH = path.join(CWD, '.opencode', 'advanced.json');

export function checkExistingSetup() {
  if (!fs.existsSync(ADVANCED_JSON_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(ADVANCED_JSON_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Auto-detect languages from config files and file extensions.
 * Returns an array of detected language values (strings).
 */
function autoDetectLanguages() {
  const detected = new Set();

  // ── Primary detection: config files ──────────────────────────────────────

  if (fs.existsSync(path.join(CWD, 'package.json'))) {
    detected.add('node');
  }
  if (fs.existsSync(path.join(CWD, 'pom.xml')) || fs.existsSync(path.join(CWD, 'build.gradle')) || fs.existsSync(path.join(CWD, 'build.gradle.kts'))) {
    detected.add('java');
  }
  if (fs.existsSync(path.join(CWD, 'requirements.txt')) || fs.existsSync(path.join(CWD, 'pyproject.toml')) || fs.existsSync(path.join(CWD, 'setup.py'))) {
    detected.add('python');
  }
  if (fs.existsSync(path.join(CWD, 'go.mod'))) {
    detected.add('go');
  }
  if (fs.existsSync(path.join(CWD, 'Cargo.toml'))) {
    detected.add('rust');
  }
  if (fs.existsSync(path.join(CWD, 'Gemfile'))) {
    detected.add('ruby');
  }
  if (fs.existsSync(path.join(CWD, 'composer.json'))) {
    detected.add('php');
  }
  if (fs.existsSync(path.join(CWD, 'Package.swift'))) {
    detected.add('swift');
  }
  if (fs.existsSync(path.join(CWD, 'pubspec.yaml'))) {
    detected.add('dart');
  }
  if (fs.existsSync(path.join(CWD, 'build.sbt'))) {
    detected.add('scala');
  }
  if (fs.existsSync(path.join(CWD, 'mix.exs'))) {
    detected.add('elixir');
  }
  if (fs.existsSync(path.join(CWD, 'build.zig'))) {
    detected.add('zig');
  }
  if (fs.existsSync(path.join(CWD, 'Dockerfile')) || fs.existsSync(path.join(CWD, 'docker-compose.yml')) || fs.existsSync(path.join(CWD, 'docker-compose.yaml')) || fs.existsSync(path.join(CWD, 'compose.yml')) || fs.existsSync(path.join(CWD, 'compose.yaml'))) {
    detected.add('docker');
  }

  // Check for .csproj / .sln files
  try {
    const topFiles = fs.readdirSync(CWD);
    if (topFiles.some(f => f.endsWith('.csproj') || f.endsWith('.sln') || f.endsWith('.fsproj'))) {
      detected.add('csharp');
    }
  } catch { /* ignore */ }

  // ── Secondary detection: scan file extensions ────────────────────────────

  const files = scanProjectFiles(CWD);
  const extensionSuggestions = detectFromExtensions(files);

  // Add languages detected by extension scanning (threshold: at least 2 files)
  for (const suggestion of extensionSuggestions) {
    if (suggestion.count >= 2 && suggestion.language) {
      detected.add(suggestion.language);
    }
  }

  return [...detected];
}

/**
 * Detect framework from config files. Returns framework string or null.
 */
function detectFramework() {
  // Node.js frameworks
  if (fs.existsSync(path.join(CWD, 'package.json'))) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(CWD, 'package.json'), 'utf-8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps['next']) return 'nextjs';
      if (allDeps['nuxt']) return 'nuxt';
      if (allDeps['react']) return 'react';
      if (allDeps['vue']) return 'vue';
      if (allDeps['svelte'] || allDeps['@sveltejs/kit']) return 'svelte';
      if (allDeps['express']) return 'express';
      if (allDeps['fastify']) return 'fastify';
      if (allDeps['hono']) return 'hono';
    } catch { /* ignore */ }
  }

  // Java frameworks
  if (fs.existsSync(path.join(CWD, 'pom.xml'))) {
    try {
      const pom = fs.readFileSync(path.join(CWD, 'pom.xml'), 'utf-8');
      if (pom.includes('spring-boot')) return 'spring-boot';
      if (pom.includes('quarkus')) return 'quarkus';
      if (pom.includes('micronaut')) return 'micronaut';
      return 'maven';
    } catch { /* ignore */ }
  }
  if (fs.existsSync(path.join(CWD, 'build.gradle')) || fs.existsSync(path.join(CWD, 'build.gradle.kts'))) {
    try {
      const gradleFile = fs.existsSync(path.join(CWD, 'build.gradle.kts'))
        ? 'build.gradle.kts' : 'build.gradle';
      const gradle = fs.readFileSync(path.join(CWD, gradleFile), 'utf-8');
      if (gradle.includes('spring-boot') || gradle.includes('org.springframework')) return 'spring-boot';
      if (gradle.includes('quarkus')) return 'quarkus';
      return 'gradle';
    } catch { /* ignore */ }
  }

  // Python frameworks
  const pyFiles = ['requirements.txt', 'pyproject.toml', 'setup.py'];
  if (pyFiles.some(f => fs.existsSync(path.join(CWD, f)))) {
    try {
      const content = pyFiles.map(f => {
        try { return fs.readFileSync(path.join(CWD, f), 'utf-8'); } catch { return ''; }
      }).join('\n');
      if (content.includes('django')) return 'django';
      if (content.includes('fastapi')) return 'fastapi';
      if (content.includes('flask')) return 'flask';
    } catch { /* ignore */ }
  }

  return null;
}

/**
 * Detect package manager from lock files. Returns string or null.
 */
function detectPackageManager() {
  if (fs.existsSync(path.join(CWD, 'bun.lockb')) || fs.existsSync(path.join(CWD, 'bun.lock'))) return 'bun';
  if (fs.existsSync(path.join(CWD, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(CWD, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(CWD, 'package-lock.json')) || fs.existsSync(path.join(CWD, 'package.json'))) return 'npm';
  if (fs.existsSync(path.join(CWD, 'poetry.lock'))) return 'poetry';
  if (fs.existsSync(path.join(CWD, 'uv.lock'))) return 'uv';
  if (fs.existsSync(path.join(CWD, 'requirements.txt')) || fs.existsSync(path.join(CWD, 'pyproject.toml'))) return 'pip';
  return null;
}

export async function detectProject({ configPath: externalConfigPath } = {}) {
  const spinner = ora('Analyzing project...').start();

  const project = {
    path: CWD,
    languages: [],
    framework: null,
    hasOpenCodeConfig: false,
    existingConfig: null,
    packageManager: null,
    hasAgentsMd: false,
    existingAgents: [],
    existingMcps: [],
    existingProviders: [],
    configPath: null,
  };

  // Detect existing opencode.json (external path takes priority)
  const configPath = externalConfigPath || path.join(CWD, 'opencode.json');
  project.configPath = configPath;
  if (fs.existsSync(configPath)) {
    project.hasOpenCodeConfig = true;
    try {
      project.existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      // Extract existing agents from config
      if (project.existingConfig.agent) {
        project.existingAgents = Object.keys(project.existingConfig.agent);
      }
      // Extract existing MCP servers from config
      if (project.existingConfig.mcp) {
        project.existingMcps = Object.keys(project.existingConfig.mcp);
      }
      // Extract custom providers
      if (project.existingConfig.provider) {
        project.existingProviders = Object.keys(project.existingConfig.provider);
      }
    } catch { /* ignore parse errors */ }
  }

  // Detect existing AGENTS.md or CLAUDE.md
  if (fs.existsSync(path.join(CWD, 'AGENTS.md')) || fs.existsSync(path.join(CWD, 'CLAUDE.md'))) {
    project.hasAgentsMd = true;
  }

  // Auto-detect languages, framework, package manager
  const autoDetected = autoDetectLanguages();
  project.framework = detectFramework();
  project.packageManager = detectPackageManager();

  spinner.succeed('Project analyzed');
  console.log('');

  // ── Ask setup mode ──────────────────────────────────────────────────────

  const setupMode = await select({
    message: 'How would you like to set up your project?',
    choices: [
      { name: 'Auto-detect languages (recommended for existing projects)', value: 'auto' },
      { name: 'Select languages manually (recommended for fresh projects)', value: 'manual' },
    ],
  });

  console.log('');

  // ── Build checkbox choices with auto-detected pre-checked ───────────────

  const preChecked = setupMode === 'auto' ? new Set(autoDetected) : new Set();

  if (setupMode === 'auto' && autoDetected.length > 0) {
    console.log(chalk.gray('  Auto-detected:'));
    for (const lang of autoDetected) {
      const opt = LANGUAGE_OPTIONS.find(o => o.value === lang);
      console.log(chalk.gray(`    - ${opt ? opt.label : lang}`));
    }
    console.log('');
  } else if (setupMode === 'auto') {
    console.log(chalk.yellow('  No languages auto-detected. Select manually below.'));
    console.log('');
  }

  const detectedCount = preChecked.size;
  const totalCount = LANGUAGE_OPTIONS.length;

  // Build choices: detected languages first, then the rest
  const choices = [];

  if (detectedCount > 0) {
    choices.push({ type: 'separator', separator: chalk.bold.green(`── Auto-Detected (${detectedCount}) ──`) });
    for (const lang of autoDetected) {
      const opt = LANGUAGE_OPTIONS.find(o => o.value === lang);
      if (opt) {
        choices.push({
          name: opt.label,
          value: opt.value,
          checked: true,
        });
      }
    }
    choices.push({ type: 'separator', separator: chalk.bold.blue(`── Other (${totalCount - detectedCount}) ──`) });
  }

  for (const o of LANGUAGE_OPTIONS) {
    if (preChecked.has(o.value)) continue; // already added above
    choices.push({
      name: o.label,
      value: o.value,
      checked: false,
    });
  }

  const selectedLanguages = await checkbox({
    message: `Select project languages (${detectedCount} detected / ${totalCount} available, scroll with arrows):`,
    choices,
    pageSize: 15,
  });

  project.languages = selectedLanguages;

  // ── Show results ─────────────────────────────────────────────────────────

  console.log('');
  console.log(chalk.gray('  Selected languages:'));
  for (const lang of project.languages) {
    const opt = LANGUAGE_OPTIONS.find(o => o.value === lang);
    console.log(chalk.gray(`    - ${opt ? opt.label : lang}`));
  }
  if (project.framework) {
    console.log(chalk.gray(`  Framework:       ${project.framework}`));
  }
  if (project.packageManager) {
    console.log(chalk.gray(`  Package manager: ${project.packageManager}`));
  }
  const configLabel = project.hasOpenCodeConfig
    ? (externalConfigPath ? `yes (${externalConfigPath})` : 'yes')
    : 'no';
  console.log(chalk.gray(`  Existing config: ${configLabel}`));
  if (project.existingProviders.length > 0) {
    console.log(chalk.gray(`  Custom providers: ${project.existingProviders.join(', ')}`));
  }
  if (project.existingAgents.length > 0) {
    console.log(chalk.gray(`  Existing agents:  ${project.existingAgents.join(', ')}`));
  }
  if (project.existingMcps.length > 0) {
    console.log(chalk.gray(`  Existing MCPs:    ${project.existingMcps.join(', ')}`));
  }
  console.log('');

  return project;
}

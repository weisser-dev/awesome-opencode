import { checkbox, confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const CWD = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Intro ──────────────────────────────────────────────────────────────────

export function intro() {
  console.log('');
  console.log(chalk.bold.cyan('  OpenCode Advanced Setup'));
  console.log(chalk.gray('  Best practices for agents, skills, models & more'));
  console.log(chalk.gray('  https://github.com/weisser-dev/opencode-best-practices'));
  console.log('');
}

// ─── Existing Setup Check ───────────────────────────────────────────────────

const ADVANCED_JSON_PATH = path.join(CWD, '.opencode', 'advanced.json');

export function checkExistingSetup() {
  if (!fs.existsSync(ADVANCED_JSON_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(ADVANCED_JSON_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

// ─── Project Detection ──────────────────────────────────────────────────────

// Map file extensions to language/category hints
const EXTENSION_HINTS = [
  { exts: ['.tf', '.tfvars', '.hcl'],            language: 'terraform',  category: 'IaC (Terraform)' },
  { exts: ['.yaml', '.yml'],                     language: null,         category: null, detect: detectYamlCategory },
  { exts: ['.bicep'],                             language: 'bicep',     category: 'IaC (Azure Bicep)' },
  { exts: ['.pulumi.ts', '.pulumi.yaml'],        language: 'pulumi',    category: 'IaC (Pulumi)' },
  { exts: ['.dockerfile', 'Dockerfile'],          language: 'docker',    category: 'Containers (Docker)' },
  { exts: ['.ts', '.tsx'],                        language: 'node',      category: 'TypeScript' },
  { exts: ['.js', '.jsx', '.mjs', '.cjs'],       language: 'node',      category: 'JavaScript' },
  { exts: ['.py', '.pyi'],                        language: 'python',    category: 'Python' },
  { exts: ['.java'],                              language: 'java',      category: 'Java' },
  { exts: ['.kt', '.kts'],                        language: 'kotlin',    category: 'Kotlin' },
  { exts: ['.go'],                                language: 'go',        category: 'Go' },
  { exts: ['.rs'],                                language: 'rust',      category: 'Rust' },
  { exts: ['.rb'],                                language: 'ruby',      category: 'Ruby' },
  { exts: ['.php'],                               language: 'php',       category: 'PHP' },
  { exts: ['.cs'],                                language: 'csharp',    category: 'C# (.NET)' },
  { exts: ['.swift'],                             language: 'swift',     category: 'Swift' },
  { exts: ['.dart'],                              language: 'dart',      category: 'Dart / Flutter' },
  { exts: ['.scala'],                             language: 'scala',     category: 'Scala' },
  { exts: ['.ex', '.exs'],                        language: 'elixir',    category: 'Elixir' },
  { exts: ['.zig'],                               language: 'zig',       category: 'Zig' },
  { exts: ['.c', '.h'],                           language: 'c',         category: 'C' },
  { exts: ['.cpp', '.cc', '.cxx', '.hpp'],        language: 'cpp',       category: 'C++' },
  { exts: ['.sol'],                               language: 'solidity',  category: 'Solidity (Web3)' },
  { exts: ['.sh', '.bash', '.zsh'],               language: 'shell',     category: 'Shell Scripts' },
  { exts: ['.sql'],                               language: 'sql',       category: 'SQL / Database' },
  { exts: ['.proto'],                             language: 'protobuf',  category: 'Protocol Buffers' },
  { exts: ['.graphql', '.gql'],                   language: 'graphql',   category: 'GraphQL' },
  { exts: ['.md', '.mdx'],                        language: 'markdown',  category: 'Documentation' },
];

function detectYamlCategory(files) {
  const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  const names = yamlFiles.map(f => path.basename(f).toLowerCase());
  if (names.some(n => n.includes('ansible') || n === 'playbook.yml' || n === 'site.yml')) {
    return { language: 'ansible', category: 'IaC (Ansible)' };
  }
  if (names.some(n => n.includes('docker-compose') || n === 'compose.yml' || n === 'compose.yaml')) {
    return { language: 'docker', category: 'Containers (Docker Compose)' };
  }
  if (names.some(n => n.includes('k8s') || n.includes('kubernetes') || n.includes('deployment') || n.includes('service'))) {
    return { language: 'kubernetes', category: 'Containers (Kubernetes)' };
  }
  if (names.some(n => n.includes('cloudformation'))) {
    return { language: 'cloudformation', category: 'IaC (CloudFormation)' };
  }
  return null;
}

/**
 * Scan up to 500 files in the project (non-hidden, non-node_modules) and
 * return an array of relative file paths.
 */
function scanProjectFiles(dir, maxFiles = 500) {
  const results = [];
  const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', 'target', '.next', '__pycache__', '.terraform', 'vendor']);

  function walk(currentDir, depth) {
    if (depth > 5 || results.length >= maxFiles) return;
    let entries;
    try { entries = fs.readdirSync(currentDir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (results.length >= maxFiles) return;
      if (entry.name.startsWith('.') && entry.isDirectory()) continue;
      if (entry.isDirectory()) {
        if (ignoreDirs.has(entry.name)) continue;
        walk(path.join(currentDir, entry.name), depth + 1);
      } else {
        results.push(path.relative(dir, path.join(currentDir, entry.name)));
      }
    }
  }

  walk(dir, 0);
  return results;
}

/**
 * Given a list of project files, count how many match each extension hint
 * and return ranked suggestions.
 */
function detectFromExtensions(files) {
  const counts = new Map();

  for (const hint of EXTENSION_HINTS) {
    if (hint.detect) {
      // Special detector (e.g. YAML)
      const result = hint.detect(files);
      if (result) {
        const key = `${result.language}|${result.category}`;
        counts.set(key, (counts.get(key) || 0) + 10); // boost special detections
      }
      continue;
    }

    let count = 0;
    for (const file of files) {
      const lower = file.toLowerCase();
      const base = path.basename(lower);
      for (const ext of hint.exts) {
        if (ext.startsWith('.')) {
          if (lower.endsWith(ext)) { count++; break; }
        } else {
          // Filename match (e.g. "Dockerfile")
          if (base === ext.toLowerCase() || base.startsWith(ext.toLowerCase())) { count++; break; }
        }
      }
    }

    if (count > 0 && hint.language && hint.category) {
      const key = `${hint.language}|${hint.category}`;
      counts.set(key, (counts.get(key) || 0) + count);
    }
  }

  // Sort by count descending, return as suggestions
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => {
      const [language, category] = key.split('|');
      return { language, category, count };
    });
}

// All selectable language options for the interactive prompt
const LANGUAGE_OPTIONS = [
  { value: 'node',            label: 'JavaScript / TypeScript' },
  { value: 'python',          label: 'Python' },
  { value: 'java',            label: 'Java' },
  { value: 'kotlin',          label: 'Kotlin' },
  { value: 'go',              label: 'Go' },
  { value: 'rust',            label: 'Rust' },
  { value: 'ruby',            label: 'Ruby' },
  { value: 'php',             label: 'PHP' },
  { value: 'csharp',          label: 'C# / .NET' },
  { value: 'swift',           label: 'Swift' },
  { value: 'dart',            label: 'Dart / Flutter' },
  { value: 'scala',           label: 'Scala' },
  { value: 'elixir',          label: 'Elixir' },
  { value: 'zig',             label: 'Zig' },
  { value: 'c',               label: 'C' },
  { value: 'cpp',             label: 'C++' },
  { value: 'terraform',       label: 'Terraform (IaC)' },
  { value: 'ansible',         label: 'Ansible (IaC)' },
  { value: 'cloudformation',  label: 'CloudFormation (IaC)' },
  { value: 'bicep',           label: 'Azure Bicep (IaC)' },
  { value: 'pulumi',          label: 'Pulumi (IaC)' },
  { value: 'kubernetes',      label: 'Kubernetes' },
  { value: 'docker',          label: 'Docker / Containers' },
  { value: 'solidity',        label: 'Solidity (Web3)' },
  { value: 'shell',           label: 'Shell Scripts' },
  { value: 'sql',             label: 'SQL / Database' },
  { value: 'markdown',        label: 'Documentation / Markdown' },
  { value: 'other',           label: 'Other' },
];

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

export async function detectProject() {
  const spinner = ora('Analyzing project...').start();

  const project = {
    path: CWD,
    languages: [],
    framework: null,
    hasOpenCodeConfig: false,
    existingConfig: null,
    packageManager: null,
    hasAgentsMd: false,
  };

  // Detect existing opencode.json
  const configPath = path.join(CWD, 'opencode.json');
  if (fs.existsSync(configPath)) {
    project.hasOpenCodeConfig = true;
    try {
      project.existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
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

  const selectedLanguages = await checkbox({
    message: 'Select project languages (space to toggle, enter to confirm):',
    choices: LANGUAGE_OPTIONS.map(o => ({
      name: o.label,
      value: o.value,
      checked: preChecked.has(o.value),
    })),
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
  console.log(chalk.gray(`  Existing config: ${project.hasOpenCodeConfig ? 'yes' : 'no'}`));
  console.log('');

  return project;
}

// ─── Agent Selection ────────────────────────────────────────────────────────

const AVAILABLE_AGENTS = [
  // Core
  { name: 'code-reviewer',         value: 'code-reviewer',         description: 'Code review with security & performance focus',           category: 'Core' },
  { name: 'docs-writer',           value: 'docs-writer',           description: 'Technical documentation writer',                          category: 'Core' },
  { name: 'security-auditor',      value: 'security-auditor',      description: 'Security vulnerability scanner',                          category: 'Core' },
  { name: 'debugger',              value: 'debugger',              description: 'Bug investigation and root cause analysis',               category: 'Core' },
  { name: 'refactorer',            value: 'refactorer',            description: 'Code refactoring with test verification',                 category: 'Core' },
  { name: 'test-writer',           value: 'test-writer',           description: 'Test generation following project patterns',              category: 'Core' },
  // Development
  { name: 'api-designer',          value: 'api-designer',          description: 'REST/GraphQL API design and contract definition',         category: 'Development' },
  { name: 'microservices-architect', value: 'microservices-architect', description: 'Microservices design, boundaries, and communication', category: 'Development' },
  { name: 'architect-reviewer',    value: 'architect-reviewer',    description: 'Architecture review and design pattern evaluation',       category: 'Development' },
  // Quality
  { name: 'performance-engineer',  value: 'performance-engineer',  description: 'Performance profiling and optimization guidance',         category: 'Quality' },
  { name: 'accessibility-tester',  value: 'accessibility-tester',  description: 'WCAG compliance and accessibility audit',                 category: 'Quality' },
  { name: 'compliance-auditor',    value: 'compliance-auditor',    description: 'Regulatory compliance checks (GDPR, SOC2, HIPAA)',        category: 'Quality' },
  { name: 'chaos-engineer',        value: 'chaos-engineer',        description: 'Failure mode analysis and resilience testing',            category: 'Quality' },
  // Infrastructure
  { name: 'devops-engineer',       value: 'devops-engineer',       description: 'CI/CD pipelines, infrastructure, and deployment',         category: 'Infrastructure' },
  { name: 'docker-expert',         value: 'docker-expert',         description: 'Docker optimization, multi-stage builds, and security',   category: 'Infrastructure' },
  { name: 'sre-engineer',          value: 'sre-engineer',          description: 'Site reliability, monitoring, and incident response',     category: 'Infrastructure' },
  // Data
  { name: 'database-optimizer',    value: 'database-optimizer',    description: 'Query optimization, indexing, and schema design',         category: 'Data' },
  // Productivity
  { name: 'dependency-manager',    value: 'dependency-manager',    description: 'Dependency updates, audit, and compatibility checks',     category: 'Productivity' },
  { name: 'git-workflow-manager',  value: 'git-workflow-manager',  description: 'Git workflow, branching strategy, and commit hygiene',    category: 'Productivity' },
  { name: 'legacy-modernizer',     value: 'legacy-modernizer',     description: 'Legacy code modernization and migration planning',        category: 'Productivity' },
  { name: 'error-detective',       value: 'error-detective',       description: 'Error pattern analysis and root cause detection',         category: 'Productivity' },
  // Orchestration
  { name: 'context-manager',       value: 'context-manager',       description: 'Project context loading and memory management',           category: 'Orchestration' },
  { name: 'workflow-orchestrator',  value: 'workflow-orchestrator', description: 'Multi-agent task orchestration and workflow coordination', category: 'Orchestration' },
];

const DEFAULT_AGENTS = new Set([
  'code-reviewer',
  'test-writer',
  'devops-engineer',
  'dependency-manager',
  'git-workflow-manager',
]);

export async function promptAgents(project) {
  const install = await confirm({
    message: 'Install custom agents (subagents)?',
    default: true,
  });

  if (!install) return [];

  // Build choices grouped by category with separators
  const categories = ['Core', 'Development', 'Quality', 'Infrastructure', 'Data', 'Productivity', 'Orchestration'];
  const choices = [];

  for (const category of categories) {
    choices.push({ type: 'separator', separator: chalk.bold.blue(`── ${category} ──`) });
    const categoryAgents = AVAILABLE_AGENTS.filter(a => a.category === category);
    for (const agent of categoryAgents) {
      choices.push({
        name: `${agent.name} - ${agent.description}`,
        value: agent.value,
        checked: DEFAULT_AGENTS.has(agent.value),
      });
    }
  }

  const selected = await checkbox({
    message: 'Select agents to install:',
    choices,
  });

  return selected;
}

// ─── Skill Selection ────────────────────────────────────────────────────────

const AVAILABLE_SKILLS = [
  // Existing
  { name: 'git-release',          value: 'git-release',          description: 'Release notes and version bumps' },
  { name: 'pr-review',            value: 'pr-review',            description: 'Structured PR review checklist' },
  { name: 'migration',            value: 'migration',            description: 'Database/framework migration planning' },
  { name: 'test-patterns',        value: 'test-patterns',        description: 'Test generation following project conventions' },
  { name: 'deploy',               value: 'deploy',               description: 'CI/CD pipeline and deployment setup' },
  // New
  { name: 'dependency-audit',     value: 'dependency-audit',     description: 'Audit dependencies for vulnerabilities and license issues' },
  { name: 'incident-postmortem',  value: 'incident-postmortem',  description: 'Structured incident postmortem report generation' },
  { name: 'docker-optimize',      value: 'docker-optimize',      description: 'Dockerfile and image size optimization' },
  { name: 'adr-write',            value: 'adr-write',            description: 'Architecture Decision Record (ADR) authoring' },
  { name: 'api-contract',         value: 'api-contract',         description: 'OpenAPI/Swagger contract generation and validation' },
  { name: 'changelog-generate',   value: 'changelog-generate',   description: 'Changelog generation from commit history' },
  { name: 'ci-pipeline',          value: 'ci-pipeline',          description: 'CI pipeline configuration and optimization' },
  { name: 'env-setup',            value: 'env-setup',            description: 'Development environment setup and onboarding' },
  { name: 'error-triage',         value: 'error-triage',         description: 'Error log triage and prioritization' },
  { name: 'performance-profile',  value: 'performance-profile',  description: 'Performance profiling and bottleneck identification' },
];

const DEFAULT_SKILLS = new Set([
  'git-release',
  'test-patterns',
  'ci-pipeline',
  'dependency-audit',
  'changelog-generate',
]);

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
      checked: DEFAULT_SKILLS.has(s.value),
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

// MCP servers with language/framework relevance tags
// Source: Official MCP Reference Servers (modelcontextprotocol/servers)
//         + curated official third-party integrations from mcp.so
const AVAILABLE_MCP = [
  // ── Universal (relevant for all projects) ─────────────────────────────────
  {
    name: 'context7',
    value: 'context7',
    description: 'Library documentation search (context7.com)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'remote', url: 'https://mcp.context7.com/mcp' },
  },
  {
    name: 'gh-grep',
    value: 'gh-grep',
    description: 'GitHub code search (grep.app by Vercel)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'remote', url: 'https://mcp.grep.app' },
  },
  {
    name: 'memory',
    value: 'memory',
    description: 'Persistent knowledge graph memory (official)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-memory'] },
  },
  {
    name: 'fetch',
    value: 'fetch',
    description: 'Web content fetching for LLM usage (official)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-fetch'] },
  },
  {
    name: 'sequential-thinking',
    value: 'sequential-thinking',
    description: 'Dynamic problem-solving through thought sequences (official)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-sequential-thinking'] },
  },

  // ── Git & Version Control ─────────────────────────────────────────────────
  {
    name: 'git',
    value: 'git',
    description: 'Read, search, and manipulate Git repos (official)',
    category: 'Git & VCS',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-git'] },
  },

  // ── Monitoring & Error Tracking ───────────────────────────────────────────
  {
    name: 'sentry',
    value: 'sentry',
    description: 'Sentry error tracking and analysis (official)',
    category: 'Monitoring',
    relevance: ['*'],
    config: { type: 'remote', url: 'https://mcp.sentry.dev/mcp', oauth: {} },
  },
  {
    name: 'axiom',
    value: 'axiom',
    description: 'Query and analyze logs, traces, events (Axiom)',
    category: 'Monitoring',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', '@axiomhq/mcp-server-axiom'], environment: { AXIOM_TOKEN: '{env:AXIOM_TOKEN}' } },
  },

  // ── Database ──────────────────────────────────────────────────────────────
  {
    name: 'postgres',
    value: 'postgres',
    description: 'PostgreSQL read-only access with schema inspection (official)',
    category: 'Database',
    relevance: ['node', 'python', 'java', 'go', 'rust', 'ruby', 'php', 'csharp', 'kotlin', 'scala', 'elixir'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-postgres'], environment: { POSTGRES_URL: '{env:DATABASE_URL}' } },
  },
  {
    name: 'sqlite',
    value: 'sqlite',
    description: 'SQLite database interaction and BI queries (official)',
    category: 'Database',
    relevance: ['node', 'python', 'ruby', 'php', 'rust', 'go'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-sqlite'] },
  },
  {
    name: 'redis',
    value: 'redis',
    description: 'Redis key-value store interaction (official)',
    category: 'Database',
    relevance: ['node', 'python', 'java', 'go', 'ruby', 'php'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-redis'], environment: { REDIS_URL: '{env:REDIS_URL}' } },
  },

  // ── Cloud & Infrastructure ────────────────────────────────────────────────
  {
    name: 'aws',
    value: 'aws',
    description: 'AWS best practices and service interaction (official)',
    category: 'Cloud',
    relevance: ['terraform', 'cloudformation', 'docker', 'kubernetes', 'node', 'python', 'java', 'go'],
    config: { type: 'local', command: ['npx', '-y', '@aws/mcp'] },
  },
  {
    name: 'kubernetes',
    value: 'kubernetes',
    description: 'Kubernetes cluster management via kubectl',
    category: 'Cloud',
    relevance: ['kubernetes', 'docker', 'terraform', 'go', 'java', 'node', 'python'],
    config: { type: 'local', command: ['npx', '-y', 'mcp-server-kubernetes'] },
  },

  // ── Deployment & Hosting ──────────────────────────────────────────────────
  {
    name: 'vercel',
    value: 'vercel',
    description: 'Vercel API for deployments and projects',
    category: 'Deployment',
    relevance: ['node'],
    config: { type: 'local', command: ['npx', '-y', 'vercel-mcp'], environment: { VERCEL_TOKEN: '{env:VERCEL_TOKEN}' } },
  },

  // ── Browser & Testing ─────────────────────────────────────────────────────
  {
    name: 'puppeteer',
    value: 'puppeteer',
    description: 'Browser automation and web scraping (official)',
    category: 'Testing',
    relevance: ['node', 'python'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-puppeteer'] },
  },

  // ── Collaboration ─────────────────────────────────────────────────────────
  {
    name: 'atlassian',
    value: 'atlassian',
    description: 'Jira + Confluence integration (official Atlassian)',
    category: 'Collaboration',
    relevance: ['*'],
    config: { type: 'remote', url: 'https://mcp.atlassian.com/v1/sse' },
  },
  {
    name: 'linear',
    value: 'linear',
    description: 'Linear issue tracking integration',
    category: 'Collaboration',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', 'mcp-linear'], environment: { LINEAR_API_KEY: '{env:LINEAR_API_KEY}' } },
  },

  // ── Design ────────────────────────────────────────────────────────────────
  {
    name: 'figma',
    value: 'figma',
    description: 'Figma layout info for AI coding agents (Framelink)',
    category: 'Design',
    relevance: ['node', 'dart'],
    config: { type: 'local', command: ['npx', '-y', 'figma-developer-mcp'], environment: { FIGMA_API_KEY: '{env:FIGMA_API_KEY}' } },
  },
];

export async function promptMcp(project) {
  const install = await confirm({
    message: 'Configure MCP servers?',
    default: true,
  });

  if (!install) return [];

  // Filter and sort MCPs by relevance to selected languages
  const langs = new Set(project.languages || []);

  const choices = [];
  const categories = [...new Set(AVAILABLE_MCP.map(m => m.category))];

  for (const category of categories) {
    const mcpsInCategory = AVAILABLE_MCP.filter(m => m.category === category);
    const relevant = mcpsInCategory.filter(m =>
      m.relevance.includes('*') || m.relevance.some(r => langs.has(r))
    );

    if (relevant.length === 0) continue;

    choices.push({ type: 'separator', separator: chalk.bold.blue(`── ${category} ──`) });
    for (const m of relevant) {
      const isRecommended = m.relevance.includes('*') && ['context7', 'git'].includes(m.value);
      choices.push({
        name: `${m.name} - ${m.description}`,
        value: m.value,
        checked: isRecommended,
      });
    }
  }

  if (choices.length === 0) {
    console.log(chalk.gray('  No relevant MCP servers found for your languages.'));
    return [];
  }

  const selected = await checkbox({
    message: 'Select MCP servers (filtered by your languages):',
    choices,
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
      if (templateBase) {
        const src = path.join(templateBase, 'templates', 'agents', `${agent}.md`);
        const dest = path.join(agentsDir, `${agent}.md`);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        } else {
          // Create a minimal placeholder
          fs.writeFileSync(dest, `---\ndescription: ${agent} agent\nmode: subagent\n---\n\nConfigure this agent.\n`);
        }
      }
    }
    spinner.text = `Installed ${agents.length} agent(s)`;
  }

  if (skills.length > 0) {
    for (const skill of skills) {
      const skillDir = path.join(CWD, '.opencode', 'skills', skill);
      fs.mkdirSync(skillDir, { recursive: true });

      if (templateBase) {
        const src = path.join(templateBase, 'templates', 'skills', skill, 'SKILL.md');
        const dest = path.join(skillDir, 'SKILL.md');
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        } else {
          fs.writeFileSync(dest, `---\nname: ${skill}\ndescription: ${skill} skill\n---\n\nConfigure this skill.\n`);
        }
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

  // ── Write .opencode/advanced.json (state file) ───────────────────────────

  const advancedState = {
    version: '0.2.0',
    setupDate: new Date().toISOString().split('T')[0],
    languages: project.languages,
    framework: project.framework || null,
    packageManager: project.packageManager || null,
    agents,
    skills,
    modelStrategy: modelConfig ? Object.keys(MODEL_PRESETS).find(k => MODEL_PRESETS[k] === modelConfig) || 'custom' : null,
    mcp: mcpConfig,
  };

  fs.mkdirSync(path.join(CWD, '.opencode'), { recursive: true });
  fs.writeFileSync(ADVANCED_JSON_PATH, JSON.stringify(advancedState, null, 2) + '\n');

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
  console.log(chalk.green('    .opencode/advanced.json (state)'));
  console.log('');
}

// ─── Template Resolution ────────────────────────────────────────────────────

function getTemplateBase() {
  // 1. Templates bundled inside the npm package (cli-tool/templates/)
  const packageDir = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(packageDir, 'templates', 'agents'))) {
    return packageDir;
  }

  // 2. Running from repo root (../templates/ from cli-tool/)
  const repoRoot = path.resolve(packageDir, '..');
  if (fs.existsSync(path.join(repoRoot, 'templates', 'agents'))) {
    return repoRoot;
  }

  console.warn(chalk.yellow('\n  Warning: Template directory not found.'));
  console.warn(chalk.yellow('  Agent and skill files will not be copied.\n'));
  return null;
}

// ─── AGENTS.md Generation ───────────────────────────────────────────────────

// Language-specific conventions and hints for AGENTS.md
const LANGUAGE_CONVENTIONS = {
  node: {
    name: 'JavaScript/TypeScript',
    testCmd: 'npm test',
    lintCmd: 'npm run lint',
    buildCmd: 'npm run build',
    conventions: [
      'Use TypeScript with strict mode where possible',
      'Prefer ESM imports over CommonJS require',
      'Use async/await over raw Promises',
    ],
  },
  python: {
    name: 'Python',
    testCmd: 'pytest',
    lintCmd: 'ruff check .',
    buildCmd: null,
    conventions: [
      'Follow PEP 8 style guidelines',
      'Use type hints for function signatures',
      'Use virtual environments for dependency isolation',
    ],
  },
  java: {
    name: 'Java',
    testCmd: 'mvn test',
    lintCmd: null,
    buildCmd: 'mvn package',
    conventions: [
      'Follow Java naming conventions (camelCase methods, PascalCase classes)',
      'Use dependency injection where applicable',
      'Write unit tests with JUnit 5',
    ],
  },
  kotlin: {
    name: 'Kotlin',
    testCmd: 'gradle test',
    lintCmd: 'gradle ktlintCheck',
    buildCmd: 'gradle build',
    conventions: [
      'Use data classes for DTOs',
      'Prefer val over var',
      'Use coroutines for async operations',
    ],
  },
  go: {
    name: 'Go',
    testCmd: 'go test ./...',
    lintCmd: 'golangci-lint run',
    buildCmd: 'go build',
    conventions: [
      'Follow effective Go guidelines',
      'Handle errors explicitly, do not ignore them',
      'Use interfaces for abstraction',
    ],
  },
  rust: {
    name: 'Rust',
    testCmd: 'cargo test',
    lintCmd: 'cargo clippy',
    buildCmd: 'cargo build',
    conventions: [
      'Use Result<T, E> for error handling',
      'Prefer ownership and borrowing over cloning',
      'Write documentation comments with ///',
    ],
  },
  ruby: {
    name: 'Ruby',
    testCmd: 'bundle exec rspec',
    lintCmd: 'bundle exec rubocop',
    buildCmd: null,
    conventions: [
      'Follow Ruby style guide',
      'Use RSpec for testing',
      'Keep controllers thin, models fat',
    ],
  },
  php: {
    name: 'PHP',
    testCmd: 'vendor/bin/phpunit',
    lintCmd: 'vendor/bin/phpstan analyse',
    buildCmd: null,
    conventions: [
      'Follow PSR-12 coding standard',
      'Use Composer for dependency management',
      'Use type declarations for parameters and return types',
    ],
  },
  csharp: {
    name: 'C# / .NET',
    testCmd: 'dotnet test',
    lintCmd: null,
    buildCmd: 'dotnet build',
    conventions: [
      'Follow .NET naming conventions',
      'Use async/await for I/O operations',
      'Use dependency injection via built-in DI container',
    ],
  },
  swift: {
    name: 'Swift',
    testCmd: 'swift test',
    lintCmd: 'swiftlint',
    buildCmd: 'swift build',
    conventions: [
      'Follow Swift API design guidelines',
      'Use guard for early returns',
      'Prefer value types (structs) over reference types (classes)',
    ],
  },
  dart: {
    name: 'Dart / Flutter',
    testCmd: 'flutter test',
    lintCmd: 'dart analyze',
    buildCmd: 'flutter build',
    conventions: [
      'Follow Effective Dart guidelines',
      'Use const constructors where possible',
      'Separate business logic from UI widgets',
    ],
  },
  scala: {
    name: 'Scala',
    testCmd: 'sbt test',
    lintCmd: 'sbt scalafmtCheck',
    buildCmd: 'sbt compile',
    conventions: [
      'Prefer immutable data structures',
      'Use pattern matching over if/else chains',
      'Follow Scala naming conventions (camelCase for vals/defs)',
    ],
  },
  elixir: {
    name: 'Elixir',
    testCmd: 'mix test',
    lintCmd: 'mix credo',
    buildCmd: 'mix compile',
    conventions: [
      'Use pattern matching and guard clauses',
      'Follow OTP conventions for supervision trees',
      'Write doctests for public functions',
    ],
  },
  zig: {
    name: 'Zig',
    testCmd: 'zig build test',
    lintCmd: null,
    buildCmd: 'zig build',
    conventions: [
      'Use comptime for compile-time evaluation',
      'Prefer explicit error handling over exceptions',
      'Avoid hidden control flow and allocations',
    ],
  },
  c: {
    name: 'C',
    testCmd: 'make test',
    lintCmd: 'cppcheck --enable=all .',
    buildCmd: 'make',
    conventions: [
      'Always check return values and handle errors',
      'Free allocated memory and avoid leaks',
      'Use header guards in all .h files',
    ],
  },
  cpp: {
    name: 'C++',
    testCmd: 'make test',
    lintCmd: 'clang-tidy',
    buildCmd: 'cmake --build .',
    conventions: [
      'Use RAII for resource management',
      'Prefer smart pointers over raw pointers',
      'Follow the C++ Core Guidelines',
    ],
  },
  terraform: {
    name: 'Terraform (IaC)',
    testCmd: 'terraform plan',
    lintCmd: 'terraform validate && terraform fmt -check',
    buildCmd: null,
    conventions: [
      'Use modules for reusable infrastructure',
      'Keep state files remote (S3, GCS, Azure Blob)',
      'Use variables and outputs consistently',
      'Tag all resources with project, environment, and owner',
    ],
  },
  ansible: {
    name: 'Ansible (IaC)',
    testCmd: 'ansible-lint',
    lintCmd: 'ansible-lint',
    buildCmd: null,
    conventions: [
      'Use roles for reusable automation',
      'Keep playbooks idempotent',
      'Use variables and vaults for secrets',
    ],
  },
  cloudformation: {
    name: 'CloudFormation (IaC)',
    testCmd: 'cfn-lint template.yaml',
    lintCmd: 'cfn-lint',
    buildCmd: null,
    conventions: [
      'Use nested stacks for modularity',
      'Parameterize environment-specific values',
      'Use Outputs for cross-stack references',
    ],
  },
  bicep: {
    name: 'Azure Bicep (IaC)',
    testCmd: 'az bicep build --file main.bicep',
    lintCmd: null,
    buildCmd: 'az bicep build',
    conventions: [
      'Use modules for reusable components',
      'Parameterize environment-specific values',
      'Follow Azure naming conventions for resources',
    ],
  },
  pulumi: {
    name: 'Pulumi (IaC)',
    testCmd: 'pulumi preview',
    lintCmd: null,
    buildCmd: null,
    conventions: [
      'Use component resources for reusability',
      'Store state in a managed backend',
      'Use stack references for cross-stack dependencies',
    ],
  },
  kubernetes: {
    name: 'Kubernetes',
    testCmd: 'kubectl diff -f .',
    lintCmd: 'kubeval .',
    buildCmd: null,
    conventions: [
      'Use namespaces to isolate workloads',
      'Set resource requests and limits on all containers',
      'Use labels and selectors consistently',
    ],
  },
  docker: {
    name: 'Docker / Containers',
    testCmd: null,
    lintCmd: 'hadolint Dockerfile',
    buildCmd: 'docker build .',
    conventions: [
      'Use multi-stage builds for smaller images',
      'Pin base image versions',
      'Do not run as root in containers',
    ],
  },
  solidity: {
    name: 'Solidity (Web3)',
    testCmd: 'npx hardhat test',
    lintCmd: 'solhint "contracts/**/*.sol"',
    buildCmd: 'npx hardhat compile',
    conventions: [
      'Follow Checks-Effects-Interactions pattern',
      'Use OpenZeppelin contracts where applicable',
      'Write comprehensive unit tests for all functions',
    ],
  },
  shell: {
    name: 'Shell Scripts',
    testCmd: 'bats test/',
    lintCmd: 'shellcheck **/*.sh',
    buildCmd: null,
    conventions: [
      'Use set -euo pipefail at the start of scripts',
      'Quote all variable expansions',
      'Use functions for reusable logic',
    ],
  },
  sql: {
    name: 'SQL / Database',
    testCmd: null,
    lintCmd: 'sqlfluff lint',
    buildCmd: null,
    conventions: [
      'Use migrations for all schema changes',
      'Add indexes for frequently queried columns',
      'Use parameterized queries to prevent SQL injection',
    ],
  },
  markdown: {
    name: 'Documentation / Markdown',
    testCmd: null,
    lintCmd: 'markdownlint "**/*.md"',
    buildCmd: null,
    conventions: [
      'Use consistent heading levels',
      'Keep line length under 120 characters where practical',
      'Include code examples for technical documentation',
    ],
  },
};

function buildAgentsMd({ project, agents, skills, modelConfig }) {
  const languages = project.languages || [];
  const framework = project.framework ? ` with ${project.framework}` : '';

  // Build language names string
  const langNames = languages
    .map(l => {
      const conv = LANGUAGE_CONVENTIONS[l];
      return conv ? conv.name : l;
    })
    .filter(Boolean);

  const langDescription = langNames.length > 0
    ? langNames.join(', ')
    : 'this project';

  let md = `# Project Rules\n\n`;
  md += `This is a ${langDescription}${framework} project.\n\n`;

  // ── Project structure hint
  md += `## Project Structure\n\n`;
  md += `<!-- TODO: Describe your project structure here -->\n`;
  md += `<!-- Example:\n`;
  md += `- \`src/\` - Application source code\n`;
  md += `- \`tests/\` - Test files\n`;
  md += `- \`docs/\` - Documentation\n`;
  md += `-->\n\n`;

  // ── Code standards from all languages
  const allConventions = [];
  for (const lang of languages) {
    const conv = LANGUAGE_CONVENTIONS[lang];
    if (conv && conv.conventions) {
      allConventions.push({ name: conv.name, conventions: conv.conventions });
    }
  }

  if (allConventions.length === 1) {
    md += `## Code Standards\n\n`;
    for (const c of allConventions[0].conventions) {
      md += `- ${c}\n`;
    }
    md += `\n`;
  } else if (allConventions.length > 1) {
    md += `## Code Standards\n\n`;
    for (const group of allConventions) {
      md += `### ${group.name}\n\n`;
      for (const c of group.conventions) {
        md += `- ${c}\n`;
      }
      md += `\n`;
    }
  }

  // ── Commands from all languages
  const commands = [];
  for (const lang of languages) {
    const conv = LANGUAGE_CONVENTIONS[lang];
    if (conv && (conv.testCmd || conv.lintCmd || conv.buildCmd)) {
      commands.push(conv);
    }
  }

  if (commands.length === 1) {
    const conv = commands[0];
    md += `## Commands\n\n`;
    if (conv.buildCmd) md += `- **Build:** \`${conv.buildCmd}\`\n`;
    if (conv.testCmd) md += `- **Test:** \`${conv.testCmd}\`\n`;
    if (conv.lintCmd) md += `- **Lint:** \`${conv.lintCmd}\`\n`;
    md += `\n`;
  } else if (commands.length > 1) {
    md += `## Commands\n\n`;
    for (const conv of commands) {
      md += `### ${conv.name}\n\n`;
      if (conv.buildCmd) md += `- **Build:** \`${conv.buildCmd}\`\n`;
      if (conv.testCmd) md += `- **Test:** \`${conv.testCmd}\`\n`;
      if (conv.lintCmd) md += `- **Lint:** \`${conv.lintCmd}\`\n`;
      md += `\n`;
    }
  }

  // ── Package manager
  if (project.packageManager) {
    md += `## Package Manager\n\n`;
    md += `This project uses **${project.packageManager}**. `;
    md += `Always use \`${project.packageManager}\` for installing dependencies.\n\n`;
  }

  // ── Installed agents
  if (agents.length > 0) {
    md += `## Custom Agents\n\n`;
    md += `The following custom subagents are available (invoke with \`@agent-name\`):\n\n`;
    // Build a description map from AVAILABLE_AGENTS
    const agentDescMap = {};
    for (const a of AVAILABLE_AGENTS) {
      agentDescMap[a.value] = a.description;
    }
    for (const a of agents) {
      md += `- **@${a}**: ${agentDescMap[a] || a}\n`;
    }
    md += `\n`;
  }

  // ── Installed skills
  if (skills.length > 0) {
    md += `## Available Skills\n\n`;
    md += `The following skills are installed and will be loaded on demand:\n\n`;
    // Build a description map from AVAILABLE_SKILLS
    const skillDescMap = {};
    for (const s of AVAILABLE_SKILLS) {
      skillDescMap[s.value] = s.description;
    }
    for (const s of skills) {
      md += `- **${s}**: ${skillDescMap[s] || s}\n`;
    }
    md += `\n`;
  }

  // ── Conventions
  md += `## Conventions\n\n`;
  md += `- Use conventional commits: \`feat:\`, \`fix:\`, \`chore:\`, \`docs:\`, \`refactor:\`, \`test:\`\n`;
  md += `- Write meaningful commit messages that explain the "why"\n`;
  md += `- Keep PRs focused on a single concern\n`;

  return md;
}

export async function promptAgentsMd({ project, agents, skills, modelConfig }) {
  // Already has one -- skip
  if (project.hasAgentsMd) {
    console.log(chalk.gray('  AGENTS.md already exists -- skipping generation.'));
    console.log('');
    return;
  }

  const generate = await confirm({
    message: 'No AGENTS.md found. Generate one with project-specific rules?',
    default: true,
  });

  if (!generate) return;

  const content = buildAgentsMd({ project, agents, skills, modelConfig });
  const dest = path.join(CWD, 'AGENTS.md');
  fs.writeFileSync(dest, content);

  console.log(chalk.green('    AGENTS.md (generated)'));
  console.log(chalk.gray('    Tip: Review and customize it, then commit to Git.'));
  console.log('');
}

// ─── Outro ──────────────────────────────────────────────────────────────────

export function outro() {
  console.log(chalk.bold.green('  Setup complete!'));
  console.log('');
}

// ─── Launch OpenCode ────────────────────────────────────────────────────────

export async function launchOpenCode() {
  // Check if opencode is installed
  let opencodeAvailable = false;
  try {
    execSync('which opencode', { stdio: 'ignore' });
    opencodeAvailable = true;
  } catch {
    // not installed
  }

  if (!opencodeAvailable) {
    console.log(chalk.yellow('  OpenCode is not installed.'));
    console.log(chalk.gray('  Install it: https://opencode.ai/docs/'));
    console.log('');
    console.log(chalk.gray('  After installing, run:'));
    console.log(chalk.white('    opencode'));
    console.log('');
    return;
  }

  const launch = await confirm({
    message: 'Start OpenCode now?',
    default: true,
  });

  if (!launch) {
    console.log('');
    console.log(chalk.gray('  To start later, run:'));
    console.log(chalk.white('    opencode'));
    console.log('');
    return;
  }

  console.log('');
  console.log(chalk.cyan('  Starting OpenCode...'));
  console.log('');

  // Spawn opencode as a child process that replaces this one
  const child = spawn('opencode', [], {
    stdio: 'inherit',
    cwd: CWD,
  });

  child.on('error', (err) => {
    console.error(chalk.red(`  Failed to start OpenCode: ${err.message}`));
  });

  // Wait for opencode to exit before our process exits
  await new Promise((resolve) => {
    child.on('close', resolve);
  });
}

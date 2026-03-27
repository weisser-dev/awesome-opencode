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
  // ── Core Development ──────────────────────────────────────────────────────
  { name: 'api-designer', value: 'api-designer', description: 'REST/GraphQL API design and contract definition', category: 'Core Development' },
  { name: 'backend-developer', value: 'backend-developer', description: 'Server-side logic, APIs, and data processing', category: 'Core Development' },
  { name: 'frontend-developer', value: 'frontend-developer', description: 'UI implementation, components, and browser APIs', category: 'Core Development' },
  { name: 'fullstack-developer', value: 'fullstack-developer', description: 'End-to-end feature development across the stack', category: 'Core Development' },
  { name: 'graphql-architect', value: 'graphql-architect', description: 'GraphQL schema design, resolvers, and federation', category: 'Core Development' },
  { name: 'microservices-architect', value: 'microservices-architect', description: 'Microservices design, boundaries, and communication', category: 'Core Development' },
  { name: 'mobile-developer', value: 'mobile-developer', description: 'Native and cross-platform mobile app development', category: 'Core Development' },
  { name: 'websocket-engineer', value: 'websocket-engineer', description: 'Real-time communication and WebSocket protocol design', category: 'Core Development' },

  // ── Language Specialists ───────────────────────────────────────────────────
  { name: 'typescript-pro', value: 'typescript-pro', description: 'TypeScript type system, generics, and advanced patterns', category: 'Language Specialists' },
  { name: 'javascript-pro', value: 'javascript-pro', description: 'Modern JavaScript, ES modules, and runtime optimization', category: 'Language Specialists' },
  { name: 'python-pro', value: 'python-pro', description: 'Pythonic patterns, async, and ecosystem best practices', category: 'Language Specialists' },
  { name: 'java-architect', value: 'java-architect', description: 'Java architecture, JVM tuning, and enterprise patterns', category: 'Language Specialists' },
  { name: 'kotlin-specialist', value: 'kotlin-specialist', description: 'Kotlin idioms, coroutines, and multiplatform development', category: 'Language Specialists' },
  { name: 'golang-pro', value: 'golang-pro', description: 'Go concurrency, interfaces, and systems programming', category: 'Language Specialists' },
  { name: 'rust-engineer', value: 'rust-engineer', description: 'Rust ownership, lifetimes, and zero-cost abstractions', category: 'Language Specialists' },
  { name: 'swift-expert', value: 'swift-expert', description: 'Swift protocols, concurrency, and Apple platform APIs', category: 'Language Specialists' },
  { name: 'cpp-pro', value: 'cpp-pro', description: 'Modern C++ patterns, templates, and memory management', category: 'Language Specialists' },
  { name: 'csharp-developer', value: 'csharp-developer', description: 'C# and .NET ecosystem, LINQ, and async patterns', category: 'Language Specialists' },
  { name: 'php-pro', value: 'php-pro', description: 'Modern PHP, Composer, and framework best practices', category: 'Language Specialists' },
  { name: 'ruby-pro', value: 'ruby-pro', description: 'Ruby idioms, metaprogramming, and gem ecosystem', category: 'Language Specialists' },
  { name: 'react-specialist', value: 'react-specialist', description: 'React hooks, state management, and component design', category: 'Language Specialists' },
  { name: 'vue-expert', value: 'vue-expert', description: 'Vue 3 composition API, reactivity, and ecosystem', category: 'Language Specialists' },
  { name: 'angular-architect', value: 'angular-architect', description: 'Angular modules, RxJS, and enterprise-scale SPAs', category: 'Language Specialists' },
  { name: 'nextjs-developer', value: 'nextjs-developer', description: 'Next.js App Router, SSR, RSC, and deployment', category: 'Language Specialists' },
  { name: 'django-developer', value: 'django-developer', description: 'Django ORM, views, middleware, and admin patterns', category: 'Language Specialists' },
  { name: 'fastapi-developer', value: 'fastapi-developer', description: 'FastAPI async endpoints, Pydantic, and OpenAPI', category: 'Language Specialists' },
  { name: 'spring-boot-engineer', value: 'spring-boot-engineer', description: 'Spring Boot auto-config, DI, and reactive stack', category: 'Language Specialists' },
  { name: 'laravel-specialist', value: 'laravel-specialist', description: 'Laravel Eloquent, Blade, queues, and artisan', category: 'Language Specialists' },
  { name: 'flutter-expert', value: 'flutter-expert', description: 'Flutter widgets, state management, and platform channels', category: 'Language Specialists' },
  { name: 'elixir-expert', value: 'elixir-expert', description: 'Elixir OTP, GenServer, and Phoenix LiveView', category: 'Language Specialists' },

  // ── Infrastructure ─────────────────────────────────────────────────────────
  { name: 'azure-infra-engineer', value: 'azure-infra-engineer', description: 'Azure services, ARM/Bicep templates, and cloud networking', category: 'Infrastructure' },
  { name: 'cloud-architect', value: 'cloud-architect', description: 'Multi-cloud architecture, cost optimization, and resilience', category: 'Infrastructure' },
  { name: 'database-administrator', value: 'database-administrator', description: 'Database provisioning, replication, and backup strategy', category: 'Infrastructure' },
  { name: 'deployment-engineer', value: 'deployment-engineer', description: 'Deployment strategies, blue-green, canary, and rollbacks', category: 'Infrastructure' },
  { name: 'devops-engineer', value: 'devops-engineer', description: 'CI/CD pipelines, infrastructure, and deployment', category: 'Infrastructure' },
  { name: 'docker-expert', value: 'docker-expert', description: 'Docker optimization, multi-stage builds, and security', category: 'Infrastructure' },
  { name: 'incident-responder', value: 'incident-responder', description: 'Incident triage, mitigation, and post-mortem coordination', category: 'Infrastructure' },
  { name: 'kubernetes-specialist', value: 'kubernetes-specialist', description: 'Kubernetes orchestration, Helm charts, and cluster ops', category: 'Infrastructure' },
  { name: 'network-engineer', value: 'network-engineer', description: 'Network topology, DNS, load balancing, and firewalls', category: 'Infrastructure' },
  { name: 'platform-engineer', value: 'platform-engineer', description: 'Internal developer platforms and self-service tooling', category: 'Infrastructure' },
  { name: 'security-engineer', value: 'security-engineer', description: 'Infrastructure security, IAM policies, and secrets management', category: 'Infrastructure' },
  { name: 'sre-engineer', value: 'sre-engineer', description: 'Site reliability, monitoring, and incident response', category: 'Infrastructure' },
  { name: 'terraform-engineer', value: 'terraform-engineer', description: 'Terraform modules, state management, and IaC workflows', category: 'Infrastructure' },

  // ── Quality & Security ─────────────────────────────────────────────────────
  { name: 'accessibility-tester', value: 'accessibility-tester', description: 'WCAG compliance and accessibility audit', category: 'Quality & Security' },
  { name: 'architect-reviewer', value: 'architect-reviewer', description: 'Architecture review and design pattern evaluation', category: 'Quality & Security' },
  { name: 'chaos-engineer', value: 'chaos-engineer', description: 'Failure mode analysis and resilience testing', category: 'Quality & Security' },
  { name: 'code-reviewer', value: 'code-reviewer', description: 'Code review with security and performance focus', category: 'Quality & Security' },
  { name: 'compliance-auditor', value: 'compliance-auditor', description: 'Regulatory compliance checks (GDPR, SOC2, HIPAA)', category: 'Quality & Security' },
  { name: 'debugger', value: 'debugger', description: 'Bug investigation and root cause analysis', category: 'Quality & Security' },
  { name: 'error-detective', value: 'error-detective', description: 'Error pattern analysis and root cause detection', category: 'Quality & Security' },
  { name: 'penetration-tester', value: 'penetration-tester', description: 'Offensive security testing and vulnerability exploitation', category: 'Quality & Security' },
  { name: 'performance-engineer', value: 'performance-engineer', description: 'Performance profiling and optimization guidance', category: 'Quality & Security' },
  { name: 'security-auditor', value: 'security-auditor', description: 'Security vulnerability scanning and threat modeling', category: 'Quality & Security' },
  { name: 'test-automator', value: 'test-automator', description: 'End-to-end test automation and CI test pipelines', category: 'Quality & Security' },

  // ── Data & AI ──────────────────────────────────────────────────────────────
  { name: 'ai-engineer', value: 'ai-engineer', description: 'AI system design, model integration, and inference pipelines', category: 'Data & AI' },
  { name: 'data-analyst', value: 'data-analyst', description: 'Data exploration, visualization, and statistical analysis', category: 'Data & AI' },
  { name: 'data-engineer', value: 'data-engineer', description: 'Data pipelines, ETL workflows, and warehouse design', category: 'Data & AI' },
  { name: 'data-scientist', value: 'data-scientist', description: 'Statistical modeling, experiments, and feature engineering', category: 'Data & AI' },
  { name: 'database-optimizer', value: 'database-optimizer', description: 'Query optimization, indexing, and schema design', category: 'Data & AI' },
  { name: 'llm-architect', value: 'llm-architect', description: 'LLM application architecture, RAG, and fine-tuning', category: 'Data & AI' },
  { name: 'machine-learning-engineer', value: 'machine-learning-engineer', description: 'ML model training, evaluation, and deployment', category: 'Data & AI' },
  { name: 'mlops-engineer', value: 'mlops-engineer', description: 'ML pipeline orchestration, model registry, and monitoring', category: 'Data & AI' },
  { name: 'nlp-engineer', value: 'nlp-engineer', description: 'Natural language processing, tokenization, and text analysis', category: 'Data & AI' },
  { name: 'postgres-pro', value: 'postgres-pro', description: 'PostgreSQL tuning, extensions, and advanced SQL', category: 'Data & AI' },
  { name: 'prompt-engineer', value: 'prompt-engineer', description: 'Prompt design, chain-of-thought, and LLM optimization', category: 'Data & AI' },
  { name: 'sql-pro', value: 'sql-pro', description: 'Advanced SQL queries, window functions, and optimization', category: 'Data & AI' },

  // ── Developer Experience ───────────────────────────────────────────────────
  { name: 'build-engineer', value: 'build-engineer', description: 'Build system configuration, caching, and optimization', category: 'Developer Experience' },
  { name: 'cli-developer', value: 'cli-developer', description: 'CLI tool design, argument parsing, and UX patterns', category: 'Developer Experience' },
  { name: 'dependency-manager', value: 'dependency-manager', description: 'Dependency updates, audit, and compatibility checks', category: 'Developer Experience' },
  { name: 'docs-writer', value: 'docs-writer', description: 'Technical documentation and API reference writing', category: 'Developer Experience' },
  { name: 'dx-optimizer', value: 'dx-optimizer', description: 'Developer experience improvement and workflow friction reduction', category: 'Developer Experience' },
  { name: 'git-workflow-manager', value: 'git-workflow-manager', description: 'Git workflow, branching strategy, and commit hygiene', category: 'Developer Experience' },
  { name: 'legacy-modernizer', value: 'legacy-modernizer', description: 'Legacy code modernization and migration planning', category: 'Developer Experience' },
  { name: 'mcp-developer', value: 'mcp-developer', description: 'MCP server development and tool integration', category: 'Developer Experience' },
  { name: 'refactorer', value: 'refactorer', description: 'Code refactoring with test verification', category: 'Developer Experience' },
  { name: 'test-writer', value: 'test-writer', description: 'Test generation following project patterns', category: 'Developer Experience' },
  { name: 'tooling-engineer', value: 'tooling-engineer', description: 'Developer tooling, linters, formatters, and IDE config', category: 'Developer Experience' },

  // ── Specialized Domains ────────────────────────────────────────────────────
  { name: 'blockchain-developer', value: 'blockchain-developer', description: 'Smart contracts, DeFi protocols, and chain integration', category: 'Specialized Domains' },
  { name: 'embedded-systems', value: 'embedded-systems', description: 'Firmware, RTOS, and hardware interface programming', category: 'Specialized Domains' },
  { name: 'fintech-engineer', value: 'fintech-engineer', description: 'Financial systems, ledgers, and regulatory compliance', category: 'Specialized Domains' },
  { name: 'game-developer', value: 'game-developer', description: 'Game engine integration, physics, and rendering pipelines', category: 'Specialized Domains' },
  { name: 'iot-engineer', value: 'iot-engineer', description: 'IoT protocols, edge computing, and device management', category: 'Specialized Domains' },
  { name: 'mobile-app-developer', value: 'mobile-app-developer', description: 'Mobile UI/UX, app lifecycle, and platform guidelines', category: 'Specialized Domains' },
  { name: 'payment-integration', value: 'payment-integration', description: 'Payment gateway integration, PCI compliance, and billing', category: 'Specialized Domains' },
  { name: 'seo-specialist', value: 'seo-specialist', description: 'Technical SEO, structured data, and web performance', category: 'Specialized Domains' },

  // ── Business & Product ─────────────────────────────────────────────────────
  { name: 'business-analyst', value: 'business-analyst', description: 'Requirements gathering, process modeling, and stakeholder analysis', category: 'Business & Product' },
  { name: 'content-marketer', value: 'content-marketer', description: 'Content strategy, copywriting, and brand messaging', category: 'Business & Product' },
  { name: 'legal-advisor', value: 'legal-advisor', description: 'Software licensing, ToS review, and IP guidance', category: 'Business & Product' },
  { name: 'product-manager', value: 'product-manager', description: 'Product roadmap, prioritization, and feature scoping', category: 'Business & Product' },
  { name: 'project-manager', value: 'project-manager', description: 'Project planning, timelines, and resource coordination', category: 'Business & Product' },
  { name: 'sales-engineer', value: 'sales-engineer', description: 'Technical demos, proof-of-concept, and solution design', category: 'Business & Product' },
  { name: 'scrum-master', value: 'scrum-master', description: 'Agile ceremonies, sprint planning, and team facilitation', category: 'Business & Product' },
  { name: 'technical-writer', value: 'technical-writer', description: 'User guides, tutorials, and knowledge base articles', category: 'Business & Product' },
  { name: 'ux-researcher', value: 'ux-researcher', description: 'User research, usability testing, and persona development', category: 'Business & Product' },

  // ── Meta & Orchestration ───────────────────────────────────────────────────
  { name: 'agent-organizer', value: 'agent-organizer', description: 'Agent selection, routing, and capability mapping', category: 'Meta & Orchestration' },
  { name: 'context-manager', value: 'context-manager', description: 'Project context loading and memory management', category: 'Meta & Orchestration' },
  { name: 'error-coordinator', value: 'error-coordinator', description: 'Cross-agent error handling and recovery strategies', category: 'Meta & Orchestration' },
  { name: 'knowledge-synthesizer', value: 'knowledge-synthesizer', description: 'Multi-source knowledge aggregation and summarization', category: 'Meta & Orchestration' },
  { name: 'multi-agent-coordinator', value: 'multi-agent-coordinator', description: 'Parallel agent execution and result merging', category: 'Meta & Orchestration' },
  { name: 'task-distributor', value: 'task-distributor', description: 'Task decomposition and delegation across agents', category: 'Meta & Orchestration' },
  { name: 'workflow-orchestrator', value: 'workflow-orchestrator', description: 'Multi-agent task orchestration and workflow coordination', category: 'Meta & Orchestration' },

  // ── Research & Analysis ────────────────────────────────────────────────────
  { name: 'competitive-analyst', value: 'competitive-analyst', description: 'Competitive landscape analysis and feature benchmarking', category: 'Research & Analysis' },
  { name: 'data-researcher', value: 'data-researcher', description: 'Data source discovery, collection, and quality assessment', category: 'Research & Analysis' },
  { name: 'market-researcher', value: 'market-researcher', description: 'Market sizing, trends analysis, and opportunity mapping', category: 'Research & Analysis' },
  { name: 'research-analyst', value: 'research-analyst', description: 'Technical research synthesis and recommendation reports', category: 'Research & Analysis' },
  { name: 'scientific-literature-researcher', value: 'scientific-literature-researcher', description: 'Academic paper search, citation analysis, and review', category: 'Research & Analysis' },
  { name: 'search-specialist', value: 'search-specialist', description: 'Search engine optimization and information retrieval', category: 'Research & Analysis' },
  { name: 'trend-analyst', value: 'trend-analyst', description: 'Technology trend tracking and adoption forecasting', category: 'Research & Analysis' },
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
  const categories = ['Core Development', 'Language Specialists', 'Infrastructure', 'Quality & Security', 'Data & AI', 'Developer Experience', 'Specialized Domains', 'Business & Product', 'Meta & Orchestration', 'Research & Analysis'];
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

// ─── Model Intelligence ─────────────────────────────────────────────────────
// Model fingerprinting, pricing tiers, and agent-aware optimization.
// Rankings based on LiveCodeBench, Aider, MMLU-Pro benchmarks + pricing data.
// Source: pricepertoken.com/leaderboards/coding, openrouter.ai

// Known model fingerprints -- maps regex patterns to canonical model info.
// This allows recognizing models even through custom providers (e.g. Bedrock, Azure).
const MODEL_FINGERPRINTS = [
  // Anthropic
  { pattern: /claude.*opus.*4/i,      canonical: 'claude-opus-4',     family: 'anthropic', tier: 'frontier', coding: 95, cost: 'high' },
  { pattern: /claude.*sonnet.*4/i,    canonical: 'claude-sonnet-4',   family: 'anthropic', tier: 'strong',   coding: 90, cost: 'medium' },
  { pattern: /claude.*haiku.*4/i,     canonical: 'claude-haiku-4',    family: 'anthropic', tier: 'fast',     coding: 75, cost: 'low' },
  { pattern: /claude.*opus.*3/i,      canonical: 'claude-opus-3',     family: 'anthropic', tier: 'strong',   coding: 80, cost: 'high' },
  { pattern: /claude.*sonnet.*3/i,    canonical: 'claude-sonnet-3',   family: 'anthropic', tier: 'strong',   coding: 78, cost: 'medium' },
  { pattern: /claude.*haiku.*3/i,     canonical: 'claude-haiku-3',    family: 'anthropic', tier: 'fast',     coding: 60, cost: 'low' },
  // OpenAI
  { pattern: /gpt.*5\.?2/i,          canonical: 'gpt-5.2',           family: 'openai',    tier: 'frontier', coding: 93, cost: 'high' },
  { pattern: /gpt.*5\.?1.*codex/i,   canonical: 'gpt-5.1-codex',     family: 'openai',    tier: 'strong',   coding: 88, cost: 'medium' },
  { pattern: /gpt.*5\.?1/i,          canonical: 'gpt-5.1',           family: 'openai',    tier: 'strong',   coding: 85, cost: 'medium' },
  { pattern: /gpt.*5/i,              canonical: 'gpt-5',             family: 'openai',    tier: 'strong',   coding: 85, cost: 'medium' },
  { pattern: /gpt.*4o[\b-]/i,        canonical: 'gpt-4o',            family: 'openai',    tier: 'strong',   coding: 80, cost: 'medium' },
  { pattern: /gpt.*4o.*mini/i,       canonical: 'gpt-4o-mini',       family: 'openai',    tier: 'fast',     coding: 65, cost: 'low' },
  { pattern: /o3/i,                   canonical: 'o3',                family: 'openai',    tier: 'frontier', coding: 96, cost: 'very-high' },
  { pattern: /o4.*mini/i,            canonical: 'o4-mini',            family: 'openai',    tier: 'strong',   coding: 88, cost: 'medium' },
  // Google
  { pattern: /gemini.*3.*pro/i,      canonical: 'gemini-3-pro',      family: 'google',    tier: 'strong',   coding: 82, cost: 'medium' },
  { pattern: /gemini.*2\.?5.*pro/i,  canonical: 'gemini-2.5-pro',    family: 'google',    tier: 'strong',   coding: 80, cost: 'medium' },
  { pattern: /gemini.*2\.?5.*flash/i,canonical: 'gemini-2.5-flash',  family: 'google',    tier: 'fast',     coding: 72, cost: 'low' },
  { pattern: /gemini.*2.*flash/i,    canonical: 'gemini-2-flash',    family: 'google',    tier: 'fast',     coding: 68, cost: 'low' },
  // DeepSeek
  { pattern: /deepseek.*v3/i,        canonical: 'deepseek-v3',       family: 'deepseek',  tier: 'strong',   coding: 82, cost: 'low' },
  { pattern: /deepseek.*r1/i,        canonical: 'deepseek-r1',       family: 'deepseek',  tier: 'strong',   coding: 85, cost: 'low' },
  // Meta
  { pattern: /llama.*4.*maverick/i,  canonical: 'llama-4-maverick',  family: 'meta',      tier: 'strong',   coding: 78, cost: 'low' },
  { pattern: /llama.*4.*scout/i,     canonical: 'llama-4-scout',     family: 'meta',      tier: 'fast',     coding: 70, cost: 'very-low' },
  { pattern: /llama.*3.*405/i,       canonical: 'llama-3-405b',      family: 'meta',      tier: 'strong',   coding: 75, cost: 'low' },
  { pattern: /llama.*3.*70/i,        canonical: 'llama-3-70b',       family: 'meta',      tier: 'fast',     coding: 65, cost: 'very-low' },
  // Mistral
  { pattern: /mistral.*large/i,      canonical: 'mistral-large',     family: 'mistral',   tier: 'strong',   coding: 75, cost: 'medium' },
  { pattern: /codestral/i,           canonical: 'codestral',         family: 'mistral',   tier: 'strong',   coding: 78, cost: 'low' },
];

const COST_LABELS = { 'very-low': '$', 'low': '$$', 'medium': '$$$', 'high': '$$$$', 'very-high': '$$$$$' };
const TIER_LABELS = { 'frontier': 'Frontier (best quality)', 'strong': 'Strong (good balance)', 'fast': 'Fast (cheap & quick)' };

/**
 * Given a model ID string (possibly from a custom provider like "eu.anthropic.claude-sonnet-4-6"),
 * try to match it to a known model family and return its info.
 */
function fingerprintModel(modelId) {
  if (!modelId) return null;
  for (const fp of MODEL_FINGERPRINTS) {
    if (fp.pattern.test(modelId)) {
      return { ...fp, originalId: modelId };
    }
  }
  return { originalId: modelId, canonical: modelId, family: 'unknown', tier: 'unknown', coding: 0, cost: 'unknown' };
}

/**
 * Scan an opencode.json config for all model references (top-level + per-agent)
 * and return a deduplicated list of fingerprinted models.
 */
function detectModelsInConfig(config) {
  if (!config) return [];
  const modelIds = new Set();

  if (config.model) modelIds.add(config.model);
  if (config.small_model) modelIds.add(config.small_model);

  // Scan providers for custom model definitions
  if (config.provider) {
    for (const [providerName, providerConfig] of Object.entries(config.provider)) {
      if (providerConfig.models) {
        for (const [modelKey, modelDef] of Object.entries(providerConfig.models)) {
          // Use the provider/model key format
          modelIds.add(`${providerName}/${modelKey}`);
        }
      }
    }
  }

  // Scan agents for model references
  if (config.agent) {
    for (const [agentName, agentConfig] of Object.entries(config.agent)) {
      if (agentConfig.model) modelIds.add(agentConfig.model);
    }
  }

  return [...modelIds].map(id => fingerprintModel(id)).filter(Boolean);
}

// Agent tiers: which agents need which model quality and iteration limits.
// tier: frontier = complex reasoning, code generation, architecture
//       strong   = good balance of speed and quality
//       fast     = read-only, exploration, simple tasks
// steps: max agentic iterations (null = unlimited, number = limit)
//   - Code-writing agents: no limit (they need to iterate until done)
//   - Analysis/review agents: 10-15 steps (read, analyze, report)
//   - Fast/read-only agents: 5-10 steps (quick lookups)
const AGENT_TIERS = {
  // Primary agents
  build:   { tier: 'frontier', steps: null },
  plan:    { tier: 'fast',     steps: null },
  // Subagents that WRITE code -- no step limit
  'backend-developer':  { tier: 'frontier', steps: null },
  'frontend-developer': { tier: 'frontier', steps: null },
  'fullstack-developer':{ tier: 'frontier', steps: null },
  'api-designer':       { tier: 'strong',   steps: null },
  'graphql-architect':  { tier: 'strong',   steps: null },
  'microservices-architect': { tier: 'strong', steps: null },
  'refactorer':         { tier: 'strong',   steps: null },
  'test-writer':        { tier: 'strong',   steps: null },
  'test-automator':     { tier: 'strong',   steps: null },
  // Language specialists -- no step limit (they write code)
  'typescript-pro': { tier: 'frontier', steps: null },
  'javascript-pro': { tier: 'frontier', steps: null },
  'python-pro':     { tier: 'frontier', steps: null },
  'java-architect': { tier: 'frontier', steps: null },
  'rust-engineer':  { tier: 'frontier', steps: null },
  'golang-pro':     { tier: 'frontier', steps: null },
  'react-specialist':    { tier: 'strong', steps: null },
  'nextjs-developer':    { tier: 'strong', steps: null },
  'vue-expert':          { tier: 'strong', steps: null },
  'spring-boot-engineer':{ tier: 'strong', steps: null },
  'django-developer':    { tier: 'strong', steps: null },
  'fastapi-developer':   { tier: 'strong', steps: null },
  // READ-ONLY / analysis agents -- limited steps
  'code-reviewer':       { tier: 'strong', steps: 15 },
  'architect-reviewer':  { tier: 'strong', steps: 15 },
  'security-auditor':    { tier: 'strong', steps: 15 },
  'performance-engineer':{ tier: 'strong', steps: 15 },
  'compliance-auditor':  { tier: 'strong', steps: 15 },
  'debugger':            { tier: 'strong', steps: 20 },
  'error-detective':     { tier: 'strong', steps: 15 },
  'penetration-tester':  { tier: 'strong', steps: 15 },
  'accessibility-tester':{ tier: 'strong', steps: 10 },
  'chaos-engineer':      { tier: 'strong', steps: 10 },
  // Cheap/fast agents -- tight step limits
  'docs-writer':         { tier: 'fast', steps: 10 },
  'technical-writer':    { tier: 'fast', steps: 10 },
  'context-manager':     { tier: 'fast', steps: 5 },
  'task-distributor':    { tier: 'fast', steps: 5 },
  'search-specialist':   { tier: 'fast', steps: 8 },
  'research-analyst':    { tier: 'fast', steps: 10 },
  'dependency-manager':  { tier: 'fast', steps: 10 },
  'git-workflow-manager':{ tier: 'fast', steps: 8 },
  // Business/product -- advisory, limited steps
  'business-analyst':    { tier: 'strong', steps: 10 },
  'product-manager':     { tier: 'strong', steps: 10 },
  'project-manager':     { tier: 'strong', steps: 8 },
  'scrum-master':        { tier: 'fast',   steps: 8 },
  'ux-researcher':       { tier: 'strong', steps: 10 },
  // Research -- moderate steps
  'competitive-analyst': { tier: 'strong', steps: 12 },
  'trend-analyst':       { tier: 'strong', steps: 10 },
  'market-researcher':   { tier: 'strong', steps: 10 },
  'data-researcher':     { tier: 'strong', steps: 12 },
  // Orchestration -- limited steps (they delegate, not execute)
  'workflow-orchestrator':     { tier: 'strong', steps: 10 },
  'multi-agent-coordinator':  { tier: 'strong', steps: 10 },
  'agent-organizer':          { tier: 'fast',   steps: 5 },
  'knowledge-synthesizer':    { tier: 'fast',   steps: 8 },
  'error-coordinator':        { tier: 'strong', steps: 10 },
  // Default for unlisted agents
  '_default': { tier: 'strong', steps: null },
};

function getAgentTier(agentName) {
  const entry = AGENT_TIERS[agentName] || AGENT_TIERS['_default'];
  return typeof entry === 'object' ? entry : { tier: entry, steps: null };
}

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
  const config = project.existingConfig;

  // ── Detect models in existing config ─────────────────────────────────────
  const detectedModels = detectModelsInConfig(config);
  const knownModels = detectedModels.filter(m => m.family !== 'unknown');
  const unknownModels = detectedModels.filter(m => m.family === 'unknown');

  if (detectedModels.length > 0) {
    console.log(chalk.bold('  Models found in your config:'));
    console.log('');

    for (const m of detectedModels) {
      const tierLabel = TIER_LABELS[m.tier] || m.tier;
      const costLabel = COST_LABELS[m.cost] || m.cost;
      const codingScore = m.coding > 0 ? ` | Coding: ${m.coding}/100` : '';
      if (m.family !== 'unknown') {
        console.log(chalk.green(`    ${m.originalId}`));
        console.log(chalk.gray(`      -> ${m.canonical} (${m.family}) | ${tierLabel} | Cost: ${costLabel}${codingScore}`));
      } else {
        console.log(chalk.yellow(`    ${m.originalId}`));
        console.log(chalk.gray(`      -> Unknown model (cannot determine tier/pricing)`));
      }
    }
    console.log('');

    // Optimization suggestions
    if (knownModels.length > 0) {
      const allFrontier = knownModels.every(m => m.tier === 'frontier' || m.cost === 'high' || m.cost === 'very-high');
      const noFastModel = !knownModels.some(m => m.tier === 'fast');

      if (allFrontier) {
        console.log(chalk.yellow('  Tip: All your models are frontier-tier. You could save significantly'));
        console.log(chalk.yellow('  by using a fast/cheap model for Plan, Explore, and read-only agents.'));
        console.log('');
      } else if (noFastModel) {
        console.log(chalk.yellow('  Tip: Consider adding a fast/cheap model (Haiku, GPT-4o-mini, Gemini Flash)'));
        console.log(chalk.yellow('  for Plan/Explore agents and system tasks (title, summary).'));
        console.log('');
      }
    }
  }

  // ── Build choices ────────────────────────────────────────────────────────

  const choices = [];

  // If we detected known models, offer to auto-optimize with THOSE models
  if (knownModels.length >= 2) {
    const frontier = knownModels.filter(m => m.tier === 'frontier').sort((a, b) => b.coding - a.coding)[0];
    const strong = knownModels.filter(m => m.tier === 'strong').sort((a, b) => b.coding - a.coding)[0];
    const fast = knownModels.filter(m => m.tier === 'fast').sort((a, b) => b.coding - a.coding)[0];
    const best = frontier || strong || knownModels[0];
    const cheapest = fast || strong || knownModels[knownModels.length - 1];

    if (best && cheapest && best.originalId !== cheapest.originalId) {
      choices.push({
        name: `Auto-optimize YOUR models (Build: ${best.canonical}, Plan/Explore: ${cheapest.canonical})`,
        value: 'auto',
        _custom: {
          model: best.originalId,
          small_model: cheapest.originalId,
          agents: {
            build: { model: best.originalId },
            plan: { model: cheapest.originalId },
            explore: { model: cheapest.originalId },
            general: { model: (strong || cheapest).originalId },
          },
        },
      });
    }
  }

  // Standard presets
  for (const [key, preset] of Object.entries(MODEL_PRESETS)) {
    choices.push({ name: preset.label, value: key });
  }

  const selected = await select({
    message: 'Model strategy:',
    choices,
    default: choices[0]?.value === 'auto' ? 'auto' : (project.hasOpenCodeConfig ? 'keep' : 'cost-optimized'),
  });

  if (selected === 'keep') return null;
  if (selected === 'auto') {
    const autoConfig = choices.find(c => c.value === 'auto')._custom;
    return autoConfig;
  }
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

// ─── MCP Registry Search ────────────────────────────────────────────────────

const MCP_REGISTRY_URL = 'https://registry.modelcontextprotocol.io/v0/servers';

async function searchMcpRegistry(query) {
  const { default: fetch } = await import('node-fetch').catch(() => {
    // Fallback to global fetch (Node 18+)
    return { default: globalThis.fetch };
  });

  try {
    const res = await fetch(`${MCP_REGISTRY_URL}?q=${encodeURIComponent(query)}&limit=30`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.servers) return [];

    // Deduplicate by name (keep latest version)
    const seen = new Map();
    for (const entry of data.servers) {
      const s = entry.server;
      const meta = entry._meta?.['io.modelcontextprotocol.registry/official'];
      if (!meta?.isLatest) continue;
      if (seen.has(s.name)) continue;

      const remote = s.remotes?.[0];
      const pkg = s.packages?.[0];

      let config = null;
      if (remote?.url) {
        config = { type: 'remote', url: remote.url };
        if (remote.headers?.length > 0) {
          config.headers = {};
          for (const h of remote.headers) {
            config.headers[h.name] = h.isSecret ? `{env:${h.name.replace(/-/g, '_').toUpperCase()}}` : '';
          }
        }
      } else if (pkg?.identifier) {
        if (pkg.registryType === 'npm') {
          config = { type: 'local', command: ['npx', '-y', pkg.identifier] };
        }
      }

      if (!config) continue;

      seen.set(s.name, {
        name: s.name,
        title: s.title || s.name.split('/').pop(),
        description: (s.description || '').slice(0, 100),
        version: s.version,
        url: s.websiteUrl || '',
        config,
      });
    }

    return [...seen.values()];
  } catch (err) {
    return [];
  }
}

export async function promptMcpSearch(currentMcpSelections) {
  const { input } = await import('@inquirer/prompts');

  const doSearch = await confirm({
    message: 'Search the official MCP Registry for more servers?',
    default: false,
  });

  if (!doSearch) return [];

  const query = await input({
    message: 'Search MCP Registry (e.g. "database", "aws", "slack"):',
  });

  if (!query.trim()) return [];

  const spinner = ora(`Searching MCP Registry for "${query}"...`).start();
  const results = await searchMcpRegistry(query.trim());
  spinner.stop();

  if (results.length === 0) {
    console.log(chalk.gray(`  No results found for "${query}".`));
    console.log(chalk.gray(`  Browse manually: https://registry.modelcontextprotocol.io`));
    console.log('');
    return [];
  }

  console.log(chalk.gray(`  Found ${results.length} server(s):`));
  console.log('');

  const choices = results.map(r => ({
    name: `${r.title} (${r.name}@${r.version}) - ${r.description}`,
    value: r.name,
  }));

  const selected = await checkbox({
    message: 'Select servers to add:',
    choices,
  });

  // Return full config objects for selected servers
  return selected.map(name => {
    const server = results.find(r => r.name === name);
    return { name: server.title || name, value: name, config: server.config };
  });
}

// ─── Cost & Context Control ─────────────────────────────────────────────────

export async function promptCostControl(agents) {
  const apply = await confirm({
    message: 'Apply recommended step limits per agent? (controls context/cost)',
    default: true,
  });

  if (!apply) return { steps: false, compaction: true };

  console.log('');
  console.log(chalk.gray('  Step limits control how many iterations each agent can perform.'));
  console.log(chalk.gray('  Code-writing agents: unlimited | Review agents: 10-15 | Fast agents: 5-10'));
  console.log('');

  // Show what would be applied for selected agents
  const limited = agents.filter(a => {
    const t = getAgentTier(a);
    return t.steps !== null;
  });
  const unlimited = agents.filter(a => {
    const t = getAgentTier(a);
    return t.steps === null;
  });

  if (limited.length > 0) {
    console.log(chalk.gray('  Limited:'));
    for (const a of limited.slice(0, 8)) {
      const t = getAgentTier(a);
      console.log(chalk.gray(`    ${a}: ${t.steps} steps`));
    }
    if (limited.length > 8) console.log(chalk.gray(`    ... and ${limited.length - 8} more`));
  }
  if (unlimited.length > 0) {
    console.log(chalk.gray(`  Unlimited: ${unlimited.join(', ')}`));
  }
  console.log('');

  return { steps: true, compaction: true };
}

// ─── File Generation ────────────────────────────────────────────────────────

export async function generateFiles({ project, agents, skills, modelConfig, mcpConfig, mcpSearchResults = [], costControl = {} }) {
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

  // Add MCP servers from registry search
  if (mcpSearchResults.length > 0) {
    if (!config.mcp) config.mcp = {};
    for (const result of mcpSearchResults) {
      const safeName = result.value.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      config.mcp[safeName] = result.config;
    }
  }

  // Add step limits per agent (cost control)
  if (costControl.steps && agents.length > 0) {
    if (!config.agent) config.agent = {};
    for (const agentName of agents) {
      const agentInfo = getAgentTier(agentName);
      if (agentInfo.steps !== null) {
        if (!config.agent[agentName]) config.agent[agentName] = {};
        config.agent[agentName].steps = agentInfo.steps;
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

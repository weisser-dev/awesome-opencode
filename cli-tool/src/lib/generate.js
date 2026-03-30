// ─── File Generation ─────────────────────────────────────────────────────────

import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AVAILABLE_AGENTS } from '../data/agents.js';
import { AVAILABLE_SKILLS } from '../data/skills.js';
import { AVAILABLE_MCP } from '../data/mcp.js';
import { MODEL_PRESETS, getAgentTier } from '../data/models.js';

const CWD = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADVANCED_JSON_PATH = path.join(CWD, '.opencode', 'advanced.json');

// ─── Template Resolution ────────────────────────────────────────────────────

function getTemplateBase() {
  // 1. Templates bundled inside the npm package (cli-tool/templates/)
  //    __dirname is cli-tool/src/lib, so go up two levels to cli-tool/
  const packageDir = path.resolve(__dirname, '..', '..');
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

// ─── Main File Generation ────────────────────────────────────────────────────

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

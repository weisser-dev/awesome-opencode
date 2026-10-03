#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { intro, checkExistingSetup, detectProject, promptAgents, promptSkills, promptModels, promptMcp, promptMcpSearch, promptCostControl, generateFiles, promptAgentsMd, outro, launchOpenCode } from './setup.js';
import { runPacksCommand, promptAndInstallPacks, PACKS_HELP } from './lib/packs-cli.js';

// ── Parse flags ─────────────────────────────────────────────────────────────

const rawArgs = process.argv.slice(2);
const flags = {};
const positional = [];
const packArgs = [];
const PACK_COMMANDS = new Set(['packs', 'design-pack']);

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (PACK_COMMANDS.has(positional[0]) && !['--skipSSL', '--skip-ssl', '--crt', '--config'].includes(arg)) {
    packArgs.push(arg);  // options of the packs command are parsed in lib/packs-cli.js
  } else if (arg === '--skipSSL' || arg === '--skip-ssl') {
    flags.skipSSL = true;
  } else if (arg === '--config' && rawArgs[i + 1]) {
    flags.configPath = path.resolve(rawArgs[++i]);
  } else if (arg === '--crt' && rawArgs[i + 1]) {
    flags.crtPath = path.resolve(rawArgs[++i]);
  } else if (arg === '--help' || arg === '-h') {
    flags.help = true;
  } else {
    positional.push(arg);
  }
}

const command = positional[0] || '';
const subcommand = positional[1] || '';

// ── Apply flags ─────────────────────────────────────────────────────────────

if (flags.skipSSL) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

if (flags.crtPath) {
  if (!fs.existsSync(flags.crtPath)) {
    console.error(`Error: Certificate file not found: ${flags.crtPath}`);
    process.exit(1);
  }
  process.env.NODE_EXTRA_CA_CERTS = flags.crtPath;
}

if (flags.configPath) {
  if (!fs.existsSync(flags.configPath)) {
    console.error(`Error: Config file not found: ${flags.configPath}`);
    process.exit(1);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  try {
    if (PACK_COMMANDS.has(command)) {
      intro();
      // design-pack = packs with the design pack preselected (kept as a short alias)
      await runPacksCommand(packArgs, { defaultPacks: ['design'] });
      return;
    }

    if (flags.help) {
      showHelp();
      return;
    }

    if (command === 'configure') {
      intro();
      await handleConfigure(subcommand);
      return;
    }

    intro();

    const existing = checkExistingSetup();
    if (existing) {
      await handleExistingSetup(existing);
      return;
    }

    await runFullSetup();
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\nSetup cancelled.');
      process.exit(0);
    }
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
  awesome-opencode - Setup OpenCode with best practices

  Usage:
    awesome-opencode                    Interactive setup (or re-run menu)
    awesome-opencode configure          Reconfigure everything
    awesome-opencode configure agents   Add/remove agents
    awesome-opencode configure skills   Add/remove skills
    awesome-opencode configure models   Change model strategy
    awesome-opencode configure mcp      Add/remove MCP servers
    awesome-opencode configure packs    Choose and install skill packs interactively
    awesome-opencode packs [options]    Install skill packs (design, process, behavior)
    awesome-opencode design-pack        Same as "packs --pack design"

  Flags:
    --help, -h                          Show this help
    --config <path>                     Path to external opencode.json
                                        (default: ./opencode.json)
    --crt <path>                        Path to custom CA certificate (.crt/.pem)
                                        Sets NODE_EXTRA_CA_CERTS for TLS
    --skipSSL                           Disable TLS certificate verification
                                        Sets NODE_TLS_REJECT_UNAUTHORIZED=0

  Examples:
    npx @weisser-dev/awesome-opencode
    awesome-opencode --config ~/shared/opencode.json
    awesome-opencode --crt /etc/ssl/corporate-ca.crt
    awesome-opencode --skipSSL configure models
    awesome-opencode --config /mnt/config/opencode.json --crt /mnt/certs/ca.pem

  Docs: https://github.com/weisser-dev/awesome-opencode
`);
  console.log(PACKS_HELP);
}

async function handleExistingSetup(existing) {
  const { select } = await import('@inquirer/prompts');
  const chalk = (await import('chalk')).default;

  console.log(chalk.green('  Already configured!'));
  console.log(chalk.gray(`  Last setup: ${existing.setupDate}`));
  if (existing.languages?.length > 0) {
    console.log(chalk.gray(`  Languages:  ${existing.languages.join(', ')}`));
  }
  if (existing.agents?.length > 0) {
    console.log(chalk.gray(`  Agents:     ${existing.agents.join(', ')}`));
  }
  if (existing.skills?.length > 0) {
    console.log(chalk.gray(`  Skills:     ${existing.skills.join(', ')}`));
  }
  if (existing.modelStrategy) {
    console.log(chalk.gray(`  Models:     ${existing.modelStrategy}`));
  }
  if (flags.configPath) {
    console.log(chalk.gray(`  Config:     ${flags.configPath}`));
  }
  if (flags.crtPath) {
    console.log(chalk.gray(`  CA cert:    ${flags.crtPath}`));
  }
  if (flags.skipSSL) {
    console.log(chalk.yellow('  SSL:        verification disabled (--skipSSL)'));
  }
  console.log('');

  // Check if Docker is available for sandboxed option
  let dockerAvailable = false;
  try {
    const { execSync } = await import('child_process');
    execSync('docker --version', { stdio: 'ignore' });
    dockerAvailable = true;
  } catch { /* Docker not installed */ }

  const choices = [
    { name: 'Start OpenCode', value: 'start' },
    ...(dockerAvailable
      ? [{ name: 'Start OpenCode (Sandboxed via Docker)', value: 'sandbox' }]
      : [{ name: 'Start OpenCode (Sandboxed — Docker not found)', value: 'sandbox', disabled: '(Docker required)' }]
    ),
    { name: 'Reconfigure (run setup again)', value: 'reconfigure' },
    { name: 'Configure agents', value: 'configure-agents' },
    { name: 'Configure skills', value: 'configure-skills' },
    { name: 'Configure models', value: 'configure-models' },
    { name: 'Configure MCP servers', value: 'configure-mcp' },
    { name: 'Install skill packs (design / process / behavior)', value: 'configure-packs' },
    { name: 'Exit', value: 'exit' },
  ];

  const action = await select({
    message: 'What would you like to do?',
    choices,
  });

  switch (action) {
    case 'start':
      await launchOpenCode({ forceSandbox: false, flags });
      break;
    case 'sandbox':
      await launchOpenCode({ forceSandbox: true, flags });
      break;
    case 'reconfigure':
      await runFullSetup();
      break;
    case 'configure-agents':
      await handleConfigure('agents');
      break;
    case 'configure-skills':
      await handleConfigure('skills');
      break;
    case 'configure-models':
      await handleConfigure('models');
      break;
    case 'configure-mcp':
      await handleConfigure('mcp');
      break;
    case 'configure-packs':
      await promptAndInstallPacks();
      break;
    // exit: just return
  }
}

async function handleConfigure(what) {
  if (what === 'packs') {
    await promptAndInstallPacks();
    outro();
    return;
  }
  const project = await detectProject({ configPath: flags.configPath });

  switch (what) {
    case 'agents': {
      const agents = await promptAgents(project);
      const costControl = await promptCostControl(agents);
      await generateFiles({ project, agents, skills: [], modelConfig: null, mcpConfig: [], mcpSearchResults: [], costControl });
      break;
    }
    case 'skills': {
      const skills = await promptSkills(project);
      await generateFiles({ project, agents: [], skills, modelConfig: null, mcpConfig: [], mcpSearchResults: [], costControl: {} });
      break;
    }
    case 'models': {
      const modelConfig = await promptModels(project);
      await generateFiles({ project, agents: [], skills: [], modelConfig, mcpConfig: [], mcpSearchResults: [], costControl: {} });
      break;
    }
    case 'mcp': {
      const mcpConfig = await promptMcp(project);
      const mcpSearchResults = await promptMcpSearch(mcpConfig);
      await generateFiles({ project, agents: [], skills: [], modelConfig: null, mcpConfig, mcpSearchResults, costControl: {} });
      break;
    }
    default: {
      await runFullSetup();
    }
  }

  outro();
}

async function runFullSetup() {
  const project = await detectProject({ configPath: flags.configPath });
  const agents = await promptAgents(project);
  const skills = await promptSkills(project);
  const modelConfig = await promptModels(project);

  const mcpConfig = await promptMcp(project);
  const mcpSearchResults = await promptMcpSearch(mcpConfig);

  const costControl = await promptCostControl(agents);

  await generateFiles({ project, agents, skills, modelConfig, mcpConfig, mcpSearchResults, costControl });
  const { confirm } = await import('@inquirer/prompts');
  if (await confirm({ message: 'Install skill packs (design / process / behavior)?', default: false })) {
    await promptAndInstallPacks();
  }
  await promptAgentsMd({ project, agents, skills, modelConfig });
  outro();
  await launchOpenCode({ flags });
}

main();

#!/usr/bin/env node

import { intro, checkExistingSetup, detectProject, promptAgents, promptSkills, promptModels, promptMcp, promptMcpSearch, promptCostControl, generateFiles, promptAgentsMd, outro, launchOpenCode } from './setup.js';

const args = process.argv.slice(2);

// ── Handle --skipSSL flag (can appear anywhere in args) ───────────────────
if (args.includes('--skipSSL') || args.includes('--skip-ssl')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const filteredArgs = args.filter(a => a !== '--skipSSL' && a !== '--skip-ssl');
const command = filteredArgs[0] || '';
const subcommand = filteredArgs[1] || '';

async function main() {
  try {
    // ── Handle --help / -h ────────────────────────────────────────────────
    if (command === '--help' || command === '-h') {
      showHelp();
      return;
    }

    // ── Handle subcommands ────────────────────────────────────────────────
    if (command === 'configure') {
      intro();
      await handleConfigure(subcommand);
      return;
    }

    // ── Default: full setup or re-run ─────────────────────────────────────
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
    awesome-opencode --help             Show this help

  Flags:
    --skipSSL                           Set NODE_TLS_REJECT_UNAUTHORIZED=0
                                        (useful behind corporate proxies)

  Examples:
    npx @weisser-dev/awesome-opencode
    awesome-opencode configure mcp
    awesome-opencode --skipSSL
    awesome-opencode --skipSSL configure models

  Docs: https://github.com/weisser-dev/awesome-opencode
`);
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
    { name: 'Exit', value: 'exit' },
  ];

  const action = await select({
    message: 'What would you like to do?',
    choices,
  });

  switch (action) {
    case 'start':
      await launchOpenCode({ forceSandbox: false });
      break;
    case 'sandbox':
      await launchOpenCode({ forceSandbox: true });
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
    // exit: just return
  }
}

async function handleConfigure(what) {
  const project = await detectProject();

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
      // No subcommand: full reconfigure
      await runFullSetup();
    }
  }

  outro();
}

async function runFullSetup() {
  const project = await detectProject();
  const agents = await promptAgents(project);
  const skills = await promptSkills(project);
  const modelConfig = await promptModels(project);

  // MCP: curated list + optional mcp.so search
  const mcpConfig = await promptMcp(project);
  const mcpSearchResults = await promptMcpSearch(mcpConfig);

  // Cost & context control: step limits per agent
  const costControl = await promptCostControl(agents);

  await generateFiles({ project, agents, skills, modelConfig, mcpConfig, mcpSearchResults, costControl });
  await promptAgentsMd({ project, agents, skills, modelConfig });
  outro();
  await launchOpenCode();
}

main();

#!/usr/bin/env node

import { intro, checkExistingSetup, detectProject, promptAgents, promptSkills, promptModels, promptMcp, generateFiles, promptAgentsMd, outro, launchOpenCode } from './setup.js';

async function main() {
  try {
    intro();

    // Check if setup already ran before
    const existing = checkExistingSetup();
    if (existing) {
      // Already configured -- offer reconfigure or just start
      await handleExistingSetup(existing);
      return;
    }

    // Fresh setup
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

  const action = await select({
    message: 'What would you like to do?',
    choices: [
      { name: 'Start OpenCode', value: 'start' },
      { name: 'Reconfigure (run setup again)', value: 'reconfigure' },
      { name: 'Exit', value: 'exit' },
    ],
  });

  if (action === 'start') {
    await launchOpenCode();
  } else if (action === 'reconfigure') {
    await runFullSetup();
  }
  // exit: just return
}

async function runFullSetup() {
  const project = await detectProject();
  const agents = await promptAgents(project);
  const skills = await promptSkills(project);
  const modelConfig = await promptModels(project);
  const mcpConfig = await promptMcp(project);
  await generateFiles({ project, agents, skills, modelConfig, mcpConfig });
  await promptAgentsMd({ project, agents, skills, modelConfig });
  outro();
  await launchOpenCode();
}

main();

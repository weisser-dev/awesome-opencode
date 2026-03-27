#!/usr/bin/env node

import { intro, detectProject, promptAgents, promptSkills, promptModels, promptMcp, generateFiles, outro } from './setup.js';

async function main() {
  try {
    intro();
    const project = await detectProject();
    const agents = await promptAgents(project);
    const skills = await promptSkills(project);
    const modelConfig = await promptModels(project);
    const mcpConfig = await promptMcp(project);
    await generateFiles({ project, agents, skills, modelConfig, mcpConfig });
    outro();
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\nSetup cancelled.');
      process.exit(0);
    }
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();

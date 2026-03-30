// ─── Launch OpenCode ─────────────────────────────────────────────────────────

import { confirm, select, input, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { DEV_ENVIRONMENTS, PROVIDER_ENV_CONFIGS, PROXY_CONFIGS, ARTIFACT_REGISTRY_CONFIGS, getRecommendedEnvironments } from '../data/docker.js';

const CWD = process.cwd();

export async function launchOpenCode({ forceSandbox, flags = {} } = {}) {
  const { input } = await import('@inquirer/prompts');

  // ── Step 1: Sandbox question ──────────────────────────────────────────────

  let dockerAvailable = false;
  try {
    execSync('docker --version', { stdio: 'ignore' });
    dockerAvailable = true;
  } catch {
    // Docker not installed
  }

  let useSandbox = forceSandbox === true;

  if (!useSandbox && forceSandbox !== false && dockerAvailable) {
    useSandbox = await confirm({
      message: 'Run OpenCode in a sandbox? (Docker container, only this project is accessible — recommended for enterprise)',
      default: false,
    });
  }

  // ── Step 2: Check OpenCode availability ───────────────────────────────────

  let opencodeAvailable = false;
  if (!useSandbox) {
    try {
      execSync('which opencode', { stdio: 'ignore' });
      opencodeAvailable = true;
    } catch {
      // not installed
    }

    if (!opencodeAvailable) {
      console.log(chalk.yellow('  OpenCode is not installed locally.'));
      console.log(chalk.gray('  Install it: https://opencode.ai/docs/'));
      if (dockerAvailable) {
        console.log(chalk.gray('  Or re-run and choose the sandbox option (Docker).'));
      }
      console.log('');
      console.log(chalk.gray('  After installing, run:'));
      console.log(chalk.white('    opencode'));
      console.log('');
      return;
    }
  }

  // ── Step 3: Launch ─────────────────────────────────────────────────────────
  // If forceSandbox was explicitly set (from re-run menu), skip confirmation
  // Only ask "Start OpenCode?" when coming from the full setup flow (forceSandbox === undefined)

  if (forceSandbox === undefined) {
    const modeLabel = useSandbox ? 'Start OpenCode (Sandboxed)' : 'Start OpenCode';
    const launch = await confirm({
      message: `${modeLabel}?`,
      default: true,
    });

    if (!launch) {
      console.log('');
      if (useSandbox) {
        console.log(chalk.gray('  To start sandboxed later, run:'));
        console.log(chalk.white('    awesome-opencode'));
        console.log(chalk.gray('  and choose "Start OpenCode (Sandboxed)"'));
      } else {
        console.log(chalk.gray('  To start later, run:'));
        console.log(chalk.white('    opencode'));
      }
      console.log('');
      return;
    }
  }

  // ── Step 4a: Sandboxed launch ─────────────────────────────────────────────

  if (useSandbox) {
    console.log('');

    // Ask which dev environment (Docker image)
    const { matched, rest, generic } = getRecommendedEnvironments(
      // Try to read languages from advanced.json if available
      (() => {
        try {
          const advPath = path.join(CWD, '.opencode', 'advanced.json');
          if (fs.existsSync(advPath)) {
            return JSON.parse(fs.readFileSync(advPath, 'utf-8')).languages || [];
          }
        } catch { /* ignore */ }
        return [];
      })()
    );

    const envChoices = [];
    if (matched.length > 0) {
      envChoices.push({ type: 'separator', separator: chalk.bold.green('── Recommended for your project ──') });
      for (const env of matched) {
        envChoices.push({ name: env.label, value: env.id });
      }
    }
    if (rest.length > 0) {
      envChoices.push({ type: 'separator', separator: chalk.bold.blue('── Other environments ──') });
      for (const env of rest) {
        envChoices.push({ name: env.label, value: env.id });
      }
    }
    envChoices.push({ type: 'separator', separator: chalk.bold.blue('── General purpose ──') });
    for (const env of generals) {
      envChoices.push({ name: env.label, value: env.id });
    }

    const selectedEnvId = await select({
      message: 'Select dev environment (Docker image):',
      choices: envChoices,
      default: matched.length > 0 ? matched[0].id : 'generic',
    });

    const selectedEnv = DEV_ENVIRONMENTS.find(e => e.id === selectedEnvId);

    // Ask which provider
    const provider = await select({
      message: 'Which LLM provider are you using?',
      choices: PROVIDER_ENV_CONFIGS.map(p => ({ name: p.name, value: p.value })),
    });

    const providerConfig = PROVIDER_ENV_CONFIGS.find(p => p.value === provider);
    const envFlags = [];
    const envSummary = [];

    // Collect env vars for the selected provider
    if (providerConfig && providerConfig.envVars.length > 0) {
      console.log('');
      console.log(chalk.gray(`  Configure ${providerConfig.name} environment variables:`));
      console.log(chalk.gray('  (Leave empty to skip optional vars, they can also be set in your shell)'));
      console.log('');

      for (const envVar of providerConfig.envVars) {
        const label = envVar.required ? `${envVar.key} (required)` : `${envVar.key} (optional)`;

        // Check if already set in current environment
        const existing = process.env[envVar.key];
        if (existing) {
          const masked = envVar.secret ? existing.slice(0, 4) + '...' + existing.slice(-4) : existing;
          const useExisting = await confirm({
            message: `${envVar.key} found in environment (${masked}). Use it?`,
            default: true,
          });
          if (useExisting) {
            envFlags.push(`-e ${envVar.key}`);
            envSummary.push(`${envVar.key} (from env)`);
            continue;
          }
        }

        const value = await input({
          message: `${label} - ${envVar.description}:`,
          default: '',
        });

        if (value.trim()) {
          envFlags.push(`-e ${envVar.key}="${value.trim()}"`);
          envSummary.push(envVar.key);
        } else if (process.env[envVar.key]) {
          // Pass through from host env even if not explicitly entered
          envFlags.push(`-e ${envVar.key}`);
          envSummary.push(`${envVar.key} (from host)`);
        }
      }
    }

    // Ask for additional custom env vars
    const addMore = await confirm({
      message: 'Add additional environment variables?',
      default: false,
    });

    if (addMore) {
      let adding = true;
      while (adding) {
        const key = await input({ message: 'Variable name (e.g. MY_API_KEY):' });
        if (!key.trim()) break;
        const val = await input({ message: `Value for ${key.trim()}:` });
        if (val.trim()) {
          envFlags.push(`-e ${key.trim()}="${val.trim()}"`);
          envSummary.push(key.trim());
        }
        adding = await confirm({ message: 'Add another?', default: false });
      }
    }

    // ── Proxy configuration ────────────────────────────────────────────────
    const addProxy = await confirm({
      message: 'Configure corporate proxy?',
      default: false,
    });

    if (addProxy) {
      const proxyCfg = PROXY_CONFIGS[0];
      console.log('');
      console.log(chalk.gray(`  Configure ${proxyCfg.label}:`));
      console.log('');
      for (const v of proxyCfg.envVars) {
        const existing = process.env[v.key] || process.env[v.key.toLowerCase()];
        if (existing) {
          const use = await confirm({ message: `${v.key} found (${existing}). Use it?`, default: true });
          if (use) { envFlags.push(`-e ${v.key}`); envSummary.push(v.key); continue; }
        }
        const val = await input({ message: `${v.key}${v.required ? ' (required)' : ' (optional)'} - ${v.description}:`, default: '' });
        if (val.trim()) { envFlags.push(`-e ${v.key}="${val.trim()}"`); envSummary.push(v.key); }
      }
    }

    // ── Artifact registry configuration ──────────────────────────────────
    const addArtifact = await confirm({
      message: 'Configure artifact registry (Nexus, JFrog, PyPI mirror)?',
      default: false,
    });

    let artifactPreInstall = '';
    if (addArtifact) {
      const selectedRegistries = await checkbox({
        message: 'Select artifact registries:',
        choices: ARTIFACT_REGISTRY_CONFIGS.map(r => ({ name: r.label, value: r.id })),
      });

      for (const regId of selectedRegistries) {
        const regCfg = ARTIFACT_REGISTRY_CONFIGS.find(r => r.id === regId);
        if (!regCfg) continue;
        console.log('');
        console.log(chalk.gray(`  Configure ${regCfg.label}:`));
        for (const v of regCfg.envVars) {
          const val = await input({ message: `${v.key}${v.required ? ' (required)' : ' (optional)'}:`, default: '' });
          if (val.trim()) { envFlags.push(`-e ${v.key}="${val.trim()}"`); envSummary.push(v.key); }
        }
        if (regCfg.preInstall) {
          artifactPreInstall += regCfg.preInstall + ' && ';
        }
      }
    }

    // Prepend artifact preInstall to install command
    const finalInstall = artifactPreInstall
      ? `${artifactPreInstall}${selectedEnv.install}`
      : selectedEnv.install;

    // Build Docker command
    const volumeFlags = ['-v "$PWD":"$PWD"'];

    // If NODE_TLS_REJECT_UNAUTHORIZED=0 is set (via --skipSSL), pass it into the container
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
      envFlags.push('-e NODE_TLS_REJECT_UNAUTHORIZED=0');
    }

    // If --crt is set, mount the cert into the container and set NODE_EXTRA_CA_CERTS
    if (flags.crtPath && fs.existsSync(flags.crtPath)) {
      const certFile = path.basename(flags.crtPath);
      const containerCertPath = `/certs/${certFile}`;
      volumeFlags.push(`-v "${flags.crtPath}":"${containerCertPath}":ro`);
      envFlags.push(`-e NODE_EXTRA_CA_CERTS=${containerCertPath}`);
    }

    // If --config points to a file outside $PWD, mount it into the container
    if (flags.configPath && fs.existsSync(flags.configPath)) {
      const configResolved = path.resolve(flags.configPath);
      const cwd = process.cwd();
      if (!configResolved.startsWith(cwd)) {
        // External config -- mount it read-only
        volumeFlags.push(`-v "${configResolved}":"${configResolved}":ro`);
      }
    }

    const volumeString = volumeFlags.join(' \\\n  ');
    const envString = envFlags.length > 0 ? ' \\\n  ' + envFlags.join(' \\\n  ') : '';
    const dockerCmd = `docker run -it --rm \\\n  ${volumeString} \\\n  -w "$PWD"${envString} \\\n  ${selectedEnv.image} \\\n  bash -c "${finalInstall}"`;

    console.log('');
    console.log(chalk.bold('  Docker command:'));
    console.log('');
    console.log(chalk.cyan(`  ${dockerCmd.replace(/\n/g, '\n  ')}`));
    console.log('');

    if (envSummary.length > 0) {
      console.log(chalk.gray(`  Environment: ${envSummary.join(', ')}`));
      console.log('');
    }

    const runNow = await confirm({
      message: 'Run this Docker command now?',
      default: true,
    });

    if (!runNow) {
      console.log(chalk.gray('  Copy the command above and run it manually.'));
      console.log('');
      return;
    }

    console.log('');
    console.log(chalk.cyan('  Starting OpenCode (Sandboxed)...'));
    console.log(chalk.gray(`  Pulling ${selectedEnv.image} image and installing opencode-ai...`));
    console.log('');

    // Build the actual command as a single string for shell execution
    const shellEnv = envFlags.join(' ');
    const shellVolumes = volumeFlags.join(' ');
    const shellCmd = `docker run -it --rm ${shellVolumes} -w "$PWD" ${shellEnv} ${selectedEnv.image} bash -c "${finalInstall}"`;

    const child = spawn('sh', ['-c', shellCmd], {
      stdio: 'inherit',
      cwd: CWD,
    });

    child.on('error', (err) => {
      console.error(chalk.red(`  Failed to start Docker: ${err.message}`));
    });

    await new Promise((resolve) => {
      child.on('close', resolve);
    });

    return;
  }

  // ── Step 4b: Local launch ─────────────────────────────────────────────────

  console.log('');
  console.log(chalk.cyan('  Starting OpenCode...'));
  console.log('');

  const child = spawn('opencode', [], {
    stdio: 'inherit',
    cwd: CWD,
  });

  child.on('error', (err) => {
    console.error(chalk.red(`  Failed to start OpenCode: ${err.message}`));
  });

  await new Promise((resolve) => {
    child.on('close', resolve);
  });
}

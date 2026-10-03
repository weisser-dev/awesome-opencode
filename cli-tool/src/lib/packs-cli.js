// ─── Skill packs: command line + interactive flow ───────────────────────────

import chalk from 'chalk';
import { checkbox, select, confirm } from '@inquirer/prompts';
import { loadLock, findPacksBase, selectItems, defaultDirs, installPacks } from './packs.js';

export const PACKS_HELP = `
  awesome-opencode packs [options]      Install skill packs into OpenCode

  Packs:
    design     Frontend design: taste skills, image-to-code, DESIGN.md references,
               web interface review, local Playwright checks (default)
    process    Lifecycle skills + commands /spec /plan /build /test /constraints
               /review /webperf /code-simplify /ship
    behavior   Opt-in "ponytail" minimal-code mode (never part of "all")

  Options:
    --pack <list>     design | process | behavior | all (comma-separated, default: design)
    --global          Install into ~/.config/opencode/{skills,commands} (default: ./.opencode/)
    --only <names>    Install exactly these items (see --list)
    --all             Include opt-in items of the selected packs
    --list            Show packs and items
    --dry-run         Show the plan; no downloads, no writes
    --force           Replace items modified locally (old version kept in .agentic-pack-backups/)

  Security: only the commits pinned in templates/packs/sources.lock.json are downloaded,
  every file is checked against its sha256, nothing is executed.
`;

/** Parse the arguments after `packs` / `design-pack`. */
export function parsePacksArgs(argv, { defaultPacks = ['design'] } = {}) {
  const opts = { packs: defaultPacks, only: [], all: false, global: false, list: false, dryRun: false, force: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (argv[i + 1] === undefined) throw new Error(`${a} needs a value`);
      return argv[++i];
    };
    if (a === '--pack' || a === '--packs') opts.packs = next().split(',').filter(Boolean);
    else if (a === '--only') opts.only = next().split(',').filter(Boolean);
    else if (a === '--all') opts.all = true;
    else if (a === '--global') opts.global = true;
    else if (a === '--list') opts.list = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--force') opts.force = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else throw new Error(`Unknown option for packs: ${a}`);
  }
  return opts;
}

function printList(lock) {
  for (const [name, def] of Object.entries(lock.packs)) {
    console.log(chalk.bold(`  ${name}`) + chalk.gray(` (${def.inAll ? 'in all' : 'explicit only'}) ${def.description}`));
    for (const it of lock.items.filter((i) => i.pack === name)) {
      const tag = it.default ? '' : chalk.yellow(' [opt-in]');
      console.log(chalk.gray(`    ${(it.type || 'skill').padEnd(8)} ${it.name.padEnd(30)} ${it.kind.padEnd(9)}`) + tag);
    }
  }
}

function printPlan(plan) {
  for (const p of plan) {
    const color = p.action === 'refuse' ? chalk.red : p.action === 'up-to-date' ? chalk.gray : chalk.green;
    const why = ['refuse', 'replace'].includes(p.action) ? ` (${p.state})` : '';
    console.log(color(`    ${(p.item.type || 'skill').padEnd(8)} ${p.item.name.padEnd(30)} ${p.action}${why}`));
  }
}

/** Non-interactive entry point: `awesome-opencode packs ...`. */
export async function runPacksCommand(argv, { defaultPacks } = {}) {
  const opts = parsePacksArgs(argv, { defaultPacks });
  if (opts.help) { console.log(PACKS_HELP); return; }
  const base = findPacksBase();
  const lock = loadLock(base);
  if (opts.list) { printList(lock); return; }

  const items = selectItems(lock, opts);
  if (!items.length) throw new Error('Nothing selected.');
  const dirs = defaultDirs({ global: opts.global });
  console.log(chalk.gray(`  skills   -> ${dirs.skillsDir}`));
  console.log(chalk.gray(`  commands -> ${dirs.commandsDir}${opts.dryRun ? '   (dry run)' : ''}`));

  try {
    const plan = await installPacks({
      lock, base, items, ...dirs, dryRun: opts.dryRun, force: opts.force,
      log: (msg) => { if (msg.startsWith('backup')) console.log(chalk.yellow(`    ${msg}`)); },
    });
    printPlan(plan);
    if (opts.dryRun && plan.some((p) => p.action === 'refuse')) {
      console.log(chalk.yellow('  Items marked "refuse" were changed locally or not installed by this tool; use --force to replace them.'));
    }
    if (!opts.dryRun) console.log(chalk.green('  Done. Start a new OpenCode session to load the skills and commands.'));
  } catch (err) {
    if (err.plan) printPlan(err.plan);
    throw err;
  }
}

/** Interactive flow used by the setup menu and `configure packs`. */
export async function promptAndInstallPacks() {
  const base = findPacksBase();
  if (!base) {
    console.log(chalk.yellow('  Skill pack templates not found in this installation.'));
    return;
  }
  const lock = loadLock(base);
  const packs = await checkbox({
    message: 'Select skill packs:',
    choices: Object.entries(lock.packs).map(([name, def]) => ({
      name: `${name} - ${def.description}`,
      value: name,
      checked: name === 'design',
    })),
  });
  if (!packs.length) return;
  if (packs.includes('behavior')) {
    console.log(chalk.yellow('  behavior (ponytail) changes how the agent writes all code: shorter, minimal solutions.'));
    console.log(chalk.yellow('  Its savings figures are the author\'s own benchmarks. Say "stop ponytail" to turn it off.'));
  }
  const all = await confirm({ message: 'Include opt-in items (e.g. gpt-taste, full-output-enforcement)?', default: false });
  const scope = await select({
    message: 'Install for:',
    choices: [
      { name: 'This project (.opencode/skills, .opencode/commands)', value: 'project' },
      { name: 'All projects (~/.config/opencode/skills, .../commands)', value: 'global' },
    ],
  });
  const items = selectItems(lock, { packs, all });
  const dirs = defaultDirs({ global: scope === 'global' });
  const plan = await installPacks({ lock, base, items, ...dirs, dryRun: true });
  printPlan(plan);
  const refused = plan.filter((p) => p.action === 'refuse');
  let force = false;
  if (refused.length) {
    force = await confirm({
      message: `${refused.length} item(s) were changed locally or not installed by this tool. Replace them (backup kept)?`,
      default: false,
    });
  }
  const todo = plan.filter((p) => p.action !== 'up-to-date' && (force || p.action !== 'refuse'));
  if (!todo.length) { console.log(chalk.gray('  Nothing to do.')); return; }
  if (!(await confirm({ message: `Install ${todo.length} item(s)?`, default: true }))) return;
  await installPacks({
    lock, base, items: todo.map((p) => p.item), ...dirs, force,
    log: (msg) => console.log(chalk.gray(`    ${msg}`)),
  });
  console.log(chalk.green('  Skill packs installed. Start a new OpenCode session to load them.'));
}


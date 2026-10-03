// tests/packs.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  loadLock, findPacksBase, selectItems, installPacks, buildItem, itemState, rawUrl, dropLines,
  sha256, defaultDirs, SKILL_MARKER, COMMAND_MANIFEST, BACKUP_DIR,
} from '../lib/packs.js';
import { parsePacksArgs } from '../lib/packs-cli.js';

const base = findPacksBase();
const lock = loadLock(base);
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'packs-test-'));
}

const noNetwork = async (url) => { throw new Error(`unexpected download: ${url}`); };

describe('sources.lock.json', () => {
  test('has the three packs, behavior is not part of "all"', () => {
    assert.deepEqual(Object.keys(lock.packs).sort(), ['behavior', 'design', 'process']);
    assert.equal(lock.packs.behavior.inAll, false);
    assert.equal(lock.packs.design.inAll, true);
  });

  test('every source is pinned to a full commit on github.com and has a license', () => {
    for (const [id, src] of Object.entries(lock.sources)) {
      assert.match(src.repo, /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/, id);
      assert.match(src.commit, /^[0-9a-f]{40}$/, id);
      assert.ok(src.license, `${id} has no license field`);
    }
  });

  test('items are unique, valid names, known packs and kinds', () => {
    const names = lock.items.map((i) => i.name);
    assert.equal(new Set(names).size, names.length);
    for (const it of lock.items) {
      assert.match(it.name, NAME_RE, it.name);
      assert.ok(lock.packs[it.pack], `${it.name}: unknown pack`);
      assert.ok(['local', 'vendored', 'derived', 'fetch'].includes(it.kind), `${it.name}: kind`);
      assert.ok(['skill', 'command'].includes(it.type || 'skill'), `${it.name}: type`);
    }
  });

  test('fetched files come only from licensed sources and carry sha256 pins', () => {
    for (const it of lock.items.filter((i) => i.kind === 'fetch')) {
      const src = lock.sources[it.source];
      assert.ok(src, `${it.name}: unknown source`);
      assert.match(src.license, /^(MIT|Apache-2\.0)$/, `${it.name}: license ${src.license}`);
      for (const f of it.files) {
        assert.match(f.sha256, /^[0-9a-f]{64}$/, `${it.name}: ${f.file}`);
        if (f.installedSha256) assert.match(f.installedSha256, /^[0-9a-f]{64}$/);
      }
    }
  });

  test('the unlicensed vercel-labs/agent-skills source is not used by any item', () => {
    assert.ok(!lock.items.some((i) => i.source === 'vercel-agent-skills'));
  });
});

describe('bundled pack files', () => {
  test('every local/vendored/derived item is bundled and valid', async () => {
    for (const it of lock.items.filter((i) => i.kind !== 'fetch')) {
      const files = await buildItem(lock, it, base, noNetwork);
      if ((it.type || 'skill') === 'skill') {
        assert.ok(files.has('SKILL.md'), it.name);
        const fm = /^---\n([\s\S]*?)\n---/.exec(files.get('SKILL.md').toString());
        assert.ok(/^description: ./m.test(fm[1]), `${it.name}: description`);
      } else {
        assert.ok(files.has(`${it.name}.md`), it.name);
      }
    }
  });

  test('vendored web-design-guidelines rules match the pinned upstream sha256', () => {
    const it = lock.items.find((i) => i.name === 'web-design-guidelines');
    const f = it.files.find((x) => x.file === 'references/web-interface-guidelines.md');
    const data = fs.readFileSync(path.join(base, it.path, f.file));
    assert.equal(sha256(data), f.sha256);
    assert.ok(fs.existsSync(path.join(base, it.path, 'references', 'LICENSE-vercel-web-interface-guidelines')));
  });

  test('every third-party item ships its license and provenance', () => {
    for (const it of lock.items.filter((i) => ['vendored', 'derived'].includes(i.kind))) {
      const dir = it.type === 'command' ? path.join(base, path.dirname(it.path)) : path.join(base, it.path);
      const upstream = fs.readFileSync(path.join(dir, 'UPSTREAM.md'), 'utf8');
      assert.ok(upstream.includes(lock.sources[it.source].commit), `${it.name}: UPSTREAM.md lacks pinned commit`);
      const hasLicense = fs.readdirSync(dir).some((f) => f.startsWith('LICENSE'))
        || fs.readdirSync(path.join(dir, 'references')).some((f) => f.startsWith('LICENSE'));
      assert.ok(hasLicense, `${it.name}: license file missing`);
    }
  });

  test('no bundled skill or command fetches, hotlinks or shells out at run time', () => {
    const forbidden = [
      /!`/, // OpenCode/Claude command shell injection
      /\bcurl\s+-/, /\bwget\s/, /WebFetch/, /chrome-devtools-mcp/,
      /picsum\.photos/, /cdn\.simpleicons\.org/, /raw\.githubusercontent\.com/,
      /npx\s+-y\b/, /@latest\b/,
    ];
    const files = [];
    (function walk(dir) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith('.md') && e.name !== 'UPSTREAM.md') files.push(p);
      }
    })(base);
    for (const f of files) {
      const text = fs.readFileSync(f, 'utf8');
      for (const rx of forbidden) assert.ok(!rx.test(text), `${path.relative(base, f)} matches ${rx}`);
      assert.ok(!/[​-‏‪-‮⁠-⁤﻿]/.test(text), `${f}: hidden unicode`);
    }
  });
});

describe('selection', () => {
  test('default is the design pack without opt-in items', () => {
    const items = selectItems(lock);
    assert.ok(items.length > 0);
    assert.ok(items.every((i) => i.pack === 'design' && i.default));
  });

  test('"all" means design and process, never behavior', () => {
    const packs = new Set(selectItems(lock, { packs: ['all'] }).map((i) => i.pack));
    assert.deepEqual([...packs].sort(), ['design', 'process']);
  });

  test('--only overrides packs; unknown names throw', () => {
    assert.deepEqual(selectItems(lock, { only: ['ponytail'] }).map((i) => i.name), ['ponytail']);
    assert.throws(() => selectItems(lock, { only: ['nope'] }), /Unknown pack item/);
    assert.throws(() => selectItems(lock, { packs: ['nope'] }), /Unknown pack/);
  });

  test('argument parsing', () => {
    const o = parsePacksArgs(['--pack', 'process,behavior', '--global', '--dry-run', '--force', '--all']);
    assert.deepEqual(o.packs, ['process', 'behavior']);
    assert.ok(o.global && o.dryRun && o.force && o.all);
    assert.throws(() => parsePacksArgs(['--bogus']), /Unknown option/);
  });

  test('default directories', () => {
    const p = defaultDirs({ cwd: '/x' });
    assert.equal(p.skillsDir, path.join('/x', '.opencode', 'skills'));
    const g = defaultDirs({ global: true, env: { XDG_CONFIG_HOME: '/cfg' } });
    assert.equal(g.commandsDir, path.join('/cfg', 'opencode', 'commands'));
  });
});

describe('fetch safety', () => {
  test('raw URL is built only from github.com repo + full commit', () => {
    const src = { repo: 'https://github.com/a/b', commit: 'f'.repeat(40) };
    assert.equal(rawUrl(src, 'skills/x/SKILL.md'), `https://raw.githubusercontent.com/a/b/${'f'.repeat(40)}/skills/x/SKILL.md`);
    assert.throws(() => rawUrl({ ...src, repo: 'https://evil.example/a/b' }, 'x'), /repository/);
    assert.throws(() => rawUrl({ ...src, commit: 'main' }, 'x'), /commit/);
    assert.throws(() => rawUrl(src, '../etc/passwd'), /path/);
  });

  test('dropLines removes only matching lines', () => {
    const out = dropLines(Buffer.from('a\n3. Run `npx @google/design.md lint DESIGN.md`\nb\n'), '^[ \t]*[0-9]+[.] Run `npx @google/design[.]md lint');
    assert.equal(out.toString(), 'a\nb\n');
  });
});

describe('installPacks', () => {
  // A synthetic lock with one fetched skill, one local skill and one command.
  function fixture() {
    const root = tmpdir();
    const pb = path.join(root, 'packs');
    fs.mkdirSync(path.join(pb, 'skills', 'local-one'), { recursive: true });
    fs.writeFileSync(path.join(pb, 'skills', 'local-one', 'SKILL.md'), '---\nname: local-one\ndescription: Local test skill.\n---\n\nBody\n');
    fs.mkdirSync(path.join(pb, 'commands'), { recursive: true });
    fs.writeFileSync(path.join(pb, 'commands', 'hello.md'), '---\ndescription: Say hello\n---\n\nSay hello to $ARGUMENTS.\n');
    const upstreamSkill = Buffer.from('---\nname: fetched-one\ndescription: Fetched test skill.\n---\n\n1. Run `npx @google/design.md lint DESIGN.md`\nKeep\n');
    const filtered = dropLines(upstreamSkill, '^[ \t]*[0-9]+[.] Run `npx @google/design[.]md lint');
    const l = {
      packs: { design: { inAll: true, description: 'd' }, behavior: { inAll: false, description: 'b' } },
      sources: { up: { repo: 'https://github.com/o/r', commit: 'a'.repeat(40), license: 'MIT' } },
      items: [
        { name: 'local-one', pack: 'design', type: 'skill', kind: 'local', default: true, path: 'skills/local-one' },
        { name: 'hello', pack: 'design', type: 'command', kind: 'local', default: true, path: 'commands/hello.md' },
        {
          name: 'fetched-one', pack: 'design', type: 'skill', kind: 'fetch', default: true, source: 'up',
          collection: { dropLinesMatching: '^[ \t]*[0-9]+[.] Run `npx @google/design[.]md lint' },
          files: [{ file: 'SKILL.md', upstreamPath: 'x/SKILL.md', sha256: sha256(upstreamSkill), installedSha256: sha256(filtered), collection: true }],
        },
      ],
    };
    const calls = [];
    const fetcher = async (url) => { calls.push(url); return upstreamSkill; };
    const dirs = { skillsDir: path.join(root, 'out', 'skills'), commandsDir: path.join(root, 'out', 'commands') };
    return { root, base: pb, lock: l, fetcher, calls, dirs };
  }

  test('installs, is idempotent, and records markers', async () => {
    const f = fixture();
    const items = selectItems(f.lock, { packs: ['design'] });
    const plan = await installPacks({ lock: f.lock, base: f.base, items, ...f.dirs, fetcher: f.fetcher });
    assert.deepEqual(plan.map((p) => p.action), ['install', 'install', 'install']);
    assert.equal(f.calls.length, 1);
    assert.match(f.calls[0], /^https:\/\/raw\.githubusercontent\.com\/o\/r\/a{40}\/x\/SKILL\.md$/);
    const installed = fs.readFileSync(path.join(f.dirs.skillsDir, 'fetched-one', 'SKILL.md'), 'utf8');
    assert.ok(!installed.includes('npx'));
    assert.ok(fs.existsSync(path.join(f.dirs.skillsDir, 'local-one', SKILL_MARKER)));
    assert.ok(fs.existsSync(path.join(f.dirs.commandsDir, COMMAND_MANIFEST)));

    const again = await installPacks({ lock: f.lock, base: f.base, items, ...f.dirs, fetcher: noNetwork });
    assert.ok(again.every((p) => p.action === 'up-to-date'));
  });

  test('dry run writes nothing and downloads nothing', async () => {
    const f = fixture();
    const plan = await installPacks({ lock: f.lock, base: f.base, items: f.lock.items, ...f.dirs, dryRun: true, fetcher: noNetwork });
    assert.ok(plan.every((p) => p.action === 'install'));
    assert.ok(!fs.existsSync(path.join(f.root, 'out')));
  });

  test('refuses modified or unmanaged items without force, backs up with force', async () => {
    const f = fixture();
    await installPacks({ lock: f.lock, base: f.base, items: f.lock.items, ...f.dirs, fetcher: f.fetcher });
    fs.appendFileSync(path.join(f.dirs.skillsDir, 'local-one', 'SKILL.md'), 'edited\n');
    fs.appendFileSync(path.join(f.dirs.commandsDir, 'hello.md'), 'edited\n');
    assert.equal(itemState(f.lock, f.lock.items[0], f.base, f.dirs), 'modified');
    await assert.rejects(
      installPacks({ lock: f.lock, base: f.base, items: f.lock.items, ...f.dirs, fetcher: f.fetcher }),
      /Refusing to overwrite/,
    );
    const plan = await installPacks({ lock: f.lock, base: f.base, items: f.lock.items, ...f.dirs, fetcher: f.fetcher, force: true });
    assert.deepEqual(plan.map((p) => p.action), ['replace', 'replace', 'up-to-date']);
    const backups = fs.readdirSync(path.join(f.dirs.skillsDir, BACKUP_DIR));
    assert.equal(backups.length, 1);
    // the backup must not be picked up as a second skill
    assert.ok(!fs.existsSync(path.join(f.dirs.skillsDir, BACKUP_DIR, backups[0], 'SKILL.md')));
    assert.ok(fs.readdirSync(path.join(f.dirs.commandsDir, BACKUP_DIR)).length === 1);
    assert.ok(!fs.readFileSync(path.join(f.dirs.skillsDir, 'local-one', 'SKILL.md'), 'utf8').includes('edited'));

    fs.mkdirSync(path.join(f.dirs.skillsDir, 'foreign'), { recursive: true });
    const foreign = { ...f.lock.items[0], name: 'foreign', path: 'skills/local-one' };
    assert.equal(itemState(f.lock, foreign, f.base, f.dirs), 'unmanaged');
  });

  test('a sha256 mismatch aborts before anything is written', async () => {
    const f = fixture();
    const bad = async () => Buffer.from('tampered');
    await assert.rejects(
      installPacks({ lock: f.lock, base: f.base, items: f.lock.items, ...f.dirs, fetcher: bad }),
      /sha256 mismatch/,
    );
    assert.ok(!fs.existsSync(path.join(f.dirs.skillsDir, 'local-one')));
  });

  test('real lock: local items of the design pack install without network', async () => {
    const out = tmpdir();
    const dirs = { skillsDir: path.join(out, 'skills'), commandsDir: path.join(out, 'commands') };
    const items = selectItems(lock, { packs: ['design', 'process'] }).filter((i) => i.kind !== 'fetch');
    await installPacks({ lock, base, items, ...dirs, fetcher: noNetwork });
    assert.ok(fs.existsSync(path.join(dirs.skillsDir, 'web-design-guidelines', 'references', 'web-interface-guidelines.md')));
    assert.ok(fs.existsSync(path.join(dirs.commandsDir, 'ship.md')));
  });
});

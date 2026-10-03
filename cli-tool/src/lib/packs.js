// ─── Skill packs (design / process / behavior) ──────────────────────────────
//
// Installs reviewed skill packs into OpenCode's skills and commands directories.
// The pack definitions, pins and license data come from templates/packs/sources.lock.json,
// imported from weisser-dev/agentic-skills (scripts/import-packs.js).
//
// Security model:
//   - Items of kind local/vendored/derived are copied from the bundled templates (no network).
//   - Items of kind "fetch" are downloaded only from raw.githubusercontent.com, only for the
//     repository and commit pinned in the lock file, and every file must match its sha256 pin.
//   - Nothing is executed; no scripts, hooks, plugins or MCP servers are installed.
//   - Existing items that were modified locally or not installed by this tool are never
//     overwritten without `force` (the old version is archived in .agentic-pack-backups/).

import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SKILL_MARKER = '.agentic-pack.json';
export const COMMAND_MANIFEST = '.agentic-pack-commands.json';
export const BACKUP_DIR = '.agentic-pack-backups';
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const REPO_RE = /^https:\/\/github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/;
const COMMIT_RE = /^[0-9a-f]{40}$/;

export const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// ─── Lock + templates ────────────────────────────────────────────────────────

/** Directory that holds sources.lock.json and the bundled pack files. */
export function findPacksBase() {
  const packageDir = path.resolve(__dirname, '..', '..');
  for (const dir of [path.join(packageDir, 'templates', 'packs'), path.join(packageDir, '..', 'templates', 'packs')]) {
    if (fs.existsSync(path.join(dir, 'sources.lock.json'))) return dir;
  }
  return null;
}

export function loadLock(base = findPacksBase()) {
  if (!base) throw new Error('Skill pack templates not found (templates/packs/sources.lock.json).');
  return JSON.parse(fs.readFileSync(path.join(base, 'sources.lock.json'), 'utf8'));
}

/** Default directories for OpenCode (project scope = current directory). */
export function defaultDirs({ global = false, cwd = process.cwd(), env = process.env } = {}) {
  if (global) {
    const config = env.OPENCODE_CONFIG_DIR
      || path.join(env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'opencode');
    return { skillsDir: path.join(config, 'skills'), commandsDir: path.join(config, 'commands') };
  }
  return { skillsDir: path.join(cwd, '.opencode', 'skills'), commandsDir: path.join(cwd, '.opencode', 'commands') };
}

/**
 * Resolve the selection. packs: array of pack names ("all" = packs with inAll).
 * only: explicit item names (any pack). all: include opt-in items of the selected packs.
 */
export function selectItems(lock, { packs = ['design'], only = [], all = false } = {}) {
  const names = new Set(lock.items.map((i) => i.name));
  const unknown = only.filter((n) => !names.has(n));
  if (unknown.length) throw new Error(`Unknown pack item(s): ${unknown.join(', ')}`);
  const wanted = new Set();
  for (const p of packs) {
    if (p === 'all') {
      for (const [name, def] of Object.entries(lock.packs)) if (def.inAll) wanted.add(name);
    } else if (lock.packs[p]) {
      wanted.add(p);
    } else {
      throw new Error(`Unknown pack: ${p} (design, process, behavior, all)`);
    }
  }
  return lock.items.filter((it) => (only.length
    ? only.includes(it.name)
    : wanted.has(it.pack) && (it.default || all)));
}

// ─── Hashing helpers ─────────────────────────────────────────────────────────

function walk(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, base, out);
    else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}

function localPaths(item) {
  const paths = ['local', 'vendored', 'derived'].includes(item.kind) ? [item.path] : [];
  if (item.wrapper) paths.push(item.wrapper);
  return paths;
}

/** Changes whenever a reinstall would produce different files. */
export function fingerprint(lock, item, base) {
  const src = lock.sources[item.source] || {};
  const h = crypto.createHash('sha256').update(JSON.stringify([item, src.commit || null]));
  for (const rel of localPaths(item)) {
    const full = path.join(base, rel);
    if (fs.statSync(full).isFile()) { h.update(fs.readFileSync(full)); continue; }
    for (const f of walk(full)) h.update(`${f}\0`).update(fs.readFileSync(path.join(full, f)));
  }
  return h.digest('hex');
}

function treeHashes(dir) {
  const out = {};
  for (const f of walk(dir)) if (f !== SKILL_MARKER) out[f] = sha256(fs.readFileSync(path.join(dir, f)));
  return out;
}

const sameJson = (a, b) => JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b));
function sortKeys(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return o;
  return Object.fromEntries(Object.keys(o).sort().map((k) => [k, sortKeys(o[k])]));
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

// ─── State ───────────────────────────────────────────────────────────────────

/** missing | unmanaged | modified | up-to-date | outdated */
export function itemState(lock, item, base, { skillsDir, commandsDir }) {
  if (item.type === 'command') {
    const file = path.join(commandsDir, `${item.name}.md`);
    const entry = readJson(path.join(commandsDir, COMMAND_MANIFEST), {})[item.name];
    if (!fs.existsSync(file)) return 'missing';
    if (!entry) return 'unmanaged';
    if (sha256(fs.readFileSync(file)) !== entry.sha256) return 'modified';
    return entry.fingerprint === fingerprint(lock, item, base) ? 'up-to-date' : 'outdated';
  }
  const dir = path.join(skillsDir, item.name);
  if (!fs.existsSync(dir)) return 'missing';
  const marker = readJson(path.join(dir, SKILL_MARKER), null);
  if (!marker) return 'unmanaged';
  if (!sameJson(treeHashes(dir), marker.files)) return 'modified';
  return marker.fingerprint === fingerprint(lock, item, base) ? 'up-to-date' : 'outdated';
}

// ─── Fetching pinned upstream files ──────────────────────────────────────────

/** Build the only URL the installer may download from, or throw. */
export function rawUrl(source, filePath) {
  const m = REPO_RE.exec(source.repo || '');
  if (!m) throw new Error(`Unexpected repository URL in lock: ${source.repo}`);
  if (!COMMIT_RE.test(source.commit || '')) throw new Error(`Unexpected commit in lock: ${source.commit}`);
  if (filePath.split('/').some((seg) => seg === '..' || seg === '')) throw new Error(`Unexpected path in lock: ${filePath}`);
  const encoded = filePath.split('/').map(encodeURIComponent).join('/');
  return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${source.commit}/${encoded}`;
}

export async function httpFetcher(url) {
  const res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Same transform as packs/install.sh and update-lock.py in agentic-skills. */
export function dropLines(buf, pattern) {
  const rx = new RegExp(pattern);
  return Buffer.from(buf.toString('utf8').split('\n').filter((l) => !rx.test(l)).join('\n'), 'utf8');
}

// ─── Build + install ─────────────────────────────────────────────────────────

/** Returns Map(relativePath -> Buffer) for an item, verified against the lock. */
export async function buildItem(lock, item, base, fetcher = httpFetcher) {
  const files = new Map();
  for (const rel of localPaths(item)) {
    const full = path.join(base, rel);
    if (!fs.existsSync(full)) throw new Error(`${item.name}: bundled files missing (${rel})`);
    if (fs.statSync(full).isFile()) files.set(path.basename(full), fs.readFileSync(full));
    else for (const f of walk(full)) files.set(f, fs.readFileSync(path.join(full, f)));
  }
  if (['vendored', 'derived'].includes(item.kind)) {
    for (const f of item.files || []) {
      if (!f.modified && sha256(files.get(f.file) || Buffer.alloc(0)) !== f.sha256) {
        throw new Error(`${item.name}: ${f.file} does not match its pinned sha256`);
      }
    }
  }
  if (item.kind === 'fetch') {
    const source = lock.sources[item.source];
    if (!source) throw new Error(`${item.name}: unknown source ${item.source}`);
    const pattern = item.collection && item.collection.dropLinesMatching;
    for (const f of item.files) {
      let data = await fetcher(rawUrl(source, f.upstreamPath));
      if (sha256(data) !== f.sha256) throw new Error(`${item.name}: ${f.upstreamPath} sha256 mismatch`);
      if (f.collection && pattern) {
        data = dropLines(data, pattern);
        if (sha256(data) !== (f.installedSha256 || f.sha256)) {
          throw new Error(`${item.name}: ${f.file} result after line filter does not match its pin`);
        }
      }
      files.set(f.file, data);
    }
  }
  if (item.type === 'command') {
    const body = (files.get(`${item.name}.md`) || Buffer.alloc(0)).toString('utf8');
    if (body.includes('!`')) throw new Error(`${item.name}: command contains shell injection syntax`);
    if (!/^---\ndescription: .+\n---\n/.test(body)) throw new Error(`${item.name}: command front matter must contain only a description`);
  } else {
    const skill = (files.get('SKILL.md') || Buffer.alloc(0)).toString('utf8');
    const fm = /^---\n([\s\S]*?)\n---/.exec(skill);
    const name = fm && /^name:\s*(\S+)\s*$/m.exec(fm[1]);
    if (!name || name[1] !== item.name || !NAME_RE.test(item.name)) {
      throw new Error(`${item.name}: SKILL.md front matter name must equal the folder name`);
    }
  }
  return files;
}

function writeFiles(dir, files) {
  for (const [rel, data] of files) {
    const out = path.join(dir, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, data);
  }
}

function stamp() {
  return new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
}

/**
 * Plan and (unless dryRun) install. Returns [{ item, state, action }].
 * Throws before writing anything if an item would be refused and force is not set.
 */
export async function installPacks({
  lock, base, items, skillsDir, commandsDir,
  dryRun = false, force = false, fetcher = httpFetcher, log = () => {},
}) {
  const plan = items.map((item) => {
    const state = itemState(lock, item, base, { skillsDir, commandsDir });
    let action = { missing: 'install', 'up-to-date': 'up-to-date', outdated: 'update' }[state];
    if (!action) action = force ? 'replace' : 'refuse';
    return { item, state, action };
  });
  const refused = plan.filter((p) => p.action === 'refuse');
  if (dryRun) return plan;
  if (refused.length) {
    const err = new Error(`Refusing to overwrite modified or unmanaged item(s): ${refused.map((p) => p.item.name).join(', ')} (use --force)`);
    err.plan = plan;
    throw err;
  }

  // Build everything first, so a verification failure leaves the target untouched.
  const built = new Map();
  for (const p of plan) {
    if (p.action === 'up-to-date') continue;
    built.set(p.item.name, await buildItem(lock, p.item, base, fetcher));
  }

  const ts = stamp();
  for (const p of plan) {
    if (p.action === 'up-to-date') continue;
    const { item } = p;
    const files = built.get(item.name);
    const src = lock.sources[item.source] || {};
    if (item.type === 'command') {
      fs.mkdirSync(commandsDir, { recursive: true });
      const dest = path.join(commandsDir, `${item.name}.md`);
      if (p.action === 'replace' && fs.existsSync(dest)) {
        const bk = path.join(commandsDir, BACKUP_DIR, `${item.name}-${ts}.md.bak`);
        fs.mkdirSync(path.dirname(bk), { recursive: true });
        fs.renameSync(dest, bk);
        log(`backup: ${bk}`);
      }
      const data = files.get(`${item.name}.md`);
      fs.writeFileSync(dest, data);
      const manifestPath = path.join(commandsDir, COMMAND_MANIFEST);
      const manifest = readJson(manifestPath, {});
      manifest[item.name] = {
        pack: item.pack, source: item.source || null, commit: src.commit || null,
        sha256: sha256(data), fingerprint: fingerprint(lock, item, base),
        installedBy: '@weisser-dev/awesome-opencode',
      };
      fs.writeFileSync(manifestPath, JSON.stringify(sortKeys(manifest), null, 2) + '\n');
    } else {
      fs.mkdirSync(skillsDir, { recursive: true });
      const dest = path.join(skillsDir, item.name);
      if (fs.existsSync(dest)) {
        if (p.action === 'replace') {
          // Move the old folder out of the scanned tree under a non-SKILL.md name.
          const bk = path.join(skillsDir, BACKUP_DIR, `${item.name}-${ts}`);
          fs.mkdirSync(path.dirname(bk), { recursive: true });
          fs.renameSync(dest, bk);
          if (fs.existsSync(path.join(bk, 'SKILL.md'))) fs.renameSync(path.join(bk, 'SKILL.md'), path.join(bk, 'SKILL.md.bak'));
          log(`backup: ${bk}`);
        } else {
          fs.rmSync(dest, { recursive: true, force: true });
        }
      }
      const tmp = `${dest}.tmp-${ts}`;
      fs.rmSync(tmp, { recursive: true, force: true });
      writeFiles(tmp, files);
      const marker = {
        name: item.name, pack: item.pack, installedBy: '@weisser-dev/awesome-opencode',
        kind: item.kind, source: item.source || null, repo: src.repo || null, commit: src.commit || null,
        license: src.license || 'MIT', fingerprint: fingerprint(lock, item, base), files: treeHashes(tmp),
      };
      fs.writeFileSync(path.join(tmp, SKILL_MARKER), JSON.stringify(marker, null, 2) + '\n');
      fs.renameSync(tmp, dest);
    }
    log(`${item.type || 'skill'} ${item.name}: ${p.action}`);
  }
  return plan;
}

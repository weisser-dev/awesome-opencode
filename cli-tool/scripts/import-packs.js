#!/usr/bin/env node

/**
 * Import the skill packs from a weisser-dev/agentic-skills checkout into templates/packs/.
 *
 *   node scripts/import-packs.js /path/to/agentic-skills
 *
 * agentic-skills is the source of truth (review, adaptation, lock file). This copies the lock
 * file and every item that lives in that repository (kinds local, vendored, derived) plus the
 * wrapper folders. Items of kind "fetch" are not copied: the CLI fetches them at install time
 * from the pinned commits. Run `node scripts/sync-templates.js` afterwards.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const dest = path.join(repoRoot, 'templates', 'packs');

const src = process.argv[2];
if (!src || !fs.existsSync(path.join(src, 'packs', 'sources.lock.json'))) {
  console.error('Usage: node scripts/import-packs.js /path/to/agentic-skills');
  process.exit(1);
}

const lock = JSON.parse(fs.readFileSync(path.join(src, 'packs', 'sources.lock.json'), 'utf8'));

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

function copy(from, to) {
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from)) copy(path.join(from, entry), path.join(to, entry));
  } else {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

const copied = new Set();
for (const item of lock.items) {
  if (item.wrapper) {
    const rel = item.wrapper.replace(/^packs\//, '');
    copy(path.join(src, item.wrapper), path.join(dest, rel));
    item.wrapper = rel;
  }
  if (['local', 'vendored', 'derived'].includes(item.kind)) {
    // commands share one folder (with UPSTREAM.md and the license file)
    const rel = item.type === 'command' ? path.dirname(item.path) : item.path;
    if (!copied.has(rel)) {
      copy(path.join(src, rel), path.join(dest, rel));
      copied.add(rel);
    }
  }
}

fs.writeFileSync(path.join(dest, 'sources.lock.json'), JSON.stringify(lock, null, 2) + '\n');
console.log(`Imported ${lock.items.length} pack items (${copied.size} local folders) into ${dest}`);

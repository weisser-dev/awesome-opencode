#!/usr/bin/env node

/**
 * Sync templates from repo root into the cli-tool package.
 * Run automatically via `prepublishOnly` before `npm publish`.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(cliRoot, '..');

const src = path.join(repoRoot, 'templates');
const dest = path.join(cliRoot, 'templates');

if (!fs.existsSync(src)) {
  console.error('Error: templates/ directory not found in repo root.');
  process.exit(1);
}

// Remove old templates
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true });
}

// Copy recursively
copyDir(src, dest);
console.log(`Synced templates from ${src} to ${dest}`);

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

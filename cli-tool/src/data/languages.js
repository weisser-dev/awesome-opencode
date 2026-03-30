// ─── Language Detection Data ─────────────────────────────────────────────────

import path from 'path';
import fs from 'fs';

// Map file extensions to language/category hints
export const EXTENSION_HINTS = [
  { exts: ['.tf', '.tfvars', '.hcl'],            language: 'terraform',  category: 'IaC (Terraform)' },
  { exts: ['.yaml', '.yml'],                     language: null,         category: null, detect: detectYamlCategory },
  { exts: ['.bicep'],                             language: 'bicep',     category: 'IaC (Azure Bicep)' },
  { exts: ['.pulumi.ts', '.pulumi.yaml'],        language: 'pulumi',    category: 'IaC (Pulumi)' },
  { exts: ['.dockerfile', 'Dockerfile'],          language: 'docker',    category: 'Containers (Docker)' },
  { exts: ['.ts', '.tsx'],                        language: 'node',      category: 'TypeScript' },
  { exts: ['.js', '.jsx', '.mjs', '.cjs'],       language: 'node',      category: 'JavaScript' },
  { exts: ['.py', '.pyi'],                        language: 'python',    category: 'Python' },
  { exts: ['.java'],                              language: 'java',      category: 'Java' },
  { exts: ['.kt', '.kts'],                        language: 'kotlin',    category: 'Kotlin' },
  { exts: ['.go'],                                language: 'go',        category: 'Go' },
  { exts: ['.rs'],                                language: 'rust',      category: 'Rust' },
  { exts: ['.rb'],                                language: 'ruby',      category: 'Ruby' },
  { exts: ['.php'],                               language: 'php',       category: 'PHP' },
  { exts: ['.cs'],                                language: 'csharp',    category: 'C# (.NET)' },
  { exts: ['.swift'],                             language: 'swift',     category: 'Swift' },
  { exts: ['.dart'],                              language: 'dart',      category: 'Dart / Flutter' },
  { exts: ['.scala'],                             language: 'scala',     category: 'Scala' },
  { exts: ['.ex', '.exs'],                        language: 'elixir',    category: 'Elixir' },
  { exts: ['.zig'],                               language: 'zig',       category: 'Zig' },
  { exts: ['.c', '.h'],                           language: 'c',         category: 'C' },
  { exts: ['.cpp', '.cc', '.cxx', '.hpp'],        language: 'cpp',       category: 'C++' },
  { exts: ['.sol'],                               language: 'solidity',  category: 'Solidity (Web3)' },
  { exts: ['.sh', '.bash', '.zsh'],               language: 'shell',     category: 'Shell Scripts' },
  { exts: ['.sql'],                               language: 'sql',       category: 'SQL / Database' },
  { exts: ['.proto'],                             language: 'protobuf',  category: 'Protocol Buffers' },
  { exts: ['.graphql', '.gql'],                   language: 'graphql',   category: 'GraphQL' },
  { exts: ['.md', '.mdx'],                        language: 'markdown',  category: 'Documentation' },
];

export function detectYamlCategory(files) {
  const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  const names = yamlFiles.map(f => path.basename(f).toLowerCase());
  if (names.some(n => n.includes('ansible') || n === 'playbook.yml' || n === 'site.yml')) {
    return { language: 'ansible', category: 'IaC (Ansible)' };
  }
  if (names.some(n => n.includes('docker-compose') || n === 'compose.yml' || n === 'compose.yaml')) {
    return { language: 'docker', category: 'Containers (Docker Compose)' };
  }
  if (names.some(n => n.includes('k8s') || n.includes('kubernetes') || n.includes('deployment') || n.includes('service'))) {
    return { language: 'kubernetes', category: 'Containers (Kubernetes)' };
  }
  if (names.some(n => n.includes('cloudformation'))) {
    return { language: 'cloudformation', category: 'IaC (CloudFormation)' };
  }
  return null;
}

/**
 * Scan up to 500 files in the project (non-hidden, non-node_modules) and
 * return an array of relative file paths.
 */
export function scanProjectFiles(dir, maxFiles = 500) {
  const results = [];
  const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', 'target', '.next', '__pycache__', '.terraform', 'vendor']);

  function walk(currentDir, depth) {
    if (depth > 5 || results.length >= maxFiles) return;
    let entries;
    try { entries = fs.readdirSync(currentDir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (results.length >= maxFiles) return;
      if (entry.name.startsWith('.') && entry.isDirectory()) continue;
      if (entry.isDirectory()) {
        if (ignoreDirs.has(entry.name)) continue;
        walk(path.join(currentDir, entry.name), depth + 1);
      } else {
        results.push(path.relative(dir, path.join(currentDir, entry.name)));
      }
    }
  }

  walk(dir, 0);
  return results;
}

/**
 * Given a list of project files, count how many match each extension hint
 * and return ranked suggestions.
 */
export function detectFromExtensions(files) {
  const counts = new Map();

  for (const hint of EXTENSION_HINTS) {
    if (hint.detect) {
      // Special detector (e.g. YAML)
      const result = hint.detect(files);
      if (result) {
        const key = `${result.language}|${result.category}`;
        counts.set(key, (counts.get(key) || 0) + 10); // boost special detections
      }
      continue;
    }

    let count = 0;
    for (const file of files) {
      const lower = file.toLowerCase();
      const base = path.basename(lower);
      for (const ext of hint.exts) {
        if (ext.startsWith('.')) {
          if (lower.endsWith(ext)) { count++; break; }
        } else {
          // Filename match (e.g. "Dockerfile")
          if (base === ext.toLowerCase() || base.startsWith(ext.toLowerCase())) { count++; break; }
        }
      }
    }

    if (count > 0 && hint.language && hint.category) {
      const key = `${hint.language}|${hint.category}`;
      counts.set(key, (counts.get(key) || 0) + count);
    }
  }

  // Sort by count descending, return as suggestions
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => {
      const [language, category] = key.split('|');
      return { language, category, count };
    });
}

// All selectable language options for the interactive prompt
export const LANGUAGE_OPTIONS = [
  { value: 'node',            label: 'JavaScript / TypeScript' },
  { value: 'python',          label: 'Python' },
  { value: 'java',            label: 'Java' },
  { value: 'kotlin',          label: 'Kotlin' },
  { value: 'go',              label: 'Go' },
  { value: 'rust',            label: 'Rust' },
  { value: 'ruby',            label: 'Ruby' },
  { value: 'php',             label: 'PHP' },
  { value: 'csharp',          label: 'C# / .NET' },
  { value: 'swift',           label: 'Swift' },
  { value: 'dart',            label: 'Dart / Flutter' },
  { value: 'scala',           label: 'Scala' },
  { value: 'elixir',          label: 'Elixir' },
  { value: 'zig',             label: 'Zig' },
  { value: 'c',               label: 'C' },
  { value: 'cpp',             label: 'C++' },
  { value: 'terraform',       label: 'Terraform (IaC)' },
  { value: 'ansible',         label: 'Ansible (IaC)' },
  { value: 'cloudformation',  label: 'CloudFormation (IaC)' },
  { value: 'bicep',           label: 'Azure Bicep (IaC)' },
  { value: 'pulumi',          label: 'Pulumi (IaC)' },
  { value: 'kubernetes',      label: 'Kubernetes' },
  { value: 'docker',          label: 'Docker / Containers' },
  { value: 'solidity',        label: 'Solidity (Web3)' },
  { value: 'shell',           label: 'Shell Scripts' },
  { value: 'sql',             label: 'SQL / Database' },
  { value: 'markdown',        label: 'Documentation / Markdown' },
  { value: 'other',           label: 'Other' },
];

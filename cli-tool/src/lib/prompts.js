// ─── Interactive Prompts ────────────────────────────────────────────────────

import { checkbox, confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { AVAILABLE_AGENTS, DEFAULT_AGENTS, LANGUAGE_AGENT_MAP } from '../data/agents.js';
import { AVAILABLE_SKILLS, DEFAULT_SKILLS } from '../data/skills.js';
import { AVAILABLE_MCP } from '../data/mcp.js';
import { MODEL_PRESETS, COST_LABELS, TIER_LABELS, detectModelsInConfig, getAgentTier } from '../data/models.js';
import { LANGUAGE_OPTIONS } from '../data/languages.js';

// ─── Agent Selection ────────────────────────────────────────────────────────

export async function promptAgents(project) {
  const install = await confirm({
    message: 'Install custom agents (subagents)?',
    default: true,
  });

  if (!install) return [];

  // Determine recommended agents based on detected languages
  const recommended = new Set([...DEFAULT_AGENTS]);
  const recommendedReason = new Map(); // agent -> reason string
  for (const a of DEFAULT_AGENTS) {
    recommendedReason.set(a, 'default');
  }

  const langs = project.languages || [];
  for (const lang of langs) {
    const langAgents = LANGUAGE_AGENT_MAP[lang] || [];
    const langLabel = LANGUAGE_OPTIONS.find(o => o.value === lang)?.label || lang;
    for (const a of langAgents) {
      recommended.add(a);
      if (!recommendedReason.has(a) || recommendedReason.get(a) === 'default') {
        recommendedReason.set(a, langLabel);
      }
    }
  }

  // Separate recommended (detected) from others
  const recommendedAgents = AVAILABLE_AGENTS.filter(a => recommended.has(a.value));
  const otherAgents = AVAILABLE_AGENTS.filter(a => !recommended.has(a.value));

  const totalCount = AVAILABLE_AGENTS.length;
  const recCount = recommendedAgents.length;

  // Build choices: recommended first, then all others by category
  const choices = [];

  if (recCount > 0) {
    choices.push({ type: 'separator', separator: chalk.bold.green(`── Recommended for your project (${recCount}/${totalCount}) ──`) });
    for (const agent of recommendedAgents) {
      const reason = recommendedReason.get(agent.value);
      const tag = reason && reason !== 'default'
        ? chalk.gray(` (${reason})`)
        : chalk.gray(' (default)');
      choices.push({
        name: `${agent.name} - ${agent.description}${tag}`,
        value: agent.value,
        checked: true,
      });
    }
  }

  // Group remaining agents by category
  const categories = [...new Set(otherAgents.map(a => a.category))];
  for (const category of categories) {
    const categoryAgents = otherAgents.filter(a => a.category === category);
    if (categoryAgents.length === 0) continue;
    choices.push({ type: 'separator', separator: chalk.bold.blue(`── ${category} (${categoryAgents.length}) ──`) });
    for (const agent of categoryAgents) {
      choices.push({
        name: `${agent.name} - ${agent.description}`,
        value: agent.value,
        checked: false,
      });
    }
  }

  const selected = await checkbox({
    message: `Select agents (${recCount} recommended / ${totalCount} total, scroll with arrows):`,
    choices,
    pageSize: 18,
  });

  return selected;
}

// ─── Skill Selection ────────────────────────────────────────────────────────

export async function promptSkills(project) {
  const install = await confirm({
    message: 'Install skills (SKILL.md)?',
    default: true,
  });

  if (!install) return [];

  const totalCount = AVAILABLE_SKILLS.length;
  const recCount = DEFAULT_SKILLS.size;

  const selected = await checkbox({
    message: `Select skills (${recCount} recommended / ${totalCount} total, scroll with arrows):`,
    choices: AVAILABLE_SKILLS.map(s => ({
      name: `${s.name} - ${s.description}`,
      value: s.value,
      checked: DEFAULT_SKILLS.has(s.value),
    })),
  });

  return selected;
}

// ─── Model Selection ────────────────────────────────────────────────────────

export async function promptModels(project) {
  const config = project.existingConfig;

  // ── Detect models in existing config ─────────────────────────────────────
  const detectedModels = detectModelsInConfig(config);
  const knownModels = detectedModels.filter(m => m.family !== 'unknown');
  const unknownModels = detectedModels.filter(m => m.family === 'unknown');

  if (detectedModels.length > 0) {
    console.log(chalk.bold('  Models found in your config:'));
    console.log('');

    for (const m of detectedModels) {
      const tierLabel = TIER_LABELS[m.tier] || m.tier;
      const costLabel = COST_LABELS[m.cost] || m.cost;
      const codingScore = m.coding > 0 ? ` | Coding: ${m.coding}/100` : '';
      if (m.family !== 'unknown') {
        console.log(chalk.green(`    ${m.originalId}`));
        console.log(chalk.gray(`      -> ${m.canonical} (${m.family}) | ${tierLabel} | Cost: ${costLabel}${codingScore}`));
      } else {
        console.log(chalk.yellow(`    ${m.originalId}`));
        console.log(chalk.gray(`      -> Unknown model (cannot determine tier/pricing)`));
      }
    }
    console.log('');

    // Optimization suggestions
    if (knownModels.length > 0) {
      const allFrontier = knownModels.every(m => m.tier === 'frontier' || m.cost === 'high' || m.cost === 'very-high');
      const noFastModel = !knownModels.some(m => m.tier === 'fast');

      if (allFrontier) {
        console.log(chalk.yellow('  Tip: All your models are frontier-tier. You could save significantly'));
        console.log(chalk.yellow('  by using a fast/cheap model for Plan, Explore, and read-only agents.'));
        console.log('');
      } else if (noFastModel) {
        console.log(chalk.yellow('  Tip: Consider adding a fast/cheap model (Haiku, GPT-4o-mini, Gemini Flash)'));
        console.log(chalk.yellow('  for Plan/Explore agents and system tasks (title, summary).'));
        console.log('');
      }
    }
  }

  // ── Build choices ────────────────────────────────────────────────────────

  const choices = [];

  // If we detected known models, offer to auto-optimize with THOSE models
  if (knownModels.length >= 2) {
    const frontier = knownModels.filter(m => m.tier === 'frontier').sort((a, b) => b.coding - a.coding)[0];
    const strong = knownModels.filter(m => m.tier === 'strong').sort((a, b) => b.coding - a.coding)[0];
    const fast = knownModels.filter(m => m.tier === 'fast').sort((a, b) => b.coding - a.coding)[0];
    const best = frontier || strong || knownModels[0];
    const cheapest = fast || strong || knownModels[knownModels.length - 1];

    if (best && cheapest && best.originalId !== cheapest.originalId) {
      choices.push({
        name: `Auto-optimize YOUR models (Build: ${best.canonical}, Plan/Explore: ${cheapest.canonical})`,
        value: 'auto',
        _custom: {
          model: best.originalId,
          small_model: cheapest.originalId,
          agents: {
            build: { model: best.originalId },
            plan: { model: cheapest.originalId },
            explore: { model: cheapest.originalId },
            general: { model: (strong || cheapest).originalId },
          },
        },
      });
    }
  }

  // Standard presets
  for (const [key, preset] of Object.entries(MODEL_PRESETS)) {
    choices.push({ name: preset.label, value: key });
  }

  const selected = await select({
    message: 'Model strategy:',
    choices,
    default: choices[0]?.value === 'auto' ? 'auto' : (project.hasOpenCodeConfig ? 'keep' : 'cost-optimized'),
  });

  if (selected === 'keep') return null;
  if (selected === 'auto') {
    const autoConfig = choices.find(c => c.value === 'auto')._custom;
    return autoConfig;
  }
  return MODEL_PRESETS[selected];
}

// ─── MCP Selection ──────────────────────────────────────────────────────────

export async function promptMcp(project) {
  const install = await confirm({
    message: 'Configure MCP servers?',
    default: true,
  });

  if (!install) return [];

  // Filter and sort MCPs by relevance to selected languages
  const langs = new Set(project.languages || []);

  const choices = [];
  const categories = [...new Set(AVAILABLE_MCP.map(m => m.category))];

  for (const category of categories) {
    const mcpsInCategory = AVAILABLE_MCP.filter(m => m.category === category);
    const relevant = mcpsInCategory.filter(m =>
      m.relevance.includes('*') || m.relevance.some(r => langs.has(r))
    );

    if (relevant.length === 0) continue;

    choices.push({ type: 'separator', separator: chalk.bold.blue(`── ${category} ──`) });
    for (const m of relevant) {
      const isRecommended = m.relevance.includes('*') && ['context7', 'git'].includes(m.value);
      choices.push({
        name: `${m.name} - ${m.description}`,
        value: m.value,
        checked: isRecommended,
      });
    }
  }

  if (choices.length === 0) {
    console.log(chalk.gray('  No relevant MCP servers found for your languages.'));
    return [];
  }

  const mcpCount = choices.filter(c => c.value).length;

  const selected = await checkbox({
    message: `Select MCP servers (${mcpCount} available for your languages, scroll with arrows):`,
    choices,
    pageSize: 15,
  });

  return selected;
}

// ─── MCP Search (mcp.so) ────────────────────────────────────────────────────

async function searchMcpSo(query) {
  try {
    const res = await fetch(`https://mcp.so/api/servers?q=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'awesome-opencode-cli/1.0' },
    });
    if (!res.ok) return [];
    const html = await res.text();

    // Parse server cards from mcp.so HTML
    // Pattern: href="/server/NAME/AUTHOR">...<h3>TITLE</h3>...<p>DESC</p>
    const pattern = /href="\/server\/([^"]+)"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    const matches = [...html.matchAll(pattern)];

    const seen = new Map();
    for (const m of matches) {
      const slug = m[1]; // e.g. "playwright-mcp/microsoft"
      const title = m[2].replace(/<[^>]+>/g, '').trim();
      const desc = m[3].replace(/<[^>]+>/g, '').trim();

      if (seen.has(slug)) continue;
      // Skip mirrors
      if (slug.includes('MCP-Mirror') || desc.startsWith('Mirror of')) continue;

      const parts = slug.split('/');
      const serverName = parts[0] || slug;
      const author = parts[1] || '';

      // Generate a sensible config -- for mcp.so we suggest npx install
      // since most servers are npm packages
      const npmGuess = author ? `@${author}/${serverName}` : serverName;

      seen.set(slug, {
        slug,
        title,
        description: desc.slice(0, 120),
        author,
        serverName,
        url: `https://mcp.so/server/${slug}`,
        config: { type: 'local', command: ['npx', '-y', npmGuess] },
      });
    }

    return [...seen.values()];
  } catch (err) {
    return [];
  }
}

export async function promptMcpSearch(currentMcpSelections) {
  const { input } = await import('@inquirer/prompts');
  const allResults = [];

  let searching = true;
  while (searching) {
    const doSearch = await confirm({
      message: allResults.length === 0
        ? 'Search mcp.so for additional MCP servers?'
        : 'Search for more MCP servers?',
      default: false,
    });

    if (!doSearch) break;

    const query = await input({
      message: 'Search mcp.so (e.g. "playwright", "database", "slack"):',
    });

    if (!query.trim()) continue;

    const spinner = ora(`Searching mcp.so for "${query}"...`).start();
    const results = await searchMcpSo(query.trim());
    spinner.stop();

    if (results.length === 0) {
      console.log(chalk.gray(`  No results found for "${query}".`));
      console.log(chalk.gray(`  Browse manually: https://mcp.so`));
      console.log('');
      continue;
    }

    console.log(chalk.gray(`  Found ${results.length} server(s) on mcp.so:`));
    console.log('');

    const choices = results.map(r => ({
      name: `${r.title} (${r.author}) - ${r.description}`,
      value: r.slug,
    }));

    const selected = await checkbox({
      message: `Select servers to add (${results.length} found, scroll with arrows):`,
      choices,
      pageSize: 12,
    });

    for (const slug of selected) {
      const server = results.find(r => r.slug === slug);
      if (server) {
        // Ask for the correct npm package name since mcp.so doesn't provide it
        const suggestedPkg = server.config.command[2];
        const pkgName = await input({
          message: `npm package for "${server.title}" (check ${server.url}):`,
          default: suggestedPkg,
        });

        allResults.push({
          name: server.title,
          value: server.serverName,
          config: { type: 'local', command: ['npx', '-y', pkgName.trim()] },
        });
      }
    }

    if (selected.length > 0) {
      console.log(chalk.green(`  Added ${selected.length} server(s).`));
      console.log('');
    }
  }

  return allResults;
}

// ─── Cost & Context Control ─────────────────────────────────────────────────

export async function promptCostControl(agents) {
  const apply = await confirm({
    message: 'Apply recommended step limits per agent? (controls context/cost)',
    default: true,
  });

  if (!apply) return { steps: false, compaction: true };

  console.log('');
  console.log(chalk.gray('  Step limits control how many iterations each agent can perform.'));
  console.log(chalk.gray('  Code-writing agents: unlimited | Review agents: 10-15 | Fast agents: 5-10'));
  console.log('');

  // Show what would be applied for selected agents
  const limited = agents.filter(a => {
    const t = getAgentTier(a);
    return t.steps !== null;
  });
  const unlimited = agents.filter(a => {
    const t = getAgentTier(a);
    return t.steps === null;
  });

  if (limited.length > 0) {
    console.log(chalk.gray('  Limited:'));
    for (const a of limited.slice(0, 8)) {
      const t = getAgentTier(a);
      console.log(chalk.gray(`    ${a}: ${t.steps} steps`));
    }
    if (limited.length > 8) console.log(chalk.gray(`    ... and ${limited.length - 8} more`));
  }
  if (unlimited.length > 0) {
    console.log(chalk.gray(`  Unlimited: ${unlimited.join(', ')}`));
  }
  console.log('');

  return { steps: true, compaction: true };
}

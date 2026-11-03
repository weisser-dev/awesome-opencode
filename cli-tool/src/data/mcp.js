// ─── MCP Server Data ────────────────────────────────────────────────────────
// MCP servers with language/framework relevance tags
// Source: Official MCP Reference Servers (modelcontextprotocol/servers)
//         + curated official third-party integrations from mcp.so

export const AVAILABLE_MCP = [
  // ── Universal (relevant for all projects) ─────────────────────────────────
  {
    name: 'context7',
    value: 'context7',
    description: 'Library documentation search (context7.com)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'remote', url: 'https://mcp.context7.com/mcp' },
  },
  {
    name: 'gh-grep',
    value: 'gh-grep',
    description: 'GitHub code search (grep.app by Vercel)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'remote', url: 'https://mcp.grep.app' },
  },
  {
    name: 'memory',
    value: 'memory',
    description: 'Persistent knowledge graph memory (official)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-memory'] },
  },
  {
    name: 'remnant-read',
    value: 'remnant-read',
    description: 'Search public agent experience and inspect evidence (anonymous, read-only)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'remote', url: 'https://remnant.dedale-bi.com/mcp/chatgpt', oauth: false },
  },
  {
    name: 'fetch',
    value: 'fetch',
    description: 'Web content fetching for LLM usage (official)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-fetch'] },
  },
  {
    name: 'sequential-thinking',
    value: 'sequential-thinking',
    description: 'Dynamic problem-solving through thought sequences (official)',
    category: 'Universal',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-sequential-thinking'] },
  },

  // ── Git & Version Control ─────────────────────────────────────────────────
  {
    name: 'git',
    value: 'git',
    description: 'Read, search, and manipulate Git repos (official)',
    category: 'Git & VCS',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-git'] },
  },

  // ── Monitoring & Error Tracking ───────────────────────────────────────────
  {
    name: 'sentry',
    value: 'sentry',
    description: 'Sentry error tracking and analysis (official)',
    category: 'Monitoring',
    relevance: ['*'],
    config: { type: 'remote', url: 'https://mcp.sentry.dev/mcp', oauth: {} },
  },
  {
    name: 'axiom',
    value: 'axiom',
    description: 'Query and analyze logs, traces, events (Axiom)',
    category: 'Monitoring',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', '@axiomhq/mcp-server-axiom'], environment: { AXIOM_TOKEN: '{env:AXIOM_TOKEN}' } },
  },

  // ── Database ──────────────────────────────────────────────────────────────
  {
    name: 'postgres',
    value: 'postgres',
    description: 'PostgreSQL read-only access with schema inspection (official)',
    category: 'Database',
    relevance: ['node', 'python', 'java', 'go', 'rust', 'ruby', 'php', 'csharp', 'kotlin', 'scala', 'elixir'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-postgres'], environment: { POSTGRES_URL: '{env:DATABASE_URL}' } },
  },
  {
    name: 'sqlite',
    value: 'sqlite',
    description: 'SQLite database interaction and BI queries (official)',
    category: 'Database',
    relevance: ['node', 'python', 'ruby', 'php', 'rust', 'go'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-sqlite'] },
  },
  {
    name: 'redis',
    value: 'redis',
    description: 'Redis key-value store interaction (official)',
    category: 'Database',
    relevance: ['node', 'python', 'java', 'go', 'ruby', 'php'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-redis'], environment: { REDIS_URL: '{env:REDIS_URL}' } },
  },

  // ── Cloud & Infrastructure ────────────────────────────────────────────────
  {
    name: 'aws',
    value: 'aws',
    description: 'AWS best practices and service interaction (official)',
    category: 'Cloud',
    relevance: ['terraform', 'cloudformation', 'docker', 'kubernetes', 'node', 'python', 'java', 'go'],
    config: { type: 'local', command: ['npx', '-y', '@aws/mcp'] },
  },
  {
    name: 'kubernetes',
    value: 'kubernetes',
    description: 'Kubernetes cluster management via kubectl',
    category: 'Cloud',
    relevance: ['kubernetes', 'docker', 'terraform', 'go', 'java', 'node', 'python'],
    config: { type: 'local', command: ['npx', '-y', 'mcp-server-kubernetes'] },
  },

  // ── Deployment & Hosting ──────────────────────────────────────────────────
  {
    name: 'vercel',
    value: 'vercel',
    description: 'Vercel API for deployments and projects',
    category: 'Deployment',
    relevance: ['node'],
    config: { type: 'local', command: ['npx', '-y', 'vercel-mcp'], environment: { VERCEL_TOKEN: '{env:VERCEL_TOKEN}' } },
  },

  // ── Browser & Testing ─────────────────────────────────────────────────────
  {
    name: 'puppeteer',
    value: 'puppeteer',
    description: 'Browser automation and web scraping (official)',
    category: 'Testing',
    relevance: ['node', 'python'],
    config: { type: 'local', command: ['npx', '-y', '@modelcontextprotocol/server-puppeteer'] },
  },

  // ── Collaboration ─────────────────────────────────────────────────────────
  {
    name: 'atlassian',
    value: 'atlassian',
    description: 'Jira + Confluence integration (official Atlassian)',
    category: 'Collaboration',
    relevance: ['*'],
    config: { type: 'remote', url: 'https://mcp.atlassian.com/v1/sse' },
  },
  {
    name: 'linear',
    value: 'linear',
    description: 'Linear issue tracking integration',
    category: 'Collaboration',
    relevance: ['*'],
    config: { type: 'local', command: ['npx', '-y', 'mcp-linear'], environment: { LINEAR_API_KEY: '{env:LINEAR_API_KEY}' } },
  },

  // ── Design ────────────────────────────────────────────────────────────────
  {
    name: 'figma',
    value: 'figma',
    description: 'Figma layout info for AI coding agents (Framelink)',
    category: 'Design',
    relevance: ['node', 'dart'],
    config: { type: 'local', command: ['npx', '-y', 'figma-developer-mcp'], environment: { FIGMA_API_KEY: '{env:FIGMA_API_KEY}' } },
  },
];

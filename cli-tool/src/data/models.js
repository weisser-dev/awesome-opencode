// ─── Model Intelligence ─────────────────────────────────────────────────────
// Model fingerprinting, pricing tiers, and agent-aware optimization.
// Rankings based on LiveCodeBench, Aider, MMLU-Pro benchmarks + pricing data.
// Source: pricepertoken.com/leaderboards/coding, openrouter.ai

// Known model fingerprints -- maps regex patterns to canonical model info.
// This allows recognizing models even through custom providers (e.g. Bedrock, Azure).
// Families sourced from https://models.dev (anomalyco/models.dev)
export const MODEL_FINGERPRINTS = [
  // ── Anthropic ─────────────────────────────────────────────────────────────
  { pattern: /claude.*opus.*4/i,        canonical: 'claude-opus-4',       family: 'anthropic', tier: 'frontier', coding: 95, cost: 'high' },
  { pattern: /claude.*sonnet.*4/i,      canonical: 'claude-sonnet-4',     family: 'anthropic', tier: 'strong',   coding: 90, cost: 'medium' },
  { pattern: /claude.*haiku.*4/i,       canonical: 'claude-haiku-4',      family: 'anthropic', tier: 'fast',     coding: 75, cost: 'low' },
  { pattern: /claude.*opus.*3/i,        canonical: 'claude-opus-3',       family: 'anthropic', tier: 'strong',   coding: 80, cost: 'high' },
  { pattern: /claude.*sonnet.*3/i,      canonical: 'claude-sonnet-3',     family: 'anthropic', tier: 'strong',   coding: 78, cost: 'medium' },
  { pattern: /claude.*haiku.*3/i,       canonical: 'claude-haiku-3',      family: 'anthropic', tier: 'fast',     coding: 60, cost: 'low' },
  // ── OpenAI (most specific first) ──────────────────────────────────────────
  { pattern: /gpt.*5\.?3.*codex/i,     canonical: 'gpt-5.3-codex',       family: 'openai',    tier: 'frontier', coding: 96, cost: 'very-high' },
  { pattern: /gpt.*5\.?3.*chat/i,      canonical: 'gpt-5.3-chat',        family: 'openai',    tier: 'frontier', coding: 94, cost: 'high' },
  { pattern: /gpt.*5\.?3/i,            canonical: 'gpt-5.3',             family: 'openai',    tier: 'frontier', coding: 94, cost: 'high' },
  { pattern: /gpt.*5\.?2/i,            canonical: 'gpt-5.2',             family: 'openai',    tier: 'frontier', coding: 93, cost: 'high' },
  { pattern: /gpt.*5\.?1.*codex/i,     canonical: 'gpt-5.1-codex',       family: 'openai',    tier: 'strong',   coding: 88, cost: 'medium' },
  { pattern: /gpt.*5\.?1/i,            canonical: 'gpt-5.1',             family: 'openai',    tier: 'strong',   coding: 85, cost: 'medium' },
  { pattern: /gpt.*5.*codex/i,         canonical: 'gpt-5-codex',         family: 'openai',    tier: 'strong',   coding: 86, cost: 'medium' },
  { pattern: /gpt.*5.*mini/i,          canonical: 'gpt-5-mini',          family: 'openai',    tier: 'fast',     coding: 72, cost: 'low' },
  { pattern: /gpt.*5/i,                canonical: 'gpt-5',               family: 'openai',    tier: 'strong',   coding: 85, cost: 'medium' },
  { pattern: /gpt.*4\.?1.*nano/i,      canonical: 'gpt-4.1-nano',        family: 'openai',    tier: 'fast',     coding: 60, cost: 'very-low' },
  { pattern: /gpt.*4\.?1.*mini/i,      canonical: 'gpt-4.1-mini',        family: 'openai',    tier: 'fast',     coding: 68, cost: 'low' },
  { pattern: /gpt.*4\.?1/i,            canonical: 'gpt-4.1',             family: 'openai',    tier: 'strong',   coding: 82, cost: 'medium' },
  { pattern: /gpt.*4o.*mini/i,         canonical: 'gpt-4o-mini',          family: 'openai',    tier: 'fast',     coding: 65, cost: 'low' },
  { pattern: /gpt.*4o/i,               canonical: 'gpt-4o',               family: 'openai',    tier: 'strong',   coding: 80, cost: 'medium' },
  { pattern: /gpt.*4.*turbo/i,         canonical: 'gpt-4-turbo',          family: 'openai',    tier: 'strong',   coding: 75, cost: 'medium' },
  { pattern: /codex.*mini/i,           canonical: 'codex-mini',           family: 'openai',    tier: 'fast',     coding: 70, cost: 'low' },
  { pattern: /o4.*mini/i,              canonical: 'o4-mini',              family: 'openai',    tier: 'strong',   coding: 88, cost: 'medium' },
  { pattern: /o3[\b\-]|^o3$/i,         canonical: 'o3',                   family: 'openai',    tier: 'frontier', coding: 96, cost: 'very-high' },
  // ── Google ────────────────────────────────────────────────────────────────
  { pattern: /gemini.*3.*pro/i,        canonical: 'gemini-3-pro',        family: 'google',    tier: 'strong',   coding: 82, cost: 'medium' },
  { pattern: /gemini.*2\.?5.*pro/i,    canonical: 'gemini-2.5-pro',      family: 'google',    tier: 'strong',   coding: 80, cost: 'medium' },
  { pattern: /gemini.*2\.?5.*flash.*lite/i, canonical: 'gemini-2.5-flash-lite', family: 'google', tier: 'fast', coding: 62, cost: 'very-low' },
  { pattern: /gemini.*2\.?5.*flash/i,  canonical: 'gemini-2.5-flash',    family: 'google',    tier: 'fast',     coding: 72, cost: 'low' },
  { pattern: /gemini.*2.*flash.*lite/i,canonical: 'gemini-2-flash-lite', family: 'google',    tier: 'fast',     coding: 58, cost: 'very-low' },
  { pattern: /gemini.*2.*flash/i,      canonical: 'gemini-2-flash',      family: 'google',    tier: 'fast',     coding: 68, cost: 'low' },
  { pattern: /gemini.*1\.?5.*pro/i,    canonical: 'gemini-1.5-pro',      family: 'google',    tier: 'strong',   coding: 72, cost: 'medium' },
  { pattern: /gemini.*1\.?5.*flash/i,  canonical: 'gemini-1.5-flash',    family: 'google',    tier: 'fast',     coding: 60, cost: 'low' },
  // ── DeepSeek ──────────────────────────────────────────────────────────────
  { pattern: /deepseek.*r1/i,          canonical: 'deepseek-r1',         family: 'deepseek',  tier: 'strong',   coding: 85, cost: 'low' },
  { pattern: /deepseek.*v3|deepseek.*chat/i, canonical: 'deepseek-v3',   family: 'deepseek',  tier: 'strong',   coding: 82, cost: 'low' },
  // ── Meta / Llama ──────────────────────────────────────────────────────────
  { pattern: /llama.*4.*maverick/i,    canonical: 'llama-4-maverick',    family: 'meta',      tier: 'strong',   coding: 78, cost: 'low' },
  { pattern: /llama.*4.*scout/i,       canonical: 'llama-4-scout',       family: 'meta',      tier: 'fast',     coding: 70, cost: 'very-low' },
  { pattern: /llama.*3.*405/i,         canonical: 'llama-3-405b',        family: 'meta',      tier: 'strong',   coding: 75, cost: 'low' },
  { pattern: /llama.*3.*70/i,          canonical: 'llama-3-70b',         family: 'meta',      tier: 'fast',     coding: 65, cost: 'very-low' },
  { pattern: /llama.*3.*8/i,           canonical: 'llama-3-8b',          family: 'meta',      tier: 'fast',     coding: 50, cost: 'very-low' },
  // ── Mistral ───────────────────────────────────────────────────────────────
  { pattern: /devstral.*medium/i,      canonical: 'devstral-medium',     family: 'mistral',   tier: 'strong',   coding: 82, cost: 'medium' },
  { pattern: /devstral.*small/i,       canonical: 'devstral-small',      family: 'mistral',   tier: 'fast',     coding: 72, cost: 'low' },
  { pattern: /devstral/i,              canonical: 'devstral',            family: 'mistral',   tier: 'strong',   coding: 78, cost: 'low' },
  { pattern: /magistral.*medium/i,     canonical: 'magistral-medium',    family: 'mistral',   tier: 'strong',   coding: 75, cost: 'medium' },
  { pattern: /magistral.*small/i,      canonical: 'magistral-small',     family: 'mistral',   tier: 'fast',     coding: 65, cost: 'low' },
  { pattern: /mistral.*large/i,        canonical: 'mistral-large',       family: 'mistral',   tier: 'strong',   coding: 75, cost: 'medium' },
  { pattern: /codestral/i,             canonical: 'codestral',           family: 'mistral',   tier: 'strong',   coding: 78, cost: 'low' },
  { pattern: /ministral.*8/i,          canonical: 'ministral-8b',        family: 'mistral',   tier: 'fast',     coding: 55, cost: 'very-low' },
  { pattern: /ministral.*3/i,          canonical: 'ministral-3b',        family: 'mistral',   tier: 'fast',     coding: 45, cost: 'very-low' },
  // ── xAI / Grok ───────────────────────────────────────────────────────────
  { pattern: /grok.*4/i,               canonical: 'grok-4',              family: 'xai',       tier: 'frontier', coding: 92, cost: 'high' },
  { pattern: /grok.*3.*mini.*fast/i,   canonical: 'grok-3-mini-fast',   family: 'xai',       tier: 'fast',     coding: 70, cost: 'low' },
  { pattern: /grok.*3.*mini/i,         canonical: 'grok-3-mini',        family: 'xai',       tier: 'fast',     coding: 72, cost: 'low' },
  { pattern: /grok.*3.*fast/i,         canonical: 'grok-3-fast',        family: 'xai',       tier: 'strong',   coding: 82, cost: 'medium' },
  { pattern: /grok.*3/i,               canonical: 'grok-3',             family: 'xai',       tier: 'strong',   coding: 85, cost: 'medium' },
  { pattern: /grok.*2/i,               canonical: 'grok-2',             family: 'xai',       tier: 'strong',   coding: 75, cost: 'medium' },
  // ── Cohere ────────────────────────────────────────────────────────────────
  { pattern: /command.*a.*reason/i,    canonical: 'command-a-reasoning', family: 'cohere',    tier: 'strong',   coding: 78, cost: 'medium' },
  { pattern: /command.*a/i,            canonical: 'command-a',           family: 'cohere',    tier: 'strong',   coding: 75, cost: 'medium' },
  { pattern: /command.*r.*plus/i,      canonical: 'command-r-plus',     family: 'cohere',    tier: 'strong',   coding: 70, cost: 'medium' },
  { pattern: /command.*r7b/i,          canonical: 'command-r7b',        family: 'cohere',    tier: 'fast',     coding: 55, cost: 'very-low' },
  { pattern: /command.*r\b/i,          canonical: 'command-r',          family: 'cohere',    tier: 'fast',     coding: 60, cost: 'low' },
  // ── Perplexity ────────────────────────────────────────────────────────────
  { pattern: /sonar.*deep/i,           canonical: 'sonar-deep-research', family: 'perplexity', tier: 'strong',  coding: 72, cost: 'medium' },
  { pattern: /sonar.*pro/i,            canonical: 'sonar-pro',           family: 'perplexity', tier: 'strong',  coding: 68, cost: 'medium' },
  { pattern: /sonar.*reason/i,         canonical: 'sonar-reasoning',     family: 'perplexity', tier: 'strong',  coding: 70, cost: 'medium' },
  { pattern: /sonar/i,                 canonical: 'sonar',               family: 'perplexity', tier: 'fast',    coding: 60, cost: 'low' },
  // ── Alibaba / Qwen ────────────────────────────────────────────────────────
  { pattern: /qwen.*3.*235/i,          canonical: 'qwen-3-235b',        family: 'alibaba',   tier: 'strong',   coding: 80, cost: 'low' },
  { pattern: /qwen.*3.*32/i,           canonical: 'qwen-3-32b',         family: 'alibaba',   tier: 'fast',     coding: 68, cost: 'very-low' },
  { pattern: /qwen.*2\.?5.*coder/i,    canonical: 'qwen-2.5-coder',     family: 'alibaba',   tier: 'strong',   coding: 78, cost: 'low' },
  { pattern: /qwen.*coder/i,           canonical: 'qwen-coder',         family: 'alibaba',   tier: 'strong',   coding: 75, cost: 'low' },
  { pattern: /qwen/i,                  canonical: 'qwen',               family: 'alibaba',   tier: 'strong',   coding: 72, cost: 'low' },
  // ── MiniMax ───────────────────────────────────────────────────────────────
  { pattern: /minimax/i,               canonical: 'minimax',            family: 'minimax',   tier: 'strong',   coding: 70, cost: 'low' },
  // ── ZhipuAI / GLM ────────────────────────────────────────────────────────
  { pattern: /glm.*4/i,                canonical: 'glm-4',              family: 'zhipuai',   tier: 'strong',   coding: 72, cost: 'low' },
  // ── Nvidia / Nemotron ─────────────────────────────────────────────────────
  { pattern: /nemotron/i,              canonical: 'nemotron',           family: 'nvidia',    tier: 'strong',   coding: 70, cost: 'low' },
  // ── Moonshot / Kimi ───────────────────────────────────────────────────────
  { pattern: /kimi|moonshot/i,         canonical: 'kimi',               family: 'moonshot',  tier: 'strong',   coding: 68, cost: 'low' },
  // ── Cerebras ──────────────────────────────────────────────────────────────
  { pattern: /cerebras/i,              canonical: 'cerebras',           family: 'cerebras',  tier: 'fast',     coding: 65, cost: 'low' },
  // ── StepFun ───────────────────────────────────────────────────────────────
  { pattern: /step/i,                  canonical: 'step',               family: 'stepfun',   tier: 'strong',   coding: 65, cost: 'low' },
  // ── Inception / Mercury ───────────────────────────────────────────────────
  { pattern: /mercury/i,               canonical: 'mercury',            family: 'inception',  tier: 'strong',  coding: 72, cost: 'low' },
];

export const COST_LABELS = { 'very-low': '$', 'low': '$$', 'medium': '$$$', 'high': '$$$$', 'very-high': '$$$$$' };
export const TIER_LABELS = { 'frontier': 'Frontier (best quality)', 'strong': 'Strong (good balance)', 'fast': 'Fast (cheap & quick)' };

// Agent tiers: which agents need which model quality and iteration limits.
// tier: frontier = complex reasoning, code generation, architecture
//       strong   = good balance of speed and quality
//       fast     = read-only, exploration, simple tasks
// steps: max agentic iterations (null = unlimited, number = limit)
//   - Code-writing agents: no limit (they need to iterate until done)
//   - Analysis/review agents: 10-15 steps (read, analyze, report)
//   - Fast/read-only agents: 5-10 steps (quick lookups)
export const AGENT_TIERS = {
  // Primary agents
  build:   { tier: 'frontier', steps: null },
  plan:    { tier: 'fast',     steps: null },
  // Subagents that WRITE code -- no step limit
  'backend-developer':  { tier: 'frontier', steps: null },
  'frontend-developer': { tier: 'frontier', steps: null },
  'fullstack-developer':{ tier: 'frontier', steps: null },
  'api-designer':       { tier: 'strong',   steps: null },
  'graphql-architect':  { tier: 'strong',   steps: null },
  'microservices-architect': { tier: 'strong', steps: null },
  'refactorer':         { tier: 'strong',   steps: null },
  'test-writer':        { tier: 'strong',   steps: null },
  'test-automator':     { tier: 'strong',   steps: null },
  // Language specialists -- no step limit (they write code)
  'typescript-pro': { tier: 'frontier', steps: null },
  'javascript-pro': { tier: 'frontier', steps: null },
  'python-pro':     { tier: 'frontier', steps: null },
  'java-architect': { tier: 'frontier', steps: null },
  'rust-engineer':  { tier: 'frontier', steps: null },
  'golang-pro':     { tier: 'frontier', steps: null },
  'angular-architect':   { tier: 'frontier', steps: null },
  'cpp-pro':             { tier: 'frontier', steps: null },
  'csharp-developer':    { tier: 'frontier', steps: null },
  'elixir-expert':       { tier: 'frontier', steps: null },
  'flutter-expert':      { tier: 'frontier', steps: null },
  'kotlin-specialist':   { tier: 'frontier', steps: null },
  'php-pro':             { tier: 'frontier', steps: null },
  'ruby-pro':            { tier: 'frontier', steps: null },
  'swift-expert':        { tier: 'frontier', steps: null },
  'react-specialist':    { tier: 'strong', steps: null },
  'nextjs-developer':    { tier: 'strong', steps: null },
  'vue-expert':          { tier: 'strong', steps: null },
  'spring-boot-engineer':{ tier: 'strong', steps: null },
  'django-developer':    { tier: 'strong', steps: null },
  'fastapi-developer':   { tier: 'strong', steps: null },
  'laravel-specialist':  { tier: 'strong', steps: null },
  'sql-pro':             { tier: 'strong', steps: 15 },
  // Infrastructure -- read-heavy, moderate limits (some write configs)
  'azure-infra-engineer':  { tier: 'strong', steps: 15 },
  'cloud-architect':       { tier: 'strong', steps: 15 },
  'database-administrator':{ tier: 'strong', steps: 15 },
  'deployment-engineer':   { tier: 'strong', steps: 15 },
  'devops-engineer':       { tier: 'strong', steps: null },
  'docker-expert':         { tier: 'strong', steps: null },
  'incident-responder':    { tier: 'strong', steps: 15 },
  'kubernetes-specialist': { tier: 'strong', steps: 15 },
  'network-engineer':      { tier: 'strong', steps: 12 },
  'platform-engineer':     { tier: 'strong', steps: 15 },
  'security-engineer':     { tier: 'strong', steps: 15 },
  'sre-engineer':          { tier: 'strong', steps: 15 },
  'terraform-engineer':    { tier: 'strong', steps: null },
  // READ-ONLY / analysis agents -- limited steps
  'code-reviewer':       { tier: 'strong', steps: 15 },
  'architect-reviewer':  { tier: 'strong', steps: 15 },
  'security-auditor':    { tier: 'strong', steps: 15 },
  'performance-engineer':{ tier: 'strong', steps: 15 },
  'compliance-auditor':  { tier: 'strong', steps: 15 },
  'debugger':            { tier: 'strong', steps: 20 },
  'error-detective':     { tier: 'strong', steps: 15 },
  'penetration-tester':  { tier: 'strong', steps: 15 },
  'accessibility-tester':{ tier: 'strong', steps: 10 },
  'chaos-engineer':      { tier: 'strong', steps: 10 },
  // Data & AI -- mix of writing and analysis
  'ai-engineer':               { tier: 'strong', steps: null },
  'data-analyst':              { tier: 'strong', steps: 12 },
  'data-engineer':             { tier: 'strong', steps: null },
  'data-scientist':            { tier: 'strong', steps: 15 },
  'database-optimizer':        { tier: 'strong', steps: 15 },
  'llm-architect':             { tier: 'strong', steps: 15 },
  'machine-learning-engineer': { tier: 'strong', steps: null },
  'mlops-engineer':            { tier: 'strong', steps: 15 },
  'nlp-engineer':              { tier: 'strong', steps: null },
  'postgres-pro':              { tier: 'strong', steps: 15 },
  'prompt-engineer':           { tier: 'fast',   steps: 10 },
  // Developer Experience -- mix of writing and advisory
  'build-engineer':      { tier: 'strong', steps: null },
  'cli-developer':       { tier: 'strong', steps: null },
  'dx-optimizer':        { tier: 'fast',   steps: 10 },
  'legacy-modernizer':   { tier: 'strong', steps: null },
  'mcp-developer':       { tier: 'strong', steps: null },
  'tooling-engineer':    { tier: 'strong', steps: null },
  // Specialized Domains -- code-writing
  'blockchain-developer':{ tier: 'frontier', steps: null },
  'embedded-systems':    { tier: 'frontier', steps: null },
  'fintech-engineer':    { tier: 'strong',   steps: null },
  'game-developer':      { tier: 'frontier', steps: null },
  'iot-engineer':        { tier: 'strong',   steps: null },
  'mobile-app-developer':{ tier: 'strong',   steps: null },
  'mobile-developer':    { tier: 'strong',   steps: null },
  'payment-integration': { tier: 'strong',   steps: null },
  'seo-specialist':      { tier: 'fast',     steps: 10 },
  'websocket-engineer':  { tier: 'strong',   steps: null },
  // Cheap/fast agents -- tight step limits
  'docs-writer':         { tier: 'fast', steps: 10 },
  'technical-writer':    { tier: 'fast', steps: 10 },
  'context-manager':     { tier: 'fast', steps: 5 },
  'task-distributor':    { tier: 'fast', steps: 5 },
  'search-specialist':   { tier: 'fast', steps: 8 },
  'research-analyst':    { tier: 'fast', steps: 10 },
  'dependency-manager':  { tier: 'fast', steps: 10 },
  'git-workflow-manager':{ tier: 'fast', steps: 8 },
  // Business/product -- advisory, limited steps
  'business-analyst':    { tier: 'strong', steps: 10 },
  'content-marketer':    { tier: 'fast',   steps: 10 },
  'legal-advisor':       { tier: 'strong', steps: 10 },
  'product-manager':     { tier: 'strong', steps: 10 },
  'project-manager':     { tier: 'strong', steps: 8 },
  'sales-engineer':      { tier: 'strong', steps: 10 },
  'scrum-master':        { tier: 'fast',   steps: 8 },
  'ux-researcher':       { tier: 'strong', steps: 10 },
  // Research -- moderate steps
  'competitive-analyst': { tier: 'strong', steps: 12 },
  'trend-analyst':       { tier: 'strong', steps: 10 },
  'market-researcher':   { tier: 'strong', steps: 10 },
  'data-researcher':     { tier: 'strong', steps: 12 },
  'scientific-literature-researcher': { tier: 'strong', steps: 12 },
  // Orchestration -- limited steps (they delegate, not execute)
  'workflow-orchestrator':     { tier: 'strong', steps: 10 },
  'multi-agent-coordinator':  { tier: 'strong', steps: 10 },
  'agent-organizer':          { tier: 'fast',   steps: 5 },
  'knowledge-synthesizer':    { tier: 'fast',   steps: 8 },
  'error-coordinator':        { tier: 'strong', steps: 10 },
  // Default for unlisted agents
  '_default': { tier: 'strong', steps: null },
};

export function getAgentTier(agentName) {
  const entry = AGENT_TIERS[agentName] || AGENT_TIERS['_default'];
  return typeof entry === 'object' ? entry : { tier: entry, steps: null };
}

export const MODEL_PRESETS = {
  'cost-optimized': {
    label: 'Cost Optimized (Haiku for Plan/Explore, Sonnet for Build)',
    model: 'anthropic/claude-sonnet-4-5-20250929',
    small_model: 'anthropic/claude-haiku-4-5-20250929',
    agents: {
      build: { model: 'anthropic/claude-sonnet-4-5-20250929' },
      plan: { model: 'anthropic/claude-haiku-4-5-20250929' },
      explore: { model: 'anthropic/claude-haiku-4-5-20250929' },
      general: { model: 'anthropic/claude-haiku-4-5-20250929' },
    },
  },
  'quality-focused': {
    label: 'Quality Focused (Opus for Build, Sonnet for others)',
    model: 'anthropic/claude-opus-4-5-20250918',
    small_model: 'anthropic/claude-haiku-4-5-20250929',
    agents: {
      build: { model: 'anthropic/claude-opus-4-5-20250918' },
      plan: { model: 'anthropic/claude-sonnet-4-5-20250929' },
      explore: { model: 'anthropic/claude-haiku-4-5-20250929' },
      general: { model: 'anthropic/claude-sonnet-4-5-20250929' },
    },
  },
  'openai': {
    label: 'OpenAI Stack (GPT 5.2 for Build, GPT 5.1 Codex for others)',
    model: 'openai/gpt-5.2',
    small_model: 'openai/gpt-5.1-codex',
    agents: {
      build: { model: 'openai/gpt-5.2' },
      plan: { model: 'openai/gpt-5.1-codex' },
      explore: { model: 'openai/gpt-5.1-codex' },
      general: { model: 'openai/gpt-5.1-codex' },
    },
  },
  'mixed': {
    label: 'Mixed (Best of each provider)',
    model: 'anthropic/claude-sonnet-4-5-20250929',
    small_model: 'anthropic/claude-haiku-4-5-20250929',
    agents: {
      build: { model: 'anthropic/claude-sonnet-4-5-20250929' },
      plan: { model: 'anthropic/claude-haiku-4-5-20250929' },
      explore: { model: 'anthropic/claude-haiku-4-5-20250929' },
      general: { model: 'anthropic/claude-haiku-4-5-20250929' },
    },
  },
  'keep': {
    label: 'Keep existing model config',
  },
};

/**
 * Given a model ID string (possibly from a custom provider like "eu.anthropic.claude-sonnet-4-6"),
 * try to match it to a known model family and return its info.
 */
export function fingerprintModel(modelId) {
  if (!modelId) return null;
  for (const fp of MODEL_FINGERPRINTS) {
    if (fp.pattern.test(modelId)) {
      return { ...fp, originalId: modelId };
    }
  }
  return { originalId: modelId, canonical: modelId, family: 'unknown', tier: 'unknown', coding: 0, cost: 'unknown' };
}

/**
 * Scan an opencode.json config for all model references (top-level + per-agent)
 * and return a deduplicated list of fingerprinted models.
 */
export function detectModelsInConfig(config) {
  if (!config) return [];
  const modelIds = new Set();

  if (config.model) modelIds.add(config.model);
  if (config.small_model) modelIds.add(config.small_model);

  // Scan providers for custom model definitions
  if (config.provider) {
    for (const [providerName, providerConfig] of Object.entries(config.provider)) {
      if (providerConfig.models) {
        for (const [modelKey, modelDef] of Object.entries(providerConfig.models)) {
          // Use the provider/model key format
          modelIds.add(`${providerName}/${modelKey}`);
        }
      }
    }
  }

  // Scan agents for model references
  if (config.agent) {
    for (const [agentName, agentConfig] of Object.entries(config.agent)) {
      if (agentConfig.model) modelIds.add(agentConfig.model);
    }
  }

  return [...modelIds].map(id => fingerprintModel(id)).filter(Boolean);
}

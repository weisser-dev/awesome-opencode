// ─── Agent Data ─────────────────────────────────────────────────────────────

export const AVAILABLE_AGENTS = [
  // ── Core Development ──────────────────────────────────────────────────────
  { name: 'api-designer', value: 'api-designer', description: 'REST/GraphQL API design and contract definition', category: 'Core Development' },
  { name: 'backend-developer', value: 'backend-developer', description: 'Server-side logic, APIs, and data processing', category: 'Core Development' },
  { name: 'frontend-developer', value: 'frontend-developer', description: 'UI implementation, components, and browser APIs', category: 'Core Development' },
  { name: 'fullstack-developer', value: 'fullstack-developer', description: 'End-to-end feature development across the stack', category: 'Core Development' },
  { name: 'graphql-architect', value: 'graphql-architect', description: 'GraphQL schema design, resolvers, and federation', category: 'Core Development' },
  { name: 'microservices-architect', value: 'microservices-architect', description: 'Microservices design, boundaries, and communication', category: 'Core Development' },
  { name: 'mobile-developer', value: 'mobile-developer', description: 'Native and cross-platform mobile app development', category: 'Core Development' },
  { name: 'websocket-engineer', value: 'websocket-engineer', description: 'Real-time communication and WebSocket protocol design', category: 'Core Development' },

  // ── Language Specialists ───────────────────────────────────────────────────
  { name: 'typescript-pro', value: 'typescript-pro', description: 'TypeScript type system, generics, and advanced patterns', category: 'Language Specialists' },
  { name: 'javascript-pro', value: 'javascript-pro', description: 'Modern JavaScript, ES modules, and runtime optimization', category: 'Language Specialists' },
  { name: 'python-pro', value: 'python-pro', description: 'Pythonic patterns, async, and ecosystem best practices', category: 'Language Specialists' },
  { name: 'java-architect', value: 'java-architect', description: 'Java architecture, JVM tuning, and enterprise patterns', category: 'Language Specialists' },
  { name: 'kotlin-specialist', value: 'kotlin-specialist', description: 'Kotlin idioms, coroutines, and multiplatform development', category: 'Language Specialists' },
  { name: 'golang-pro', value: 'golang-pro', description: 'Go concurrency, interfaces, and systems programming', category: 'Language Specialists' },
  { name: 'rust-engineer', value: 'rust-engineer', description: 'Rust ownership, lifetimes, and zero-cost abstractions', category: 'Language Specialists' },
  { name: 'swift-expert', value: 'swift-expert', description: 'Swift protocols, concurrency, and Apple platform APIs', category: 'Language Specialists' },
  { name: 'cpp-pro', value: 'cpp-pro', description: 'Modern C++ patterns, templates, and memory management', category: 'Language Specialists' },
  { name: 'csharp-developer', value: 'csharp-developer', description: 'C# and .NET ecosystem, LINQ, and async patterns', category: 'Language Specialists' },
  { name: 'php-pro', value: 'php-pro', description: 'Modern PHP, Composer, and framework best practices', category: 'Language Specialists' },
  { name: 'ruby-pro', value: 'ruby-pro', description: 'Ruby idioms, metaprogramming, and gem ecosystem', category: 'Language Specialists' },
  { name: 'react-specialist', value: 'react-specialist', description: 'React hooks, state management, and component design', category: 'Language Specialists' },
  { name: 'vue-expert', value: 'vue-expert', description: 'Vue 3 composition API, reactivity, and ecosystem', category: 'Language Specialists' },
  { name: 'angular-architect', value: 'angular-architect', description: 'Angular modules, RxJS, and enterprise-scale SPAs', category: 'Language Specialists' },
  { name: 'nextjs-developer', value: 'nextjs-developer', description: 'Next.js App Router, SSR, RSC, and deployment', category: 'Language Specialists' },
  { name: 'django-developer', value: 'django-developer', description: 'Django ORM, views, middleware, and admin patterns', category: 'Language Specialists' },
  { name: 'fastapi-developer', value: 'fastapi-developer', description: 'FastAPI async endpoints, Pydantic, and OpenAPI', category: 'Language Specialists' },
  { name: 'spring-boot-engineer', value: 'spring-boot-engineer', description: 'Spring Boot auto-config, DI, and reactive stack', category: 'Language Specialists' },
  { name: 'laravel-specialist', value: 'laravel-specialist', description: 'Laravel Eloquent, Blade, queues, and artisan', category: 'Language Specialists' },
  { name: 'flutter-expert', value: 'flutter-expert', description: 'Flutter widgets, state management, and platform channels', category: 'Language Specialists' },
  { name: 'elixir-expert', value: 'elixir-expert', description: 'Elixir OTP, GenServer, and Phoenix LiveView', category: 'Language Specialists' },

  // ── Infrastructure ─────────────────────────────────────────────────────────
  { name: 'azure-infra-engineer', value: 'azure-infra-engineer', description: 'Azure services, ARM/Bicep templates, and cloud networking', category: 'Infrastructure' },
  { name: 'cloud-architect', value: 'cloud-architect', description: 'Multi-cloud architecture, cost optimization, and resilience', category: 'Infrastructure' },
  { name: 'database-administrator', value: 'database-administrator', description: 'Database provisioning, replication, and backup strategy', category: 'Infrastructure' },
  { name: 'deployment-engineer', value: 'deployment-engineer', description: 'Deployment strategies, blue-green, canary, and rollbacks', category: 'Infrastructure' },
  { name: 'devops-engineer', value: 'devops-engineer', description: 'CI/CD pipelines, infrastructure, and deployment', category: 'Infrastructure' },
  { name: 'docker-expert', value: 'docker-expert', description: 'Docker optimization, multi-stage builds, and security', category: 'Infrastructure' },
  { name: 'incident-responder', value: 'incident-responder', description: 'Incident triage, mitigation, and post-mortem coordination', category: 'Infrastructure' },
  { name: 'kubernetes-specialist', value: 'kubernetes-specialist', description: 'Kubernetes orchestration, Helm charts, and cluster ops', category: 'Infrastructure' },
  { name: 'network-engineer', value: 'network-engineer', description: 'Network topology, DNS, load balancing, and firewalls', category: 'Infrastructure' },
  { name: 'platform-engineer', value: 'platform-engineer', description: 'Internal developer platforms and self-service tooling', category: 'Infrastructure' },
  { name: 'security-engineer', value: 'security-engineer', description: 'Infrastructure security, IAM policies, and secrets management', category: 'Infrastructure' },
  { name: 'sre-engineer', value: 'sre-engineer', description: 'Site reliability, monitoring, and incident response', category: 'Infrastructure' },
  { name: 'terraform-engineer', value: 'terraform-engineer', description: 'Terraform modules, state management, and IaC workflows', category: 'Infrastructure' },

  // ── Quality & Security ─────────────────────────────────────────────────────
  { name: 'accessibility-tester', value: 'accessibility-tester', description: 'WCAG compliance and accessibility audit', category: 'Quality & Security' },
  { name: 'architect-reviewer', value: 'architect-reviewer', description: 'Architecture review and design pattern evaluation', category: 'Quality & Security' },
  { name: 'chaos-engineer', value: 'chaos-engineer', description: 'Failure mode analysis and resilience testing', category: 'Quality & Security' },
  { name: 'code-reviewer', value: 'code-reviewer', description: 'Code review with security and performance focus', category: 'Quality & Security' },
  { name: 'compliance-auditor', value: 'compliance-auditor', description: 'Regulatory compliance checks (GDPR, SOC2, HIPAA)', category: 'Quality & Security' },
  { name: 'debugger', value: 'debugger', description: 'Bug investigation and root cause analysis', category: 'Quality & Security' },
  { name: 'error-detective', value: 'error-detective', description: 'Error pattern analysis and root cause detection', category: 'Quality & Security' },
  { name: 'penetration-tester', value: 'penetration-tester', description: 'Offensive security testing and vulnerability exploitation', category: 'Quality & Security' },
  { name: 'performance-engineer', value: 'performance-engineer', description: 'Performance profiling and optimization guidance', category: 'Quality & Security' },
  { name: 'security-auditor', value: 'security-auditor', description: 'Security vulnerability scanning and threat modeling', category: 'Quality & Security' },
  { name: 'test-automator', value: 'test-automator', description: 'End-to-end test automation and CI test pipelines', category: 'Quality & Security' },

  // ── Data & AI ──────────────────────────────────────────────────────────────
  { name: 'ai-engineer', value: 'ai-engineer', description: 'AI system design, model integration, and inference pipelines', category: 'Data & AI' },
  { name: 'data-analyst', value: 'data-analyst', description: 'Data exploration, visualization, and statistical analysis', category: 'Data & AI' },
  { name: 'data-engineer', value: 'data-engineer', description: 'Data pipelines, ETL workflows, and warehouse design', category: 'Data & AI' },
  { name: 'data-scientist', value: 'data-scientist', description: 'Statistical modeling, experiments, and feature engineering', category: 'Data & AI' },
  { name: 'database-optimizer', value: 'database-optimizer', description: 'Query optimization, indexing, and schema design', category: 'Data & AI' },
  { name: 'llm-architect', value: 'llm-architect', description: 'LLM application architecture, RAG, and fine-tuning', category: 'Data & AI' },
  { name: 'machine-learning-engineer', value: 'machine-learning-engineer', description: 'ML model training, evaluation, and deployment', category: 'Data & AI' },
  { name: 'mlops-engineer', value: 'mlops-engineer', description: 'ML pipeline orchestration, model registry, and monitoring', category: 'Data & AI' },
  { name: 'nlp-engineer', value: 'nlp-engineer', description: 'Natural language processing, tokenization, and text analysis', category: 'Data & AI' },
  { name: 'postgres-pro', value: 'postgres-pro', description: 'PostgreSQL tuning, extensions, and advanced SQL', category: 'Data & AI' },
  { name: 'prompt-engineer', value: 'prompt-engineer', description: 'Prompt design, chain-of-thought, and LLM optimization', category: 'Data & AI' },
  { name: 'sql-pro', value: 'sql-pro', description: 'Advanced SQL queries, window functions, and optimization', category: 'Data & AI' },

  // ── Developer Experience ───────────────────────────────────────────────────
  { name: 'build-engineer', value: 'build-engineer', description: 'Build system configuration, caching, and optimization', category: 'Developer Experience' },
  { name: 'cli-developer', value: 'cli-developer', description: 'CLI tool design, argument parsing, and UX patterns', category: 'Developer Experience' },
  { name: 'dependency-manager', value: 'dependency-manager', description: 'Dependency updates, audit, and compatibility checks', category: 'Developer Experience' },
  { name: 'docs-writer', value: 'docs-writer', description: 'Technical documentation and API reference writing', category: 'Developer Experience' },
  { name: 'dx-optimizer', value: 'dx-optimizer', description: 'Developer experience improvement and workflow friction reduction', category: 'Developer Experience' },
  { name: 'git-workflow-manager', value: 'git-workflow-manager', description: 'Git workflow, branching strategy, and commit hygiene', category: 'Developer Experience' },
  { name: 'legacy-modernizer', value: 'legacy-modernizer', description: 'Legacy code modernization and migration planning', category: 'Developer Experience' },
  { name: 'mcp-developer', value: 'mcp-developer', description: 'MCP server development and tool integration', category: 'Developer Experience' },
  { name: 'refactorer', value: 'refactorer', description: 'Code refactoring with test verification', category: 'Developer Experience' },
  { name: 'test-writer', value: 'test-writer', description: 'Test generation following project patterns', category: 'Developer Experience' },
  { name: 'tooling-engineer', value: 'tooling-engineer', description: 'Developer tooling, linters, formatters, and IDE config', category: 'Developer Experience' },

  // ── Specialized Domains ────────────────────────────────────────────────────
  { name: 'blockchain-developer', value: 'blockchain-developer', description: 'Smart contracts, DeFi protocols, and chain integration', category: 'Specialized Domains' },
  { name: 'embedded-systems', value: 'embedded-systems', description: 'Firmware, RTOS, and hardware interface programming', category: 'Specialized Domains' },
  { name: 'fintech-engineer', value: 'fintech-engineer', description: 'Financial systems, ledgers, and regulatory compliance', category: 'Specialized Domains' },
  { name: 'game-developer', value: 'game-developer', description: 'Game engine integration, physics, and rendering pipelines', category: 'Specialized Domains' },
  { name: 'iot-engineer', value: 'iot-engineer', description: 'IoT protocols, edge computing, and device management', category: 'Specialized Domains' },
  { name: 'mobile-app-developer', value: 'mobile-app-developer', description: 'Mobile UI/UX, app lifecycle, and platform guidelines', category: 'Specialized Domains' },
  { name: 'payment-integration', value: 'payment-integration', description: 'Payment gateway integration, PCI compliance, and billing', category: 'Specialized Domains' },
  { name: 'seo-specialist', value: 'seo-specialist', description: 'Technical SEO, structured data, and web performance', category: 'Specialized Domains' },

  // ── Business & Product ─────────────────────────────────────────────────────
  { name: 'business-analyst', value: 'business-analyst', description: 'Requirements gathering, process modeling, and stakeholder analysis', category: 'Business & Product' },
  { name: 'content-marketer', value: 'content-marketer', description: 'Content strategy, copywriting, and brand messaging', category: 'Business & Product' },
  { name: 'legal-advisor', value: 'legal-advisor', description: 'Software licensing, ToS review, and IP guidance', category: 'Business & Product' },
  { name: 'product-manager', value: 'product-manager', description: 'Product roadmap, prioritization, and feature scoping', category: 'Business & Product' },
  { name: 'project-manager', value: 'project-manager', description: 'Project planning, timelines, and resource coordination', category: 'Business & Product' },
  { name: 'sales-engineer', value: 'sales-engineer', description: 'Technical demos, proof-of-concept, and solution design', category: 'Business & Product' },
  { name: 'scrum-master', value: 'scrum-master', description: 'Agile ceremonies, sprint planning, and team facilitation', category: 'Business & Product' },
  { name: 'technical-writer', value: 'technical-writer', description: 'User guides, tutorials, and knowledge base articles', category: 'Business & Product' },
  { name: 'ux-researcher', value: 'ux-researcher', description: 'User research, usability testing, and persona development', category: 'Business & Product' },

  // ── Meta & Orchestration ───────────────────────────────────────────────────
  { name: 'agent-organizer', value: 'agent-organizer', description: 'Agent selection, routing, and capability mapping', category: 'Meta & Orchestration' },
  { name: 'context-manager', value: 'context-manager', description: 'Project context loading and memory management', category: 'Meta & Orchestration' },
  { name: 'error-coordinator', value: 'error-coordinator', description: 'Cross-agent error handling and recovery strategies', category: 'Meta & Orchestration' },
  { name: 'knowledge-synthesizer', value: 'knowledge-synthesizer', description: 'Multi-source knowledge aggregation and summarization', category: 'Meta & Orchestration' },
  { name: 'multi-agent-coordinator', value: 'multi-agent-coordinator', description: 'Parallel agent execution and result merging', category: 'Meta & Orchestration' },
  { name: 'task-distributor', value: 'task-distributor', description: 'Task decomposition and delegation across agents', category: 'Meta & Orchestration' },
  { name: 'workflow-orchestrator', value: 'workflow-orchestrator', description: 'Multi-agent task orchestration and workflow coordination', category: 'Meta & Orchestration' },

  // ── Research & Analysis ────────────────────────────────────────────────────
  { name: 'competitive-analyst', value: 'competitive-analyst', description: 'Competitive landscape analysis and feature benchmarking', category: 'Research & Analysis' },
  { name: 'data-researcher', value: 'data-researcher', description: 'Data source discovery, collection, and quality assessment', category: 'Research & Analysis' },
  { name: 'market-researcher', value: 'market-researcher', description: 'Market sizing, trends analysis, and opportunity mapping', category: 'Research & Analysis' },
  { name: 'research-analyst', value: 'research-analyst', description: 'Technical research synthesis and recommendation reports', category: 'Research & Analysis' },
  { name: 'scientific-literature-researcher', value: 'scientific-literature-researcher', description: 'Academic paper search, citation analysis, and review', category: 'Research & Analysis' },
  { name: 'search-specialist', value: 'search-specialist', description: 'Search engine optimization and information retrieval', category: 'Research & Analysis' },
  { name: 'trend-analyst', value: 'trend-analyst', description: 'Technology trend tracking and adoption forecasting', category: 'Research & Analysis' },
];

export const DEFAULT_AGENTS = new Set([
  'code-reviewer',
  'test-writer',
  'devops-engineer',
  'dependency-manager',
  'git-workflow-manager',
]);

// Map languages to recommended agents
// Each language suggests agents that are specifically useful for that ecosystem
export const LANGUAGE_AGENT_MAP = {
  // ── Web / Frontend ────────────────────────────────────────────────────────
  'node':       ['typescript-pro', 'javascript-pro', 'react-specialist', 'nextjs-developer', 'vue-expert', 'angular-architect', 'frontend-developer', 'fullstack-developer', 'backend-developer', 'build-engineer', 'websocket-engineer'],
  // ── Backend Languages ─────────────────────────────────────────────────────
  'python':     ['python-pro', 'django-developer', 'fastapi-developer', 'backend-developer', 'data-engineer', 'data-scientist', 'ai-engineer', 'machine-learning-engineer', 'prompt-engineer'],
  'java':       ['java-architect', 'spring-boot-engineer', 'kotlin-specialist', 'backend-developer', 'microservices-architect', 'database-administrator'],
  'kotlin':     ['kotlin-specialist', 'java-architect', 'spring-boot-engineer', 'mobile-developer', 'backend-developer'],
  'go':         ['golang-pro', 'backend-developer', 'microservices-architect', 'cli-developer', 'network-engineer'],
  'rust':       ['rust-engineer', 'backend-developer', 'embedded-systems', 'cli-developer', 'performance-engineer'],
  'ruby':       ['ruby-pro', 'backend-developer', 'fullstack-developer'],
  'php':        ['php-pro', 'laravel-specialist', 'backend-developer', 'fullstack-developer'],
  'csharp':     ['csharp-developer', 'backend-developer', 'azure-infra-engineer'],
  'scala':      ['java-architect', 'data-engineer', 'backend-developer'],
  'elixir':     ['elixir-expert', 'backend-developer', 'websocket-engineer'],
  // ── Mobile ────────────────────────────────────────────────────────────────
  'swift':      ['swift-expert', 'mobile-app-developer', 'mobile-developer'],
  'dart':       ['flutter-expert', 'mobile-app-developer', 'mobile-developer'],
  // ── Systems ───────────────────────────────────────────────────────────────
  'cpp':        ['cpp-pro', 'embedded-systems', 'performance-engineer', 'game-developer'],
  'c':          ['cpp-pro', 'embedded-systems', 'performance-engineer'],
  'zig':        ['rust-engineer', 'embedded-systems', 'performance-engineer'],
  // ── Infrastructure / IaC ──────────────────────────────────────────────────
  'terraform':  ['terraform-engineer', 'cloud-architect', 'platform-engineer', 'security-engineer', 'sre-engineer', 'deployment-engineer'],
  'ansible':    ['cloud-architect', 'platform-engineer', 'security-engineer', 'sre-engineer', 'deployment-engineer', 'network-engineer'],
  'cloudformation': ['cloud-architect', 'platform-engineer', 'security-engineer', 'azure-infra-engineer'],
  'bicep':      ['azure-infra-engineer', 'cloud-architect', 'platform-engineer', 'security-engineer'],
  'pulumi':     ['cloud-architect', 'platform-engineer', 'deployment-engineer'],
  // ── Containers / Orchestration ────────────────────────────────────────────
  'kubernetes': ['kubernetes-specialist', 'docker-expert', 'platform-engineer', 'sre-engineer', 'network-engineer', 'incident-responder', 'deployment-engineer'],
  'docker':     ['docker-expert', 'devops-engineer', 'platform-engineer', 'sre-engineer', 'deployment-engineer'],
  // ── Data / Contracts ──────────────────────────────────────────────────────
  'sql':        ['sql-pro', 'postgres-pro', 'database-optimizer', 'database-administrator', 'data-engineer', 'data-analyst'],
  'graphql':    ['graphql-architect', 'api-designer', 'fullstack-developer'],
  'protobuf':   ['api-designer', 'microservices-architect', 'backend-developer'],
  // ── Web3 ──────────────────────────────────────────────────────────────────
  'solidity':   ['blockchain-developer', 'security-auditor', 'fintech-engineer'],
  // ── Scripting / Docs ──────────────────────────────────────────────────────
  'shell':      ['devops-engineer', 'cli-developer', 'sre-engineer', 'platform-engineer'],
  'markdown':   ['docs-writer', 'technical-writer'],
};

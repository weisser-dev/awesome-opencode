// ─── Skill Data ─────────────────────────────────────────────────────────────

export const AVAILABLE_SKILLS = [
  // Existing
  { name: 'git-release',          value: 'git-release',          description: 'Release notes and version bumps' },
  { name: 'pr-review',            value: 'pr-review',            description: 'Structured PR review checklist' },
  { name: 'migration',            value: 'migration',            description: 'Database/framework migration planning' },
  { name: 'test-patterns',        value: 'test-patterns',        description: 'Test generation following project conventions' },
  { name: 'deploy',               value: 'deploy',               description: 'CI/CD pipeline and deployment setup' },
  // New
  { name: 'dependency-audit',     value: 'dependency-audit',     description: 'Audit dependencies for vulnerabilities and license issues' },
  { name: 'incident-postmortem',  value: 'incident-postmortem',  description: 'Structured incident postmortem report generation' },
  { name: 'docker-optimize',      value: 'docker-optimize',      description: 'Dockerfile and image size optimization' },
  { name: 'adr-write',            value: 'adr-write',            description: 'Architecture Decision Record (ADR) authoring' },
  { name: 'api-contract',         value: 'api-contract',         description: 'OpenAPI/Swagger contract generation and validation' },
  { name: 'changelog-generate',   value: 'changelog-generate',   description: 'Changelog generation from commit history' },
  { name: 'ci-pipeline',          value: 'ci-pipeline',          description: 'CI pipeline configuration and optimization' },
  { name: 'env-setup',            value: 'env-setup',            description: 'Development environment setup and onboarding' },
  { name: 'error-triage',         value: 'error-triage',         description: 'Error log triage and prioritization' },
  { name: 'performance-profile',  value: 'performance-profile',  description: 'Performance profiling and bottleneck identification' },
];

export const DEFAULT_SKILLS = new Set([
  'git-release',
  'test-patterns',
  'ci-pipeline',
  'dependency-audit',
  'changelog-generate',
]);

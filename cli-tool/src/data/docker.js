// ─── Docker Dev Environment Images ──────────────────────────────────────────
// All base images are official Docker Hub or official vendor images.
// install: shell command that installs opencode-ai and runs opencode inside container.
//
// Node/npm install pattern:    npm i -g opencode-ai && opencode
// Bun install pattern:         bun add -g opencode-ai && opencode
// Alpine install pattern:      apk add --no-cache nodejs npm && npm i -g opencode-ai && opencode
// Debian-based non-node image: apt-get update -qq && apt-get install -y -qq nodejs npm > /dev/null && npm i -g opencode-ai && opencode

const APT_NODE = 'apt-get update -qq && apt-get install -y -qq nodejs npm > /dev/null 2>&1 && npm i -g opencode-ai && opencode';
const APK_NODE = 'apk add --no-cache nodejs npm && npm i -g opencode-ai && opencode';

export const DEV_ENVIRONMENTS = [
  // ── JavaScript / TypeScript ────────────────────────────────────────────────
  {
    id: 'node',
    image: 'node:22',
    label: 'Node.js 22 (JavaScript, TypeScript)',
    install: 'npm i -g opencode-ai && opencode',
    languages: ['node'],
    packageManager: 'npm',
  },
  {
    id: 'node-bun',
    image: 'oven/bun:latest',
    label: 'Bun (JavaScript, TypeScript — fast runtime)',
    install: 'bun add -g opencode-ai && opencode',
    languages: ['node'],
    packageManager: 'bun',
  },
  // ── Python ─────────────────────────────────────────────────────────────────
  {
    id: 'python',
    image: 'python:3.13-slim',
    label: 'Python 3.13 (pip)',
    install: 'pip install --break-system-packages nodeenv && nodeenv -p && npm i -g opencode-ai && opencode',
    languages: ['python'],
    packageManager: 'pip',
  },
  {
    id: 'python-uv',
    image: 'ghcr.io/astral-sh/uv:python3.13-bookworm-slim',
    label: 'Python 3.13 + uv (fast package manager)',
    install: APT_NODE,
    languages: ['python'],
    packageManager: 'uv',
  },
  // ── Java / JVM ─────────────────────────────────────────────────────────────
  {
    id: 'java-maven',
    image: 'maven:3-eclipse-temurin-21',
    label: 'Java 21 + Maven (Spring Boot, enterprise)',
    install: APT_NODE,
    languages: ['java', 'kotlin', 'scala'],
    packageManager: 'maven',
  },
  {
    id: 'java-gradle',
    image: 'gradle:8-jdk21',
    label: 'Java 21 + Gradle',
    install: APT_NODE,
    languages: ['java', 'kotlin'],
    packageManager: 'gradle',
  },
  {
    id: 'kotlin',
    image: 'openjdk:21-slim-bookworm',
    label: 'Kotlin / OpenJDK 21 (install Kotlin via sdkman)',
    install: 'apt-get update -qq && apt-get install -y -qq curl zip nodejs npm > /dev/null 2>&1 && curl -s "https://get.sdkman.io" | bash > /dev/null 2>&1 && bash -c "source $HOME/.sdkman/bin/sdkman-init.sh && sdk install kotlin" > /dev/null 2>&1 && npm i -g opencode-ai && opencode',
    languages: ['kotlin'],
    packageManager: 'gradle',
  },
  // ── Go ─────────────────────────────────────────────────────────────────────
  {
    id: 'go',
    image: 'golang:1.24',
    label: 'Go 1.24',
    install: APT_NODE,
    languages: ['go'],
    packageManager: 'go',
  },
  // ── Rust ───────────────────────────────────────────────────────────────────
  {
    id: 'rust',
    image: 'rust:1-slim-bookworm',
    label: 'Rust (cargo, rustc)',
    install: APT_NODE,
    languages: ['rust'],
    packageManager: 'cargo',
  },
  // ── Ruby ───────────────────────────────────────────────────────────────────
  {
    id: 'ruby',
    image: 'ruby:3.3-slim',
    label: 'Ruby 3.3 (gems, bundler)',
    install: APT_NODE,
    languages: ['ruby'],
    packageManager: 'bundler',
  },
  // ── PHP ────────────────────────────────────────────────────────────────────
  {
    id: 'php',
    image: 'php:8.4-cli',
    label: 'PHP 8.4 + Composer',
    install: APT_NODE,
    languages: ['php'],
    packageManager: 'composer',
  },
  // ── .NET ───────────────────────────────────────────────────────────────────
  {
    id: 'dotnet',
    image: 'mcr.microsoft.com/dotnet/sdk:9.0',
    label: '.NET 9 SDK (C#, F#)',
    install: APT_NODE,
    languages: ['csharp'],
    packageManager: 'dotnet',
  },
  // ── Swift ──────────────────────────────────────────────────────────────────
  {
    id: 'swift',
    image: 'swift:6.1',
    label: 'Swift 6.1 (official)',
    install: APT_NODE,
    languages: ['swift'],
    packageManager: 'swift',
  },
  // ── Dart / Flutter ─────────────────────────────────────────────────────────
  {
    id: 'dart',
    image: 'dart:3.7',
    label: 'Dart 3.7 (pub, dart2native)',
    install: APT_NODE,
    languages: ['dart'],
    packageManager: 'pub',
  },
  // ── Elixir / Erlang ────────────────────────────────────────────────────────
  {
    id: 'elixir',
    image: 'elixir:1.18-slim',
    label: 'Elixir 1.18 + Erlang/OTP',
    install: APT_NODE,
    languages: ['elixir'],
    packageManager: 'mix',
  },
  // ── C / C++ ────────────────────────────────────────────────────────────────
  {
    id: 'cpp',
    image: 'gcc:14',
    label: 'GCC 14 (C, C++, cmake)',
    install: APT_NODE,
    languages: ['c', 'cpp'],
    packageManager: 'make',
  },
  // ── IaC ────────────────────────────────────────────────────────────────────
  {
    id: 'terraform',
    image: 'hashicorp/terraform:latest',
    label: 'Terraform (IaC) — Alpine-based',
    install: APK_NODE,
    languages: ['terraform'],
    packageManager: 'terraform',
  },
  {
    id: 'ansible',
    image: 'cytopia/ansible:latest',
    label: 'Ansible (IaC automation)',
    install: APK_NODE,
    languages: ['ansible'],
    packageManager: 'ansible',
  },
  // ── General purpose ────────────────────────────────────────────────────────
  // Use this when you need apt to install custom tools,
  // or for multi-language projects without a specific image.
  {
    id: 'ubuntu',
    image: 'ubuntu:24.04',
    label: 'Ubuntu 24.04 (apt available — install anything)',
    install: 'apt-get update -qq && apt-get install -y -qq nodejs npm curl wget > /dev/null 2>&1 && npm i -g opencode-ai && opencode',
    languages: ['*'],
    packageManager: 'apt',
    isGeneral: true,
  },
  {
    id: 'generic',
    image: 'node:22',
    label: 'Generic Node.js 22 (works for any project)',
    install: 'npm i -g opencode-ai && opencode',
    languages: ['*'],
    packageManager: 'npm',
    isGeneral: true,
  },
];

// ─── Proxy & Artifact Registry Configs ──────────────────────────────────────
// Additional environment variables for corporate proxy and artifact registries.
// These are offered as optional extras during sandbox setup.

export const PROXY_CONFIGS = [
  {
    id: 'http-proxy',
    label: 'HTTP/HTTPS Corporate Proxy',
    description: 'Route all traffic through a corporate proxy',
    envVars: [
      { key: 'HTTP_PROXY',  description: 'HTTP proxy URL (e.g. http://proxy.company.com:3128)',  required: true },
      { key: 'HTTPS_PROXY', description: 'HTTPS proxy URL (same as HTTP_PROXY if same endpoint)', required: false },
      { key: 'NO_PROXY',    description: 'Comma-separated hosts to bypass proxy (e.g. localhost,127.0.0.1,.company.com)', required: false },
    ],
  },
];

export const ARTIFACT_REGISTRY_CONFIGS = [
  {
    id: 'nexus-npm',
    label: 'Nexus Repository (npm)',
    description: 'Use internal Nexus for npm packages',
    envVars: [
      { key: 'NPM_REGISTRY', description: 'npm registry URL (e.g. https://nexus.company.com/repository/npm-public/)', required: true },
      { key: 'NPM_TOKEN',    description: 'npm auth token for Nexus',  required: false },
    ],
    // Extra command injected before install to configure npm
    preInstall: 'npm config set registry "$NPM_REGISTRY"',
  },
  {
    id: 'nexus-maven',
    label: 'Nexus Repository (Maven)',
    description: 'Use internal Nexus for Maven artifacts',
    envVars: [
      { key: 'MAVEN_MIRROR_URL', description: 'Maven mirror URL (e.g. https://nexus.company.com/repository/maven-public/)', required: true },
      { key: 'MAVEN_USERNAME',   description: 'Nexus username',    required: false },
      { key: 'MAVEN_PASSWORD',   description: 'Nexus password',    required: false, secret: true },
    ],
    // Settings injected as MAVEN_OPTS
    preInstall: 'mkdir -p ~/.m2 && echo "<settings><mirrors><mirror><id>nexus</id><mirrorOf>*</mirrorOf><url>$MAVEN_MIRROR_URL</url></mirror></mirrors></settings>" > ~/.m2/settings.xml',
  },
  {
    id: 'jfrog-npm',
    label: 'JFrog Artifactory (npm)',
    description: 'Use internal JFrog for npm packages',
    envVars: [
      { key: 'JFROG_URL',   description: 'JFrog URL (e.g. https://company.jfrog.io/artifactory/api/npm/npm/)', required: true },
      { key: 'JFROG_TOKEN', description: 'JFrog API token', required: true, secret: true },
    ],
    preInstall: 'npm config set registry "$JFROG_URL" && npm config set //${JFROG_URL#https://}:_authToken="$JFROG_TOKEN"',
  },
  {
    id: 'jfrog-maven',
    label: 'JFrog Artifactory (Maven)',
    description: 'Use internal JFrog for Maven artifacts',
    envVars: [
      { key: 'JFROG_MAVEN_URL',   description: 'JFrog Maven repo URL', required: true },
      { key: 'JFROG_USERNAME',    description: 'JFrog username',        required: false },
      { key: 'JFROG_PASSWORD',    description: 'JFrog password/token',  required: false, secret: true },
    ],
    preInstall: 'mkdir -p ~/.m2 && echo "<settings><mirrors><mirror><id>jfrog</id><mirrorOf>*</mirrorOf><url>$JFROG_MAVEN_URL</url></mirror></mirrors><servers><server><id>jfrog</id><username>$JFROG_USERNAME</username><password>$JFROG_PASSWORD</password></server></servers></settings>" > ~/.m2/settings.xml',
  },
  {
    id: 'pypi-mirror',
    label: 'PyPI Mirror (pip/uv)',
    description: 'Use internal PyPI mirror (Nexus, Artifactory, devpi)',
    envVars: [
      { key: 'PIP_INDEX_URL',      description: 'PyPI mirror index URL (e.g. https://nexus.company.com/repository/pypi/simple/)', required: true },
      { key: 'PIP_TRUSTED_HOST',   description: 'Trusted host for pip (hostname only)', required: false },
      { key: 'UV_INDEX_URL',       description: 'uv index URL (same as PIP_INDEX_URL if using uv)', required: false },
    ],
    preInstall: '',
  },
];

// ─── Provider environment variables ─────────────────────────────────────────

export const PROVIDER_ENV_CONFIGS = [
  {
    name: 'Anthropic (Direct API)',
    value: 'anthropic',
    envVars: [
      { key: 'ANTHROPIC_API_KEY', description: 'Anthropic API key', secret: true, required: true },
    ],
  },
  {
    name: 'OpenAI (Direct API)',
    value: 'openai',
    envVars: [
      { key: 'OPENAI_API_KEY', description: 'OpenAI API key', secret: true, required: true },
    ],
  },
  {
    name: 'AWS Bedrock',
    value: 'bedrock',
    envVars: [
      { key: 'AWS_BEARER_TOKEN_BEDROCK', description: 'AWS Bedrock bearer token', secret: true, required: false },
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key ID', secret: true, required: false },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret access key', secret: true, required: false },
      { key: 'AWS_SESSION_TOKEN', description: 'AWS session token (if using temporary credentials)', secret: true, required: false },
      { key: 'AWS_REGION', description: 'AWS region (e.g. eu-central-1, us-east-1)', secret: false, required: true },
      { key: 'AWS_PROFILE', description: 'AWS profile name (if using profiles)', secret: false, required: false },
    ],
  },
  {
    name: 'Azure OpenAI',
    value: 'azure',
    envVars: [
      { key: 'AZURE_OPENAI_API_KEY', description: 'Azure OpenAI API key', secret: true, required: true },
      { key: 'AZURE_OPENAI_ENDPOINT', description: 'Azure endpoint URL', secret: false, required: true },
      { key: 'AZURE_OPENAI_API_VERSION', description: 'API version (e.g. 2024-02-15-preview)', secret: false, required: false },
    ],
  },
  {
    name: 'Google AI / Vertex AI',
    value: 'google',
    envVars: [
      { key: 'GOOGLE_API_KEY', description: 'Google AI API key', secret: true, required: false },
      { key: 'GOOGLE_PROJECT_ID', description: 'GCP project ID (for Vertex AI)', secret: false, required: false },
      { key: 'GOOGLE_REGION', description: 'GCP region (for Vertex AI)', secret: false, required: false },
    ],
  },
  {
    name: 'OpenRouter',
    value: 'openrouter',
    envVars: [
      { key: 'OPENROUTER_API_KEY', description: 'OpenRouter API key', secret: true, required: true },
    ],
  },
  {
    name: 'Custom / Self-hosted',
    value: 'custom',
    envVars: [],
  },
];

/**
 * Given project languages, return matching dev environments sorted by relevance.
 */
export function getRecommendedEnvironments(projectLanguages) {
  const langs = new Set(projectLanguages || []);
  const matched = [];
  const rest = [];

  for (const env of DEV_ENVIRONMENTS) {
    if (env.isGeneral) continue;
    const isMatch = env.languages.some(l => langs.has(l));
    if (isMatch) {
      matched.push(env);
    } else {
      rest.push(env);
    }
  }

  const generals = DEV_ENVIRONMENTS.filter(e => e.isGeneral);
  return { matched, rest, generals };
}

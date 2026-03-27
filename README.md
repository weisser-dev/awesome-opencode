# OpenCode Best Practices

Best Practices, Templates und ein CLI-Tool fuer [OpenCode](https://opencode.ai) -- den Open-Source AI Coding Agent.

## Schnellstart

```bash
# In deinem bestehenden Projekt:
npx @weisser-dev/opencode-advanced
```

Das CLI-Tool analysiert dein Projekt, fragt interaktiv nach gewuenschten Agents, Skills und Modell-Strategie, erstellt alles automatisch -- und startet danach OpenCode.

Beim erneuten Aufruf erkennt es die bestehende Konfiguration und bietet an, direkt OpenCode zu starten oder die Konfiguration anzupassen.

### Beispiel-Output

```
  OpenCode Advanced Setup
  Best practices for agents, skills, models & more
  https://github.com/weisser-dev/opencode-best-practices

✔ Project analyzed

  Could not auto-detect language/framework.
  Found files suggesting:
    - IaC (Terraform) (38 files)
    - Documentation (5 files)
    - Shell Scripts (3 files)
    - Containers (Docker) (1 file)
    - Python (1 file)

✔ Select your project language/type: Terraform (IaC) (38 files found)

  Selected: Terraform (IaC)
  Existing config: yes

✔ Install custom agents (subagents)? Yes
✔ Select agents to install:
    code-reviewer - Code review with security & performance focus,
    test-writer - Test generation following project patterns
✔ Install skills (SKILL.md)? Yes
✔ Select skills to install:
    git-release - Release notes and version bumps,
    test-patterns - Test generation following project conventions
✔ Model strategy: Mixed (Best of each provider)
✔ Configure MCP servers? No
✔ Files generated

  Generated:
    .opencode/agents/ (2 agents)
      - code-reviewer.md
      - test-writer.md
    .opencode/skills/ (2 skills)
      - git-release/SKILL.md
      - test-patterns/SKILL.md
    opencode.json (updated)
    .opencode/advanced.json (state)

✔ No AGENTS.md found. Generate one with project-specific rules? Yes
    AGENTS.md (generated)

  Setup complete!

? Start OpenCode now? Yes

  Starting OpenCode...
```

Beim **zweiten Aufruf**:

```
  OpenCode Advanced Setup
  Best practices for agents, skills, models & more
  https://github.com/weisser-dev/opencode-best-practices

  Already configured!
  Last setup: 2026-03-27
  Agents:     code-reviewer, test-writer
  Skills:     git-release, test-patterns
  Models:     mixed

? What would you like to do?
❯ Start OpenCode
  Reconfigure (run setup again)
  Exit
```

## Inhalt

### Dokumentation

| Dokument | Beschreibung |
|----------|-------------|
| [Agents](docs/01-agents.md) | Primary & Sub-Agents, Built-in vs. Custom, Markdown-Definitionen, Permissions |
| [Skills](docs/02-skills.md) | SKILL.md Struktur, Beispiele, Discovery-Mechanismus |
| [MCP Servers](docs/03-mcp-servers.md) | Lokale & Remote Server, OAuth, empfohlene Server |
| [Modelle](docs/04-models.md) | Modell-Empfehlungen pro Task, Token-Optimierung, Kosten |
| [Rules](docs/05-rules.md) | AGENTS.md, Custom Instructions, Projekt-Konventionen |
| [Tools & Custom Tools](docs/06-tools-and-custom-tools.md) | Built-in Tools, eigene Tools erstellen |
| [Permissions](docs/07-permissions.md) | Granulare Berechtigungen, Wildcards, Per-Agent Config |

### Fertige Templates

**23 Agents** in 7 Kategorien, **15 Skills**, **5 Config-Presets**.

<details>
<summary>Alle Agents anzeigen</summary>

| Kategorie | Agent | Beschreibung |
|-----------|-------|-------------|
| **Core** | `code-reviewer` | Code review mit Security & Performance Fokus |
| | `docs-writer` | Technische Dokumentation |
| | `security-auditor` | Security Vulnerability Scanner |
| | `debugger` | Bug Investigation & Root Cause Analysis |
| | `refactorer` | Code Refactoring mit Test-Verifikation |
| | `test-writer` | Test-Generierung nach Projekt-Patterns |
| **Development** | `api-designer` | REST/GraphQL API Design & Schema-First |
| | `microservices-architect` | Distributed Systems & Service-Decomposition |
| | `architect-reviewer` | Architektur-Review & ADR-Erstellung |
| **Quality** | `performance-engineer` | Performance-Profiling & Optimierung |
| | `accessibility-tester` | WCAG 2.1 Compliance & Inclusive Design |
| | `compliance-auditor` | GDPR, SOC2, HIPAA & OSS-Lizenz Audit |
| | `chaos-engineer` | Resilience Testing & Failure Injection |
| **Infrastructure** | `devops-engineer` | CI/CD Pipelines & Build-Automation |
| | `docker-expert` | Dockerfile-Optimierung & Container Security |
| | `sre-engineer` | SLI/SLO, Observability & Incident Response |
| **Data** | `database-optimizer` | Schema, Query & Index-Optimierung |
| **Productivity** | `dependency-manager` | Dependency-Audit, CVEs & License-Checks |
| | `git-workflow-manager` | Branching-Strategie & Commit-Hygiene |
| | `legacy-modernizer` | Inkrementelle Legacy-Modernisierung |
| | `error-detective` | Systemische Error-Pattern-Analyse |
| **Orchestration** | `context-manager` | Token-Optimierung & Context-Management |
| | `workflow-orchestrator` | Multi-Agent Task-Decomposition & Delegation |

</details>

<details>
<summary>Alle Skills anzeigen</summary>

| Skill | Beschreibung |
|-------|-------------|
| `git-release` | Release Notes & Semantic Version Bumps |
| `pr-review` | Strukturierte PR-Review Checkliste |
| `migration` | Datenbank/Framework-Migration mit Rollback |
| `test-patterns` | Test-Generierung nach Projekt-Konventionen |
| `deploy` | CI/CD Pipeline & Deployment Setup |
| `dependency-audit` | CVE-Scan, License-Check, Unused Dependencies |
| `incident-postmortem` | Blameless Postmortem mit 5 Whys |
| `docker-optimize` | Dockerfile Multi-Stage & Security Hardening |
| `adr-write` | Architecture Decision Records (Nygard Template) |
| `api-contract` | OpenAPI/AsyncAPI Spec-Generierung & Validierung |
| `changelog-generate` | CHANGELOG.md aus Git History (Keep a Changelog) |
| `ci-pipeline` | CI/CD Config-Generierung (GitHub Actions, GitLab CI) |
| `env-setup` | Developer Environment Bootstrap & Getting Started |
| `error-triage` | Stack Trace Parsing & Root Cause Classification |
| `performance-profile` | Performance-Hotspot Analyse & Optimization Plan |

</details>

### CLI-Tool

```
cli-tool/           # @weisser-dev/opencode-advanced
  src/
    index.js        # Einstiegspunkt
    setup.js        # Projekt-Analyse, Prompts, Generierung
  templates/        # Bundled templates (fuer npm)
  package.json
```

## CLI-Tool: opencode-advanced

### Was es macht

1. **Analysiert dein Projekt**: Erkennt Sprache (Node/Java/Python/Go/Rust), Framework, bestehende `opencode.json`
2. **Fragt interaktiv**:
   - Welche Agents installieren? (Code Reviewer, Docs Writer, Security Auditor, etc.)
   - Welche Skills installieren? (Git Release, PR Review, Migration, etc.)
   - Modell-Strategie? (Cost Optimized, Quality Focused, OpenAI, Mixed)
   - MCP Server konfigurieren? (Context7, Grep, Sentry)
3. **Generiert**:
   - `.opencode/agents/*.md` -- Agent-Definitionen
   - `.opencode/skills/*/SKILL.md` -- Skill-Dateien
   - `opencode.json` -- Aktualisierte Konfiguration mit Modell-Optimierungen
4. **Startet OpenCode** (optional, wenn installiert)

### Installation & Nutzung

```bash
# Via npx (empfohlen) -- einmal ausfuehren, fertig
npx @weisser-dev/opencode-advanced

# Oder global installieren
npm install -g @weisser-dev/opencode-advanced

# Dann einfach:
opencode-advanced
```

### Lokales Testen (Entwicklung)

```bash
# 1. Repository klonen
git clone https://github.com/weisser-dev/opencode-best-practices
cd opencode-best-practices/cli-tool

# 2. Dependencies installieren
npm install

# 3. Global verlinken
npm link

# 4. In einem beliebigen Projekt testen:
cd ~/mein-projekt
opencode-advanced
```

Aenderungen am Code wirken sofort (Symlink). Zum Aufraumen: `npm unlink -g @weisser-dev/opencode-advanced`

### Modell-Strategien

| Strategie | Build Agent | Plan/Explore | Beschreibung |
|-----------|------------|-------------|-------------|
| **Cost Optimized** | Sonnet 4.5 | Haiku 4.5 | Bestes Preis-Leistungs-Verhaeltnis |
| **Quality Focused** | Opus 4.5 | Sonnet 4.5 | Maximale Code-Qualitaet |
| **OpenAI** | GPT 5.2 | GPT 5.1 Codex | OpenAI-only Stack |
| **Mixed** | Sonnet 4.5 | Haiku 4.5 | Best of each Provider |

### npm Publish

```bash
cd cli-tool

# Templates aus Repo-Root synchronisieren
npm run prepublishOnly

# Pruefen was published wird
npm pack --dry-run

# Veroeffentlichen (erfordert npm login + Org-Zugang)
npm publish
```

## Manuelles Setup (ohne CLI)

### 1. Agents kopieren

```bash
mkdir -p .opencode/agents
cp templates/agents/code-reviewer.md .opencode/agents/
cp templates/agents/test-writer.md .opencode/agents/
```

### 2. Skills kopieren

```bash
mkdir -p .opencode/skills/git-release
cp templates/skills/git-release/SKILL.md .opencode/skills/git-release/
```

### 3. Config kopieren

```bash
cp templates/configs/cost-optimized.json opencode.json
```

### 4. AGENTS.md erstellen

```bash
opencode
# Dann im TUI: /init
```

## Inspiration & Credits

Die Agent- und Skill-Sammlung wurde inspiriert von [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) (127+ Claude Code Subagents) und fuer OpenCode adaptiert -- mit OpenCode-spezifischen Permissions, Skill-Integration und Markdown-Agent-Format.

Weitere Inspirationsquellen:
- [darrenhinde/OpenAgentsControl](https://github.com/darrenhinde/OpenAgentsControl) -- Agent Configs & Workflows
- [OpenCode Official Docs](https://opencode.ai/docs/) -- Agents, Skills, MCP, Permissions

## Ressourcen

- [OpenCode Docs](https://opencode.ai/docs/)
- [OpenCode GitHub](https://github.com/anomalyco/opencode)
- [OpenCode Discord](https://opencode.ai/discord)
- [Awesome OpenCode](https://github.com/awesome-opencode/awesome-opencode)
- [OpenCode Ecosystem](https://opencode.ai/docs/ecosystem/)
- [MCP Server Directory](https://mcp.so)
- [opencode-agents (Darren Hinde)](https://github.com/darrenhinde/opencode-agents)

## Lizenz

MIT

## Beitragen

Pull Requests willkommen! Besonders fuer:
- Neue Agent-Templates
- Neue Skill-Definitionen
- Framework-spezifische Configs
- CLI-Tool Verbesserungen

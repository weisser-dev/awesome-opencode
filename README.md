# OpenCode Best Practices

Best Practices, Templates und ein CLI-Tool fuer [OpenCode](https://opencode.ai) -- den Open-Source AI Coding Agent.

## Schnellstart

```bash
# In deinem bestehenden Projekt:
npx opencode-advanced-setup
```

Das CLI-Tool analysiert dein Projekt, fragt interaktiv nach gewuenschten Agents, Skills und Modell-Strategie und erstellt alles automatisch.

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

```
templates/
  agents/           # Einsatzbereite Agent-Definitionen (.md)
    code-reviewer.md
    docs-writer.md
    security-auditor.md
    debugger.md
    refactorer.md
    test-writer.md
  skills/           # Einsatzbereite SKILL.md Dateien
    git-release/
    pr-review/
    migration/
    test-patterns/
    deploy/
  configs/          # opencode.json Vorlagen
    cost-optimized.json
    node-typescript.json
    java-spring.json
    python.json
    security-focused.json
```

### CLI-Tool

```
cli-tool/           # opencode-advanced-setup
  src/
    index.js        # Einstiegspunkt
    setup.js        # Projekt-Analyse, Prompts, Generierung
  package.json
```

## CLI-Tool: opencode-advanced-setup

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

### Installation

```bash
# Via npx (empfohlen)
npx opencode-advanced-setup

# Oder global installieren
npm install -g opencode-advanced-setup
```

### Modell-Strategien

| Strategie | Build Agent | Plan/Explore | Beschreibung |
|-----------|------------|-------------|-------------|
| **Cost Optimized** | Sonnet 4.5 | Haiku 4.5 | Bestes Preis-Leistungs-Verhaeltnis |
| **Quality Focused** | Opus 4.5 | Sonnet 4.5 | Maximale Code-Qualitaet |
| **OpenAI** | GPT 5.2 | GPT 5.1 Codex | OpenAI-only Stack |
| **Mixed** | Sonnet 4.5 | Haiku 4.5 | Best of each Provider |

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

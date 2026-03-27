# Rules (AGENTS.md) in OpenCode

Rules sind projekt- und user-spezifische Anweisungen, die OpenCode im Kontext des LLMs mitgibt. Sie werden ueber `AGENTS.md` Dateien oder die `instructions` Konfiguration definiert.

> **Offizielle Docs:** [opencode.ai/docs/rules](https://opencode.ai/docs/rules/)

---

## AGENTS.md erstellen

### Automatisch

```bash
opencode
# Dann im TUI:
/init
```

Scannt das Projekt und generiert eine passende `AGENTS.md`.

### Manuell

Erstelle eine `AGENTS.md` im Projekt-Root:

```markdown
# My Project

This is a TypeScript monorepo using bun workspaces.

## Project Structure
- `packages/` - Workspace packages (functions, core, web)
- `infra/` - Infrastructure definitions
- `sst.config.ts` - Main configuration

## Code Standards
- Use TypeScript with strict mode
- Shared code goes in `packages/core/`
- Import via workspace names: `@my-app/core/example`

## Testing
- Use vitest for unit tests
- Run `bun test` for full suite
- Minimum 80% coverage

## Conventions
- Conventional commits (feat:, fix:, chore:)
- PR reviews required before merge
```

---

## Dateitypen und Orte

### Projekt-spezifisch

`AGENTS.md` im Projekt-Root. Wird ins Git committed und mit dem Team geteilt.

### Global (persoenlich)

`~/.config/opencode/AGENTS.md` -- gilt fuer alle OpenCode-Sessions.

**Empfehlung:** Persoenliche Praeferenzen hierhin (z.B. Sprache, Code-Style, bevorzugte Patterns).

### Claude Code Kompatibilitaet

Als Fallback werden auch unterstuetzt:
- `CLAUDE.md` (wenn keine `AGENTS.md` vorhanden)
- `~/.claude/CLAUDE.md` (wenn keine globale `AGENTS.md`)

Deaktivierbar via:
```bash
export OPENCODE_DISABLE_CLAUDE_CODE=1
```

---

## Prioritaetsreihenfolge

1. Lokale Dateien (aufwaerts vom aktuellen Verzeichnis): `AGENTS.md`, `CLAUDE.md`
2. Globale Datei: `~/.config/opencode/AGENTS.md`
3. Claude Code Datei: `~/.claude/CLAUDE.md`

Erste passende Datei pro Kategorie gewinnt.

---

## Custom Instructions per Config

### Lokale Dateien einbinden

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md"
  ]
}
```

### Remote URLs

```json
{
  "instructions": [
    "https://raw.githubusercontent.com/my-org/shared-rules/main/style.md"
  ]
}
```

Remote-Instructions werden mit 5 Sekunden Timeout geladen.

---

## Externe Dateien referenzieren

### Empfohlen: opencode.json

```json
{
  "instructions": [
    "docs/development-standards.md",
    "test/testing-guidelines.md",
    "packages/*/AGENTS.md"
  ]
}
```

### Alternative: Lazy Loading in AGENTS.md

```markdown
# Project Rules

## External File Loading
CRITICAL: When you encounter a file reference (e.g., @rules/general.md),
use your Read tool to load it on a need-to-know basis.

## Guidelines
For TypeScript code style: @docs/typescript-guidelines.md
For React patterns: @docs/react-patterns.md
For API design: @docs/api-standards.md
For testing: @test/testing-guidelines.md
```

---

## Best Practices

1. **AGENTS.md ins Git committen:** Team-weite Standards
2. **Globale AGENTS.md fuer persoenliche Praeferenzen:** Sprache, Style, Editor-Verhalten
3. **instructions in opencode.json:** Bestehende Docs wiederverwenden statt duplizieren
4. **Glob-Patterns fuer Monorepos:** `packages/*/AGENTS.md`
5. **Kompakt halten:** Nur das Wichtigste. Der Agent hat begrenzten Kontext.
6. **Projekt-Struktur dokumentieren:** Hilft dem Agent massiv bei der Navigation
7. **/init nutzen:** Automatische Generierung als Startpunkt

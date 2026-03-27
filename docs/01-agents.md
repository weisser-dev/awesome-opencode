# Agents in OpenCode

Agents sind spezialisierte KI-Assistenten in OpenCode, die fuer bestimmte Aufgaben und Workflows konfiguriert werden koennen. Sie erlauben es, fokussierte Werkzeuge mit eigenen Prompts, Modellen und Tool-Zugriff zu erstellen.

> **Offizielle Docs:** [opencode.ai/docs/agents](https://opencode.ai/docs/agents/)

---

## Agent-Typen

### Primary Agents

Primary Agents sind die Haupt-Assistenten, mit denen du direkt interagierst. Du wechselst mit **Tab** zwischen ihnen.

| Agent       | Modus     | Beschreibung                                           |
|-------------|-----------|--------------------------------------------------------|
| **Build**   | `primary` | Standard-Agent mit allen Tools aktiviert               |
| **Plan**    | `primary` | Analyse- und Planungs-Agent, schreibgeschuetzt         |

### Subagents

Subagents werden von Primary Agents fuer spezialisierte Aufgaben aufgerufen oder manuell per `@mention` angesprochen.

| Agent       | Modus      | Beschreibung                                          |
|-------------|------------|-------------------------------------------------------|
| **General** | `subagent` | General-Purpose Agent, voller Tool-Zugriff            |
| **Explore** | `subagent` | Schneller Read-Only Agent fuer Codebase-Exploration   |

### Versteckte System-Agents

| Agent          | Funktion                              |
|----------------|---------------------------------------|
| **Compaction** | Komprimiert langen Kontext            |
| **Title**      | Generiert kurze Session-Titel         |
| **Summary**    | Erstellt Session-Zusammenfassungen    |

---

## Agents konfigurieren

### Per JSON (opencode.json)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "build": {
      "mode": "primary",
      "model": "anthropic/claude-sonnet-4-20250514",
      "prompt": "{file:./prompts/build.txt}"
    },
    "plan": {
      "mode": "primary",
      "model": "anthropic/claude-haiku-4-20250514"
    },
    "code-reviewer": {
      "description": "Reviews code for best practices and potential issues",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-20250514",
      "prompt": "You are a code reviewer. Focus on security, performance, and maintainability.",
      "permission": {
        "edit": "deny",
        "bash": "deny"
      }
    }
  }
}
```

### Per Markdown (.opencode/agents/*.md)

Agents koennen auch als Markdown-Dateien definiert werden:

- **Global:** `~/.config/opencode/agents/`
- **Pro Projekt:** `.opencode/agents/`

Der Dateiname wird zum Agent-Namen (z.B. `review.md` -> Agent `review`).

```markdown
---
description: Reviews code for quality and best practices
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.1
permission:
  edit: deny
  bash:
    "*": ask
    "git diff": allow
    "git log*": allow
  webfetch: deny
---

You are in code review mode. Focus on:

- Code quality and best practices
- Potential bugs and edge cases
- Performance implications
- Security considerations

Provide constructive feedback without making direct changes.
```

---

## Wichtige Konfigurationsoptionen

### Description (Pflicht)

```json
"description": "Reviews code for best practices and potential issues"
```

### Model

Ueberschreibt das Modell pro Agent. Wenn nicht angegeben, verwenden Primary Agents das globale Modell; Subagents verwenden das Modell des aufrufenden Primary Agents.

```json
"model": "anthropic/claude-haiku-4-20250514"
```

### Temperature

Steuert Kreativitaet (0.0-1.0):
- **0.0-0.2:** Deterministisch, ideal fuer Code-Analyse
- **0.3-0.5:** Ausgewogen, gut fuer Entwicklung
- **0.6-1.0:** Kreativ, gut fuer Brainstorming

### Max Steps

Begrenzt agentic Iterationen:

```json
"steps": 5
```

### Permissions

```json
"permission": {
  "edit": "deny",
  "bash": {
    "*": "ask",
    "git status *": "allow",
    "git push *": "deny"
  },
  "webfetch": "deny"
}
```

Moegliche Werte: `"allow"`, `"ask"`, `"deny"`

### Task Permissions (Subagent-Kontrolle)

Steuert, welche Subagents ein Agent aufrufen darf:

```json
"permission": {
  "task": {
    "*": "deny",
    "orchestrator-*": "allow",
    "code-reviewer": "ask"
  }
}
```

### Hidden

Versteckt einen Subagent aus dem `@` Autocomplete-Menu:

```json
"hidden": true
```

### Color

```json
"color": "#ff6b6b"
```

---

## Agent erstellen (CLI)

```bash
opencode agent create
```

Interaktiver Wizard, der:
1. Fragt ob global oder projekt-spezifisch
2. Beschreibung abfragt
3. System-Prompt generiert
4. Tool-Zugriff konfiguriert
5. Markdown-Datei erstellt

---

## Best Practices

1. **Nutze separate Modelle pro Agent:** Haiku fuer Plan/Explore, Sonnet/Opus fuer Build
2. **Minimale Berechtigungen:** Gib Agents nur die Tools, die sie brauchen
3. **Spezifische Prompts:** Je klarer der System-Prompt, desto besser das Ergebnis
4. **Subagents fuer wiederkehrende Aufgaben:** Code Review, Docs, Security Audit
5. **Task Permissions nutzen:** Kontrolliere welche Subagents aufgerufen werden duerfen
6. **Temperature anpassen:** Niedrig fuer Analyse, hoeher fuer kreative Aufgaben

---

## Beispiel-Agents

Fertige Agent-Definitionen findest du in [`/templates/agents/`](../templates/agents/).

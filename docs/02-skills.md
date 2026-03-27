# Agent Skills in OpenCode

Skills sind wiederverwendbare Anweisungen, die OpenCode aus deinem Repo oder Home-Verzeichnis entdecken kann. Sie werden on-demand ueber das native `skill` Tool geladen -- Agents sehen verfuegbare Skills und koennen den Inhalt bei Bedarf laden.

> **Offizielle Docs:** [opencode.ai/docs/skills](https://opencode.ai/docs/skills/)

---

## Verzeichnisstruktur

Erstelle einen Ordner pro Skill-Name mit einer `SKILL.md` darin:

```
.opencode/skills/
  git-release/
    SKILL.md
  pr-review/
    SKILL.md
  migration/
    SKILL.md
```

### Unterstuetzte Pfade

| Pfad                                        | Typ              |
|---------------------------------------------|------------------|
| `.opencode/skills/<name>/SKILL.md`          | Projekt (OpenCode) |
| `~/.config/opencode/skills/<name>/SKILL.md` | Global (OpenCode)  |
| `.claude/skills/<name>/SKILL.md`            | Projekt (Claude-kompatibel) |
| `~/.claude/skills/<name>/SKILL.md`          | Global (Claude-kompatibel)  |
| `.agents/skills/<name>/SKILL.md`            | Projekt (Agent-kompatibel)  |
| `~/.agents/skills/<name>/SKILL.md`          | Global (Agent-kompatibel)   |

---

## SKILL.md Aufbau

Jede `SKILL.md` beginnt mit YAML-Frontmatter:

```markdown
---
name: git-release
description: Create consistent releases and changelogs
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: github
---

## What I do
- Draft release notes from merged PRs
- Propose a version bump
- Provide a copy-pasteable `gh release create` command

## When to use me
Use this when you are preparing a tagged release.
Ask clarifying questions if the target versioning scheme is unclear.
```

### Pflichtfelder

| Feld          | Beschreibung                          | Pflicht |
|---------------|---------------------------------------|---------|
| `name`        | Skill-Name (1-64 Zeichen, lowercase) | Ja      |
| `description` | Beschreibung (1-1024 Zeichen)         | Ja      |
| `license`     | Lizenz                                | Nein    |
| `compatibility` | Kompatibilitaet                     | Nein    |
| `metadata`    | Key-Value Map (Strings)               | Nein    |

### Naming Rules

- 1-64 Zeichen
- Nur lowercase alphanumerisch mit einzelnen Bindestrichen
- Darf nicht mit `-` beginnen oder enden
- Keine aufeinanderfolgenden `--`
- **Muss mit dem Verzeichnisnamen uebereinstimmen**

Regex: `^[a-z0-9]+(-[a-z0-9]+)*$`

---

## Wie Agents Skills entdecken

OpenCode listet verfuegbare Skills in der `skill` Tool-Beschreibung:

```xml
<available_skills>
  <skill>
    <name>git-release</name>
    <description>Create consistent releases and changelogs</description>
  </skill>
</available_skills>
```

Der Agent laedt einen Skill per:
```
skill({ name: "git-release" })
```

---

## Permissions konfigurieren

### Global

```json
{
  "permission": {
    "skill": {
      "*": "allow",
      "pr-review": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```

| Permission | Verhalten                               |
|------------|----------------------------------------|
| `allow`    | Skill laedt sofort                      |
| `deny`     | Skill ist versteckt, Zugriff abgelehnt |
| `ask`      | User wird vor Laden gefragt             |

### Per Agent (Markdown)

```yaml
---
permission:
  skill:
    "documents-*": "allow"
---
```

### Per Agent (JSON)

```json
{
  "agent": {
    "plan": {
      "permission": {
        "skill": {
          "internal-*": "allow"
        }
      }
    }
  }
}
```

### Skill-Tool komplett deaktivieren

```json
{
  "agent": {
    "plan": {
      "tools": {
        "skill": false
      }
    }
  }
}
```

---

## Troubleshooting

Wenn ein Skill nicht auftaucht:

1. Pruefe ob `SKILL.md` korrekt grossgeschrieben ist
2. Pruefe ob Frontmatter `name` und `description` enthaelt
3. Stelle sicher, dass Skill-Namen ueber alle Pfade eindeutig sind
4. Pruefe Permissions -- Skills mit `deny` sind versteckt

---

## Best Practices

1. **Beschreibungen praezise formulieren** -- Der Agent entscheidet anhand der Description, ob er den Skill laedt
2. **"When to use me" Section** -- Hilft dem Agent bei der Entscheidung
3. **Modulare Skills** -- Jeder Skill eine klare Aufgabe
4. **Globale Skills fuer persoenliche Workflows** in `~/.config/opencode/skills/`
5. **Projekt-Skills fuer Team-Workflows** in `.opencode/skills/` (ins Git committen)

---

## Beispiel-Skills

Fertige Skill-Definitionen findest du in [`/templates/skills/`](../templates/skills/).

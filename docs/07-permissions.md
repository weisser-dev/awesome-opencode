# Permissions in OpenCode

Permissions steuern, welche Aktionen automatisch laufen, eine Bestaetigungs-Abfrage ausloesen oder blockiert werden.

> **Offizielle Docs:** [opencode.ai/docs/permissions](https://opencode.ai/docs/permissions/)

---

## Aktionen

| Aktion   | Beschreibung                    |
|----------|---------------------------------|
| `allow`  | Ausfuehren ohne Nachfrage       |
| `ask`    | Bestaetigung vor Ausfuehrung    |
| `deny`   | Aktion blockieren                |

---

## Globale Konfiguration

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "*": "ask",
    "bash": "allow",
    "edit": "deny"
  }
}
```

Oder alle auf einmal:

```json
{
  "permission": "allow"
}
```

---

## Granulare Regeln (Object Syntax)

Die letzte passende Regel gewinnt. Allgemeine `"*"` Regel zuerst, spezifische danach.

### Bash-Befehle

```json
{
  "permission": {
    "bash": {
      "*": "ask",
      "git *": "allow",
      "npm *": "allow",
      "rm *": "deny",
      "grep *": "allow"
    }
  }
}
```

### Datei-Edits

```json
{
  "permission": {
    "edit": {
      "*": "deny",
      "packages/web/src/content/docs/*.mdx": "allow"
    }
  }
}
```

### Wildcards

- `*` matcht null oder mehr beliebige Zeichen
- `?` matcht genau ein Zeichen

---

## Verfuegbare Permission-Keys

| Key | Beschreibung | Granular Match |
|-----|-------------|---------------|
| `read` | Datei lesen | Dateipfad |
| `edit` | Alle Datei-Modifikationen (edit, write, patch) | Dateipfad |
| `glob` | Datei-Suche | Glob-Pattern |
| `grep` | Inhalts-Suche | Regex-Pattern |
| `list` | Verzeichnis auflisten | Verzeichnispfad |
| `bash` | Shell-Befehle | Geparster Befehl |
| `task` | Subagent starten | Subagent-Typ |
| `skill` | Skill laden | Skill-Name |
| `lsp` | LSP-Abfragen | (nicht granular) |
| `webfetch` | URL abrufen | URL |
| `websearch` | Web-Suche | Query |
| `external_directory` | Zugriff ausserhalb Projektverzeichnis | Pfad |
| `doom_loop` | Gleicher Tool-Call 3x wiederholt | - |

---

## Defaults

- Die meisten Permissions sind standardmaessig `"allow"`
- `doom_loop` und `external_directory` sind `"ask"`
- `.env` Dateien werden beim Lesen standardmaessig blockiert:

```json
{
  "permission": {
    "read": {
      "*": "allow",
      "*.env": "deny",
      "*.env.*": "deny",
      "*.env.example": "allow"
    }
  }
}
```

---

## Per-Agent Permissions

Agent-Permissions werden mit globalen Permissions gemergt. Agent-Regeln haben Vorrang.

### In opencode.json

```json
{
  "permission": {
    "bash": {
      "*": "ask",
      "git *": "allow"
    }
  },
  "agent": {
    "build": {
      "permission": {
        "bash": {
          "*": "ask",
          "git commit *": "ask",
          "git push *": "deny"
        }
      }
    }
  }
}
```

### In Markdown Agents

```yaml
---
description: Code review without edits
mode: subagent
permission:
  edit: deny
  bash: ask
  webfetch: deny
---
```

---

## Externe Verzeichnisse

```json
{
  "permission": {
    "external_directory": {
      "~/projects/personal/**": "allow"
    },
    "edit": {
      "~/projects/personal/**": "deny"
    }
  }
}
```

---

## Was "Ask" macht

Bei `ask` bietet das UI drei Optionen:
- **once** -- Nur diese Anfrage genehmigen
- **always** -- Zukuenftige passende Anfragen genehmigen (Session-Dauer)
- **reject** -- Anfrage ablehnen

---

## Best Practices

1. **Sichere Defaults:** `"*": "ask"` als Basis, spezifische Erlaubnisse darauf
2. **Git-Befehle kontrollieren:** `git push` und `git commit` per `ask` oder `deny`
3. **Destruktive Befehle blocken:** `rm -rf *` per `deny`
4. **Read-Only Agents:** `edit: deny` und `bash: deny` fuer Review-Agents
5. **Pattern-Match beachten:** `"git status"` vs `"git status *"` (mit Argumenten)
6. **.env schuetzen:** Standard-Deny fuer `.env` beibehalten

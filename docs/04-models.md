# Modell-Empfehlungen fuer OpenCode

OpenCode unterstuetzt ueber 75 LLM-Provider via AI SDK und Models.dev. Die Wahl des richtigen Modells pro Agent und Task hat grossen Einfluss auf Qualitaet und Kosten.

> **Offizielle Docs:** [opencode.ai/docs/models](https://opencode.ai/docs/models/)

---

## Empfohlene Modelle (Stand 2025/2026)

Die folgenden Modelle funktionieren gut mit OpenCode (Code-Generierung + Tool-Calling):

| Modell | Provider | Staerken |
|--------|----------|----------|
| **Claude Opus 4.5** | Anthropic | Beste Gesamtqualitaet, tiefes Verstaendnis |
| **Claude Sonnet 4.5** | Anthropic | Bestes Preis-Leistungs-Verhaeltnis |
| **GPT 5.2** | OpenAI | Starkes Reasoning |
| **GPT 5.1 Codex** | OpenAI | Optimiert fuer Code |
| **Gemini 3 Pro** | Google | Grosses Context Window |
| **Minimax M2.1** | Minimax | Gute Alternative |

---

## Modell-Strategie: Richtige Modelle fuer richtige Tasks

### Die goldene Regel: Nicht ueberall das teuerste Modell nutzen

```
Build Agent     -> Starkes Modell    (Sonnet 4.5, Opus 4.5, GPT 5.2)
Plan Agent      -> Guenstiges Modell (Haiku 4.5, GPT 5.1 Codex)
Explore Agent   -> Guenstiges Modell (Haiku 4.5)
Title/Summary   -> Kleinstes Modell  (automatisch via small_model)
```

### Konfiguration in opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5-20250929",
  "small_model": "anthropic/claude-haiku-4-5-20250929",
  "agent": {
    "build": {
      "model": "anthropic/claude-sonnet-4-5-20250929"
    },
    "plan": {
      "model": "anthropic/claude-haiku-4-5-20250929"
    }
  }
}
```

---

## Token-Optimierung

### 1. small_model fuer System-Tasks

```json
{
  "small_model": "anthropic/claude-haiku-4-5-20250929"
}
```

Wird automatisch fuer Title-Generation und leichte Tasks verwendet.

### 2. Guenstige Modelle fuer Subagents

Subagents uebernehmen standardmaessig das Modell des aufrufenden Primary Agents. Ueberschreibe das:

```json
{
  "agent": {
    "explore": {
      "model": "anthropic/claude-haiku-4-5-20250929"
    },
    "general": {
      "model": "anthropic/claude-haiku-4-5-20250929"
    }
  }
}
```

### 3. Steps begrenzen

`steps` kontrolliert wie viele agentic Iterationen ein Agent maximal ausfuehren darf. Wird das Limit erreicht, muss der Agent seine Arbeit zusammenfassen und verbleibende Tasks auflisten.

**Empfohlene Step-Limits pro Agent-Typ:**

| Agent-Typ | Steps | Begruendung |
|-----------|-------|-------------|
| Code-schreibende Agents | unbegrenzt | Muessen iterieren bis der Code fertig ist |
| Review/Analyse Agents | 10-15 | Lesen, analysieren, Report erstellen |
| Orchestration Agents | 5-10 | Delegieren, nicht selbst ausfuehren |
| Docs/Fast Agents | 5-10 | Schnelle, fokussierte Aufgaben |
| Debugging Agents | 15-20 | Brauchen mehr Schritte fuer Trace-Analyse |

```json
{
  "agent": {
    "code-reviewer": {
      "steps": 15,
      "model": "anthropic/claude-sonnet-4-5-20250929"
    },
    "context-manager": {
      "steps": 5,
      "model": "anthropic/claude-haiku-4-5-20250929"
    },
    "debugger": {
      "steps": 20,
      "model": "anthropic/claude-sonnet-4-5-20250929"
    }
  }
}
```

**Tipp:** Das CLI-Tool `awesome-opencode` setzt diese Step-Limits automatisch wenn die Option "Apply recommended step limits" gewaehlt wird.

### 4. Compaction konfigurieren

Compaction komprimiert den Konversations-Kontext automatisch wenn er zu lang wird. Ohne Compaction kann eine lange Session das Token-Limit ueberschreiten.

```json
{
  "compaction": {
    "auto": true,
    "prune": true,
    "reserved": 10000
  }
}
```

| Option | Beschreibung |
|--------|-------------|
| `auto` | Automatische Compaction wenn Kontext zu lang wird |
| `prune` | Alte Nachrichten entfernen nach Compaction |
| `reserved` | Mindest-Token-Reserve fuer neue Nachrichten (Standard: 10000) |

### 5. MCP Server sparsam einsetzen

Jeder MCP Server fuegt seine Tool-Beschreibungen zum Kontext hinzu. Das sind oft 500-2000 Tokens pro Server. Bei 10 Servern sind das schon 5000-20000 Token die bei JEDEM Request mitgeschickt werden.

**Strategie:** MCP Server global deaktivieren und nur fuer spezifische Agents einschalten:

```json
{
  "tools": {
    "my-mcp*": false
  },
  "agent": {
    "database-optimizer": {
      "tools": {
        "postgres*": true
      }
    }
  }
}
```

### 6. Agent-Tier-Strategie (Kosten-Uebersicht)

Eine vollstaendige Kostenoptimierung kombiniert alle Massnahmen:

```json
{
  "model": "anthropic/claude-sonnet-4-5-20250929",
  "small_model": "anthropic/claude-haiku-4-5-20250929",
  "compaction": { "auto": true, "prune": true },
  "agent": {
    "build":   { "model": "anthropic/claude-sonnet-4-5-20250929" },
    "plan":    { "model": "anthropic/claude-haiku-4-5-20250929" },
    "explore": { "model": "anthropic/claude-haiku-4-5-20250929" },
    "code-reviewer":  { "model": "anthropic/claude-sonnet-4-5-20250929", "steps": 15 },
    "docs-writer":    { "model": "anthropic/claude-haiku-4-5-20250929",  "steps": 10 },
    "context-manager":{ "model": "anthropic/claude-haiku-4-5-20250929",  "steps": 5 }
  }
}
```

---

## Modell-Varianten

Viele Modelle bieten verschiedene Varianten fuer unterschiedliche Anwendungsfaelle:

### Anthropic

| Variante | Beschreibung |
|----------|-------------|
| `high`   | Hohes Thinking-Budget (Standard) |
| `max`    | Maximales Thinking-Budget |

### OpenAI

| Variante  | Beschreibung |
|-----------|-------------|
| `none`    | Kein Reasoning |
| `minimal` | Minimaler Aufwand |
| `low`     | Niedriger Aufwand |
| `medium`  | Mittlerer Aufwand |
| `high`    | Hoher Aufwand |
| `xhigh`  | Extra hoher Aufwand |

### Custom Varianten

```json
{
  "provider": {
    "openai": {
      "models": {
        "gpt-5": {
          "variants": {
            "thinking": {
              "reasoningEffort": "high",
              "textVerbosity": "low"
            },
            "fast": {
              "reasoningEffort": "low",
              "textVerbosity": "low"
            }
          }
        }
      }
    }
  }
}
```

Wechsel mit dem Keybind `variant_cycle`.

---

## Provider-Konfiguration

### Timeouts anpassen

```json
{
  "provider": {
    "anthropic": {
      "options": {
        "timeout": 600000,
        "chunkTimeout": 30000
      }
    }
  }
}
```

### AWS Bedrock

```json
{
  "provider": {
    "amazon-bedrock": {
      "options": {
        "region": "us-east-1",
        "profile": "my-aws-profile"
      }
    }
  }
}
```

---

## Kosten-Vergleich (Grobe Richtwerte)

| Modell | Input $/1M Tokens | Output $/1M Tokens | Empfehlung |
|--------|-------------------|---------------------|------------|
| Claude Opus 4.5 | ~$15 | ~$75 | Nur fuer komplexe Tasks |
| Claude Sonnet 4.5 | ~$3 | ~$15 | Build Agent Standard |
| Claude Haiku 4.5 | ~$0.80 | ~$4 | Plan/Explore/Subagents |
| GPT 5.2 | ~$5 | ~$20 | Build Alternative |
| GPT 5.1 Codex | ~$3 | ~$12 | Code-Generierung |

*Preise sind Richtwerte und koennen sich aendern.*

---

## Best Practices

1. **Build = Starkes Modell:** Hier wird Code geschrieben, Qualitaet ist wichtig
2. **Plan/Explore = Guenstiges Modell:** Lesen und Analysieren braucht kein teueres Modell
3. **small_model setzen:** Spart bei Title/Summary/System-Tasks
4. **Steps begrenzen:** Verhindert unkontrollierte Kosten
5. **Varianten nutzen:** Reasoning-Effort pro Situation anpassen
6. **Compaction aktivieren:** Laesst Token-Verbrauch in langen Sessions kontrollierbar
7. **MCP Server minimieren:** Weniger Server = weniger Context-Verbrauch

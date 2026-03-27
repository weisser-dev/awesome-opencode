# Tools & Custom Tools in OpenCode

OpenCode kommt mit einem Set eingebauter Tools und erlaubt das Erstellen eigener Custom Tools.

> **Offizielle Docs:** [opencode.ai/docs/tools](https://opencode.ai/docs/tools/) | [opencode.ai/docs/custom-tools](https://opencode.ai/docs/custom-tools/)

---

## Built-in Tools

| Tool | Beschreibung | Permission Key |
|------|-------------|---------------|
| `bash` | Shell-Befehle ausfuehren | `bash` |
| `edit` | Dateien bearbeiten (exakte String-Replacement) | `edit` |
| `write` | Neue Dateien erstellen / ueberschreiben | `edit` |
| `read` | Datei-Inhalte lesen | `read` |
| `grep` | Inhalte mit Regex durchsuchen | `grep` |
| `glob` | Dateien per Pattern finden | `glob` |
| `list` | Verzeichnisse auflisten | `list` |
| `patch` | Patches anwenden | `edit` |
| `skill` | Skills laden | `skill` |
| `todowrite` | Todo-Listen verwalten | `todowrite` |
| `webfetch` | Web-Inhalte abrufen | `webfetch` |
| `websearch` | Web-Suche (Exa AI) | `websearch` |
| `question` | User-Fragen stellen | `question` |
| `lsp` | LSP-Abfragen (experimentell) | `lsp` |

### Tool-Permissions konfigurieren

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "edit": "ask",
    "bash": "ask",
    "webfetch": "allow",
    "read": "allow"
  }
}
```

### Wildcards fuer MCP Tools

```json
{
  "permission": {
    "mymcp_*": "ask"
  }
}
```

---

## Custom Tools erstellen

Custom Tools sind TypeScript/JavaScript-Dateien, die das LLM waehrend Konversationen aufrufen kann.

### Speicherorte

- **Lokal:** `.opencode/tools/`
- **Global:** `~/.config/opencode/tools/`

### Grundstruktur

```typescript
// .opencode/tools/database.ts
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Query the project database",
  args: {
    query: tool.schema.string().describe("SQL query to execute"),
  },
  async execute(args) {
    return `Executed query: ${args.query}`
  },
})
```

Der **Dateiname** wird zum **Tool-Namen** (`database.ts` -> Tool `database`).

### Mehrere Tools pro Datei

```typescript
// .opencode/tools/math.ts
import { tool } from "@opencode-ai/plugin"

export const add = tool({
  description: "Add two numbers",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number"),
  },
  async execute(args) {
    return args.a + args.b
  },
})

export const multiply = tool({
  description: "Multiply two numbers",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number"),
  },
  async execute(args) {
    return args.a * args.b
  },
})
```

Erstellt: `math_add` und `math_multiply`.

### Context nutzen

```typescript
export default tool({
  description: "Get project information",
  args: {},
  async execute(args, context) {
    const { agent, sessionID, messageID, directory, worktree } = context
    return `Agent: ${agent}, Dir: ${directory}`
  },
})
```

### Tools in anderen Sprachen

Beispiel: Python-Tool via TypeScript-Wrapper:

```typescript
// .opencode/tools/python-add.ts
import { tool } from "@opencode-ai/plugin"
import path from "path"

export default tool({
  description: "Add two numbers using Python",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number"),
  },
  async execute(args, context) {
    const script = path.join(context.worktree, ".opencode/tools/add.py")
    const result = await Bun.$`python3 ${script} ${args.a} ${args.b}`.text()
    return result.trim()
  },
})
```

---

## .ignore Datei

Tools wie `grep`, `glob`, `list` verwenden intern ripgrep und respektieren `.gitignore`. Um ignorierte Dateien einzubeziehen:

```
# .ignore
!node_modules/
!dist/
!build/
```

---

## Best Practices

1. **Custom Tools fuer wiederkehrende Aufgaben:** DB-Abfragen, API-Calls, Build-Scripts
2. **Klare Descriptions:** Der Agent entscheidet anhand der Beschreibung, wann er das Tool nutzt
3. **Zod-Schemas nutzen:** Typsichere Argumente mit guten `.describe()` Texten
4. **Permissions beachten:** Custom Tools, die gleich heissen wie Built-in Tools, ueberschreiben diese
5. **Context.worktree nutzen:** Fuer relative Pfade innerhalb des Projekts

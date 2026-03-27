# MCP Servers in OpenCode

MCP (Model Context Protocol) erlaubt es, externe Tools und Services in OpenCode zu integrieren. OpenCode unterstuetzt sowohl lokale als auch remote MCP Server.

> **Offizielle Docs:** [opencode.ai/docs/mcp-servers](https://opencode.ai/docs/mcp-servers/)
>
> **MCP Server finden:** [mcp.so](https://mcp.so) | [glama.ai/mcp/servers](https://glama.ai/mcp/servers)

---

## Wichtiger Hinweis: Context-Verbrauch

MCP Server fuegen dem Kontext Tokens hinzu. Je mehr MCP Tools aktiviert sind, desto schneller wird das Context-Limit erreicht.

**Empfehlung:** Aktiviere nur die MCP Server, die du wirklich brauchst. Deaktiviere Server global und aktiviere sie nur fuer spezifische Agents.

---

## Lokale MCP Server

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "my-local-mcp": {
      "type": "local",
      "command": ["npx", "-y", "my-mcp-command"],
      "enabled": true,
      "environment": {
        "MY_ENV_VAR": "my_env_var_value"
      }
    }
  }
}
```

### Optionen

| Option        | Typ     | Pflicht | Beschreibung                         |
|---------------|---------|---------|--------------------------------------|
| `type`        | String  | Ja      | Muss `"local"` sein                 |
| `command`     | Array   | Ja      | Befehl und Argumente                 |
| `environment` | Object  | Nein    | Umgebungsvariablen                   |
| `enabled`     | Boolean | Nein    | Aktiviert/Deaktiviert beim Start     |
| `timeout`     | Number  | Nein    | Timeout in ms (Standard: 5000)       |

---

## Remote MCP Server

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "my-remote-mcp": {
      "type": "remote",
      "url": "https://my-mcp-server.com",
      "enabled": true,
      "headers": {
        "Authorization": "Bearer {env:MY_API_KEY}"
      }
    }
  }
}
```

### Optionen

| Option    | Typ     | Pflicht | Beschreibung                         |
|-----------|---------|---------|--------------------------------------|
| `type`    | String  | Ja      | Muss `"remote"` sein                |
| `url`     | String  | Ja      | URL des MCP Servers                  |
| `enabled` | Boolean | Nein    | Aktiviert/Deaktiviert beim Start     |
| `headers` | Object  | Nein    | HTTP-Headers                         |
| `oauth`   | Object  | Nein    | OAuth-Konfiguration                  |
| `timeout` | Number  | Nein    | Timeout in ms (Standard: 5000)       |

---

## OAuth-Authentifizierung

### Automatisch (Dynamic Client Registration)

```json
{
  "mcp": {
    "my-oauth-server": {
      "type": "remote",
      "url": "https://mcp.example.com/mcp"
    }
  }
}
```

### Mit vorregistrierten Credentials

```json
{
  "mcp": {
    "my-oauth-server": {
      "type": "remote",
      "url": "https://mcp.example.com/mcp",
      "oauth": {
        "clientId": "{env:MY_MCP_CLIENT_ID}",
        "clientSecret": "{env:MY_MCP_CLIENT_SECRET}",
        "scope": "tools:read tools:execute"
      }
    }
  }
}
```

### CLI-Befehle

```bash
opencode mcp auth my-oauth-server    # Authentifizieren
opencode mcp list                     # Server und Auth-Status anzeigen
opencode mcp logout my-oauth-server   # Credentials entfernen
```

---

## MCP Server per Agent steuern

**Strategie:** Global deaktivieren, per Agent aktivieren.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "my-mcp": {
      "type": "local",
      "command": ["bun", "x", "my-mcp-command"],
      "enabled": true
    }
  },
  "tools": {
    "my-mcp*": false
  },
  "agent": {
    "my-agent": {
      "tools": {
        "my-mcp*": true
      }
    }
  }
}
```

---

## Empfohlene MCP Server

### Context7 -- Dokumentation durchsuchen

```json
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

Nutzung: `use context7` im Prompt

### Sentry -- Error Tracking

```json
{
  "mcp": {
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "oauth": {}
    }
  }
}
```

Auth: `opencode mcp auth sentry`

### Grep by Vercel -- GitHub Code-Suche

```json
{
  "mcp": {
    "gh_grep": {
      "type": "remote",
      "url": "https://mcp.grep.app"
    }
  }
}
```

### Weitere nuetzliche MCP Server

| Server | Beschreibung | URL/Package |
|--------|-------------|-------------|
| **Filesystem** | Dateisystem-Zugriff | `@modelcontextprotocol/server-filesystem` |
| **GitHub** | GitHub API (Vorsicht: viele Tokens!) | `@modelcontextprotocol/server-github` |
| **PostgreSQL** | Datenbank-Zugriff | `@modelcontextprotocol/server-postgres` |
| **Puppeteer** | Browser-Automatisierung | `@modelcontextprotocol/server-puppeteer` |
| **Memory** | Persistenter Speicher | `@modelcontextprotocol/server-memory` |

---

## Best Practices

1. **Weniger ist mehr:** Nur die MCP Server aktivieren, die du wirklich brauchst
2. **Per-Agent Aktivierung:** MCP Server global deaktivieren und nur fuer spezifische Agents einschalten
3. **AGENTS.md nutzen:** Instruktionen wie "Use context7 for documentation lookups" hinzufuegen
4. **Environment Variables:** Secrets immer ueber `{env:VAR_NAME}` referenzieren, nie hartcoden
5. **Timeouts konfigurieren:** Bei langsamen Servern den Timeout erhoehen
6. **GitHub MCP vermeiden:** Verbraucht sehr viele Tokens -- nutze stattdessen `gh` CLI via Bash

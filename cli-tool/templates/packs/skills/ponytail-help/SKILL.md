---
name: ponytail-help
description: >
  Quick-reference card for the ponytail modes and skills installed from the
  behavior pack. One-shot display, not a persistent mode. Trigger:
  /ponytail-help, "ponytail help", "what ponytail commands", "how do I use
  ponytail".
license: MIT
---

# Ponytail Help

Display this reference card when invoked. One-shot, do NOT change mode,
write flag files, or persist anything.

## Levels

| Level | Trigger | What change |
|-------|---------|-------------|
| **Lite** | `/ponytail lite` | Build what's asked, name the lazier alternative in one line. |
| **Full** | `/ponytail` | The ladder enforced: YAGNI → stdlib → native → one line → minimum. Default. |
| **Ultra** | `/ponytail ultra` | YAGNI extremist. Deletion before addition. Challenges requirements before building. |

Level sticks until changed or session end.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **ponytail** | `/ponytail` | Lazy mode itself. Simplest solution that works. |
| **ponytail-review** | `/ponytail-review` | Over-engineering review: `L42: yagni: factory, one product. Inline.` |
| **ponytail-audit** | `/ponytail-audit` | Whole-repo over-engineering audit: ranked list of what to delete. |
| **ponytail-debt** | `/ponytail-debt` | Harvest `ponytail:` shortcut comments into a tracked ledger. |
| **ponytail-help** | `/ponytail-help` | This card. |

Claude Code and OpenCode both expose installed skills as slash commands with
these names.

## Deactivate

Say "stop ponytail" or "normal mode". Resume anytime with `/ponytail`.

## Scope note

Ponytail optimizes for less code. It does not replace correctness, security
or design review; use the normal review skills for those.

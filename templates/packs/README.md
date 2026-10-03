# Skill packs (bundled copy)

Do not edit these files by hand. They are imported from
[weisser-dev/agentic-skills](https://github.com/weisser-dev/agentic-skills) (`packs/`, `skills/`,
`commands/`), which holds the review notes, the adaptation tooling and the source of truth:

```bash
node cli-tool/scripts/import-packs.js /path/to/agentic-skills
node cli-tool/scripts/sync-templates.js
```

- `sources.lock.json`: packs, items, upstream sources pinned to reviewed commits, licenses, sha256 pins.
- `skills/`, `commands/`, `wrappers/`: our own skills and the reviewed copies (vendored or adapted;
  each third-party folder has `LICENSE` and `UPSTREAM.md`).
- Items of kind `fetch` are not bundled; the CLI downloads them at install time from the pinned commit
  and verifies every file's sha256.

Paths mentioned inside `UPSTREAM.md` files (`packs/check-vendored.sh`, `packs/sources.lock.json`)
refer to the agentic-skills repository.

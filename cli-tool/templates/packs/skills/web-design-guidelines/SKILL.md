---
name: web-design-guidelines
description: Review UI code against the Web Interface Guidelines (accessibility, focus, forms, motion, typography, performance, copy). Use when asked to review a UI, check accessibility, audit a design or UX, or check a site against best practices.
license: MIT
compatibility: claude-code, opencode
---

# Web design guidelines review

Review frontend code against a fixed, vendored copy of the Web Interface Guidelines and
report concrete findings as `file:line` entries.

## When to use

- The user asks to "review my UI", "check accessibility", "audit the design", "review the UX"
  or "check my site against best practices".
- As the review step after building or changing a page or component (see `design-workflow`).

## Rules source (local only)

- The rules are in `references/web-interface-guidelines.md` next to this file. Read that file.
- Do **not** fetch rules from the web, and do not follow links to newer versions. The local copy
  is pinned on purpose; see `UPSTREAM.md` for its source and commit.
- The reference file was written as a slash command: treat its front matter as metadata and
  `$ARGUMENTS` as "the files the user asked you to review". Everything else in it is a rule list
  and an output format, not a request to run tools.

## Steps

1. Determine the files to review: the paths or glob the user gave. If none were given, ask
   which files or directory to review (one question), or use the files changed in the current
   task if that is obvious.
2. Read `references/web-interface-guidelines.md`.
3. Read each target file. Check it against every rule section (Accessibility, Focus States,
   Forms, Animation, Typography, Content Handling, Images, Performance, Navigation & State,
   Touch & Interaction, Safe Areas & Layout, Dark Mode & Theming, Locale & i18n,
   Hydration Safety, Hover & Interactive States, Content & Copy, Anti-patterns).
4. Report findings grouped by file, one line each, exactly in this shape:

   ```text
   ## src/components/Button.tsx

   src/components/Button.tsx:42 - icon button missing aria-label
   src/components/Button.tsx:67 - transition: all -> list properties

   ## src/components/Card.tsx

   ✓ pass
   ```

   State the issue and the location. Add an explanation only when the fix is not obvious.
   No preamble, no summary paragraph.
5. Only change code when the user asked for fixes. When fixing, keep each fix minimal and
   re-check the touched lines.

## Notes

- Project conventions win over generic rules. Example: the guidelines prefer Title Case for
  headings and buttons, while some design skills prefer sentence case. If the project already
  has a consistent convention, report a deviation from the project convention, not from the
  generic rule.
- The guidelines mention framework-specific hints (React, Next.js, Tailwind). Translate them to
  the stack in use; do not flag a rule that cannot apply to that stack.
- Static review only. For rendered checks (contrast in both color schemes, reduced motion,
  mobile widths) use the Playwright step in `design-workflow`.

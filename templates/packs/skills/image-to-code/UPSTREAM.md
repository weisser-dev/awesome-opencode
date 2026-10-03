# Upstream and license

`SKILL.md` in this folder is an adapted copy of an MIT-licensed upstream skill.

| Field | Value |
|---|---|
| Source repository | https://github.com/Leonxlnx/taste-skill (site: https://www.tasteskill.dev/) |
| File | `skills/image-to-code-skill/SKILL.md` |
| Pinned commit | `ce26fc25c0e5e8cab638f883de62d9a86ee5e45b` |
| Retrieved | 2026-10-03 |
| Upstream sha256 | `4c060a8064a8b13380bc2ef3d6e6a1d0b1e316aa093cd9807d0ce9e4eeb037fa` |
| License | MIT License, Copyright (c) 2026 Leonxlnx (full text: `LICENSE`) |

## Changes made in this copy

- Description and intro rewritten: the skill now starts from provided reference images (screenshots, mockups, exports) instead of mandating image generation "inside Codex".
- Upstream sections 2-4, 10, 11 and 18 (mandatory image generation, image-count eagerness, Codex-specific rules) replaced by one section "Reference image sources (offline order)": user-provided images, local screenshots, generation only with explicit consent, otherwise ask or work from a written brief.
- Upstream sections 5-7 (do not crop / regenerate / detail images) folded into the readability rules of that section.
- IMAGE_GENERATION_EAGERNESS dial removed; Codex-specific lines removed.
- Analysis, extraction, layout and anti-slop sections kept with "generated image" wording changed to "reference image".
- Missing-detail resolution, clarity check, response behavior, examples and final goal rewritten for the reference-first flow, plus a no-hotlinking check and a local visual verification step.
- Sections renumbered.

Everything else is upstream text, unchanged.

## Updating

Review the upstream diff from the pinned commit (`git diff ce26fc25c0e5e8cab638f883de62d9a86ee5e45b <new-sha> -- skills/image-to-code-skill/SKILL.md`), re-apply the changes above, update commit and sha256 here and in `packs/sources.lock.json`, then run `packs/check-vendored.sh --online`.

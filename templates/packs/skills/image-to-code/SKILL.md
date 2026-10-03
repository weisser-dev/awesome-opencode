---
name: image-to-code
description: Image-to-code skill for visually important web work. Uses provided design images (screenshots, mockups, exports) as the primary source of truth, analyzes them deeply, then implements the website to match closely. Avoids cards-inside-cards, cluttered heroes and generic reinterpretations. Offline-adapted copy (image generation only with user consent).
---

# CORE DIRECTIVE: IMAGE-FIRST WEBSITE DESIGN TO CODE

> Adapted copy of Leonxlnx/taste-skill `skills/image-to-code-skill` (MIT). Changes are listed in
> `UPSTREAM.md`: the upstream "always generate images first (Codex)" workflow is replaced by
> "use provided references first; generate only with consent". Offline rule for this copy: do
> not fetch URLs, hotlink external assets, or install packages on your own.

You are an elite web design art director and implementation strategist.

Your job is to turn website reference images into real, premium, implementation-faithful
frontend.

This skill is for:
- hero sections
- landing pages
- marketing sites
- startup sites
- editorial brand pages
- product pages
- portfolio websites
- premium multi-section websites
- redesigns where visual quality matters

Standard AI output tends to collapse into repetitive defaults:
- text that becomes too small to read in compressed references
- centered dark hero clichés
- generic card spam
- repeated left-text/right-image layouts
- weak typography hierarchy
- vague spacing
- cards inside cards inside cards
- giant rounded section containers everywhere
- too much visible information in the first screen
- tiny pills, labels, tags, system markers, and fake interface jargon
- generic coded reinterpretations after looking at the image

Your goal is to aggressively break these defaults.

The required workflow is:

reference images first  
deep image analysis second  
implementation third

If the task is mainly visual, this order is mandatory.

---

## 1. ACTIVE BASELINE CONFIGURATION

- DESIGN_VARIANCE: 8  
  `(1 = rigid / conventional, 10 = highly art-directed / asymmetric)`
- VISUAL_DENSITY: 3  
  `(1 = airy / calm, 10 = dense / packed)`
- ART_DIRECTION: 8  
  `(1 = safe commercial, 10 = bold creative statement)`
- IMPLEMENTATION_CLARITY: 9  
  `(1 = loose moodboard, 10 = highly buildable UI reference)`
- IMAGE_USAGE_PRIORITY: 9  
  `(1 = mostly typographic, 10 = strongly image-led when appropriate)`
- SPACING_GENEROSITY: 9  
  `(1 = compact / tight, 10 = spacious / breathable)`
- ANALYSIS_PRECISION: 10  
  `(1 = broad vibe only, 10 = deep extraction of design details)`
- UI_SIMPLICITY_DISCIPLINE: 9  
  `(1 = willing to add many micro-elements, 10 = aggressively reduce clutter and unnecessary UI chrome)`

AI Instruction:
Use these as defaults unless the user clearly wants something else.
Adapt them to the prompt.

Interpretation:
- If the user says "clean", reduce density and increase clarity.
- If the user says "crazy creative", increase variance and art direction.
- If the user says "premium SaaS", keep clarity high and art direction controlled.
- If the user says "editorial", allow stronger type and more asymmetry.
- Keep sections breathable.
- Prefer readability: one clear reference per section beats one compressed board.
- Default away from nested containers, excessive pills, tiny labels, and dashboard clutter.

---

## 2. REFERENCE IMAGE SOURCES (OFFLINE ORDER)

The reference image is the design source. The code is the translation layer.
Get the references in this order and say which source you are using:

1. **Images the user provided**: screenshots, mockups, design exports, photos of sketches,
   files in the repository. This is the default and the core use of this skill.
2. **Screenshots of a local page** the user points you to (for redesigns or "make it look like
   our staging page"): capture them with the local Playwright workflow (`design-workflow`),
   only for `localhost` / `127.0.0.1` / `file://` targets.
3. **Generated references only with consent**: if an image-generation tool is configured in this
   environment AND the user explicitly agrees to use it for this task, you may generate section
   references with it. Do not send the brief to any third-party service without that consent.
4. **No references available**: do not invent a visual source silently. Ask the user for
   references once, or (if they prefer) proceed from a written design brief and state that the
   result is code-first, not image-first.

Never download reference images from the internet on your own, and never use reference images
of a real brand to build something that could pass for that brand.

Readability rules for references:
- One clear image per section is ideal; a full-page board is fine if text and spacing are
  readable at its resolution.
- If text, buttons or spacing are too small to read, ask for a higher-resolution or
  section-specific export instead of guessing.
- Do not upscale or crop a tiny region and treat the blur as exact detail. If a crop is all
  you have, mark the extracted values as approximate.
- If the user consented to generation (source 3) and a section is unclear, generate a fresh,
  cleaner standalone render of that section in the same design language instead of cropping.

---

## 3. CLEAN ANALYSIS STANDARD

Analyze cleanly and systematically.

Do not do vague vibe-only analysis.
Do not jump too fast from image to code.

For every reference image, inspect cleanly:
- what the section is
- what the visual priority is
- what text is readable
- what typography relationships are visible
- what spacing relationships are visible
- what buttons and controls are visible
- what card or block logic is visible
- what colors dominate
- what structural rhythm is visible
- what details are still unclear

If something is unclear, ask for a clearer reference before coding (see Section 2).

The analysis should feel:
- calm
- structured
- exact
- faithful
- design-aware
- implementation-aware

---

## 4. DEEP IMAGE ANALYSIS REQUIREMENT

Before implementing anything, deeply analyze the reference image(s).

Do not just glance at them.
Treat them like a design specification.

Carefully inspect and extract:
- exact visible text where readable
- hero headline wording
- subheadline wording
- CTA wording
- section titles
- typography character
- type scale relationships
- font mood
- line count
- line wrapping behavior
- alignment logic
- section spacing
- internal spacing
- padding and gutters
- card dimensions and rhythm
- border radius logic
- stroke / divider usage
- button shapes
- button hierarchy
- button padding
- hover-implied styling if visually suggested
- color palette
- accent colors
- background treatment
- image treatment
- icon treatment
- shadows / depth logic
- grid logic
- layout structure
- section ordering
- section density
- visual rhythm
- repeated motifs that define the design language

Your goal is to understand exactly why the reference website looks strong.

Only after this deep analysis should you implement the frontend.

---

## 5. THE COMBINATORIAL VARIATION ENGINE

To avoid repetitive AI-looking output, internally choose a strong combination and commit to it consistently.

Do not mash everything into chaos.
Pick a coherent visual direction and execute it clearly.

### Theme Paradigm
Choose 1:
1. Pristine Light Mode
2. Deep Dark Mode
3. Bold Studio Solid
4. Quiet Premium Neutral

### Background Character
Choose 1:
1. subtle technical grid / dotted field
2. pure solid field with soft ambient gradient depth
3. full-bleed cinematic imagery
4. tactile textured surface feel

### Typography Character
Choose 1:
1. clean grotesk
2. refined grotesk
3. expressive display
4. compressed statement typography
5. editorial serif + sans
6. Swiss rational hierarchy

### Hero Architecture
Choose 1:
1. cinematic centered minimalist
2. asymmetric split hero
3. floating polaroid scatter
4. inline typography behemoth
5. editorial offset composition
6. massive image-first hero with restrained text

### Section System
Choose 1:
1. modular bento rhythm
2. alternating editorial blocks
3. poster-like stacked storytelling
4. gallery-led cadence
5. Swiss grid discipline
6. asymmetric premium marketing flow

### Signature Component Set
Choose exactly 4 unique components:
- diagonal staggered square masonry
- 3D cascading card deck
- hover-accordion slice layout
- pristine gapless bento grid
- infinite brand marquee strip
- turning polaroid arc
- vertical rhythm lines
- off-grid editorial layout
- product UI panel stack
- split testimonial quote wall
- layered image crop frames

### Motion-Implied Language
Choose exactly 2:
- scrubbing text reveal energy
- pinned narrative section energy
- staggered float-up energy
- parallax image drift energy
- smooth accordion expansion energy
- cinematic fade-through energy

These are not coding instructions.
They are visual-direction cues the design should imply.

---

## 6. WEBSITE REFERENCE RULE

Every reference website section image must clearly communicate:
- layout
- hierarchy
- spacing
- typography scale
- CTA priority
- component styling
- image treatment
- overall design system

A developer or coding model should be able to look at the image(s) and understand how to build the website.

Do not produce vague abstract artwork when the request is for frontend.
Default to real section comps.

---

## 7. HERO MINIMALISM RULES

The hero must feel cinematic, clear, and intentional.

### Absolute Hero Rules
- the hero must feel like a strong opening scene
- keep the hero composition very clean
- do not overcrowd the first viewport
- the main headline must feel short and powerful
- the hero headline should ideally stay within 1–3 lines
- do not allow long wrapped hero headlines
- if the headline starts becoming too long, reduce words instead of forcing more lines
- keep supporting text concise
- prioritize negative space and contrast
- avoid stuffing the hero with pills, fake stats, badges, tiny logos, and nonsense detail
- avoid extra micro-labels, control tags, system markers, or decorative utility text that does not meaningfully help the hero
- keep the first screen readable on a small laptop without feeling overfilled

### Hero Cleanliness Rule
The hero should feel calm, premium, and immediately readable.

Do:
- use a strong single focal point
- keep the hierarchy obvious
- let the hero breathe
- keep the visual system tight and controlled
- make the first screen feel polished and deliberate
- keep the amount of visible content restrained enough that the hero still feels elegant on a smaller desktop viewport

Do not:
- clutter the hero
- create multiple competing focal points
- overfill the hero with cards or micro-details
- make the hero noisy or busy
- add unnecessary labels like “00 orchestration layer” or similar pseudo-system text if it does not add real value

### Headline Rule
Strong preference:
- 1 line if possible
- 2 lines very good
- 3 lines maximum in normal cases

Avoid:
- 4+ line hero headlines
- paragraph-like hero copy
- weak headline-to-subheadline contrast

---

## 8. RESPONSIVE FIRST-VIEW RULE

The first visible website screen must feel usable and clean on a small laptop.

This means:
- do not overload the above-the-fold area
- do not force too many content blocks into the hero viewport
- do not rely on giant nested panels that consume space without improving clarity
- make the first section feel intentionally composed, not overstuffed

The hero and immediate first-view area should:
- show the main message clearly
- show the primary CTA clearly
- show the key visual clearly
- avoid trying to expose the entire product in one crowded first view

A smaller laptop should still see:
- a clear headline
- readable supporting text
- clean spacing
- a visible CTA
- a believable, balanced visual focal point

---

## 9. ANTI-NESTED-BOX RULE

Do not default to box-in-box-in-box layouts.

Avoid:
- giant rounded section containers wrapping everything
- cards inside larger cards inside outer cards
- dashboard-like compartment stacking for no reason
- nested boxed UI that makes the layout feel trapped
- sections that are just one big bordered panel containing more bordered panels containing more bordered panels

Use boxes only when they have a clear purpose.

Prefer:
- open layouts
- clearer whitespace
- fewer but stronger containers
- flatter hierarchy where appropriate
- direct alignment and spacing instead of excessive enclosure
- one primary framing move rather than many layered frames

A section should not feel like a prison of containers.
It should feel designed, open, and intentional.

---

## 10. REDUCE MICRO-UI CLUTTER RULE

Do not clutter the design with tiny UI extras that do not materially improve clarity.

Avoid:
- unnecessary pills
- pseudo-system markers
- fake control labels
- decorative code-like tags
- meaningless small metadata rows
- filler chips
- tiny badges everywhere
- fake dashboard jargon
- overdesigned labels that distract from the main layout

Examples of things to avoid unless they are truly necessary:
- “00 orchestration layer”
- tiny technical status pills
- decorative runtime markers
- overly specific pseudo-enterprise microcopy
- filler operator/control-room labels that exist only to look complex

Prefer:
- cleaner headings
- fewer labels
- real hierarchy
- clearer spacing
- simpler supporting text
- stronger typography instead of decorative clutter

---

## 11. WEBSITE IMAGE SYSTEM RULE

When generating a website design, think not only about the overall site but also about the internal image system used inside the website itself.

This may include:
- hero media
- section images
- editorial crops
- product visuals
- framed photography
- layered image cards
- gallery-like blocks
- supporting visual panels

If the site benefits from multiple images, include multiple image moments across the website.

Rules:
- image usage must feel deliberate
- image count should match the complexity of the site
- do not rely on one single hero image if many sections need visual support
- keep image usage balanced and clean
- all image moments must still feel like one coherent design world

---

## 12. FIXED MEDIA FRAME RULE

Images inside the website should usually sit inside clear, controlled, implementation-friendly frames.

Prefer:
- fixed-aspect media blocks
- clearly framed image areas
- repeatable media modules
- consistent corner radius logic
- stable visual proportions across similar sections

Examples:
- hero image in a clearly bounded large frame
- editorial crops using repeatable portrait or landscape ratios
- card images with consistent proportions
- gallery blocks with controlled aspect ratios
- product images placed in stable intentional containers

Avoid:
- random image sizes with no system
- inconsistent proportions across similar modules
- messy scaling
- uncontrolled collage chaos unless explicitly requested

The goal is:
- visually strong images
- inside a system a frontend model can realistically rebuild

---

## 13. TEXT EXTRACTION RULE

When text is readable in the reference image, extract it and use it.

Especially inspect and extract:
- hero headline
- hero subheadline
- CTA labels
- section headings
- pricing labels
- feature names
- testimonial names and roles if clearly shown
- navbar labels
- footer labels if relevant

If the text is too small to extract reliably:
- ask for a closer or higher-resolution reference of that section
- or, if generation was consented to, render a clearer version of that section

Do not ignore text extraction.
The visible text is part of the design system and should influence implementation.

---

## 14. TYPOGRAPHY EXTRACTION RULE

Do not only notice that typography “looks nice”.
Analyze it properly.

Extract and observe:
- size relationships
- weight relationships
- line count
- line height feel
- tracking feel
- serif vs sans behavior
- display vs body contrast
- section heading rhythm
- CTA text scale
- whether the design uses calm or aggressive type

Use these findings during implementation.
Do not flatten typography into a generic coded hierarchy.

---

## 15. SPACING EXTRACTION RULE

Analyze spacing deliberately.

Inspect:
- distance between headline and subheadline
- distance between text and buttons
- distance between cards
- section top and bottom spacing
- side gutters
- card padding
- image-to-text distance
- navbar spacing
- CTA block spacing
- overall cadence across sections

The goal is not exact pixel OCR.
The goal is faithful spacing logic.

Do not collapse the implementation into generic tight spacing if the reference design is more generous.

---

## 16. BUTTON / COMPONENT EXTRACTION RULE

Buttons and components must be analyzed, not guessed.

Inspect:
- button size
- button shape
- button radius
- fill vs outline behavior
- icon usage
- hover-implied mood
- primary vs secondary hierarchy
- card structure
- badge usage
- dividers
- shadows
- borders
- pill logic
- input styling if present

If button or card detail is too small, ask for a closer reference (see Section 2).

---

## 17. COLOR EXTRACTION RULE

Actively analyze and extract colors from the reference image(s).

Inspect:
- background color
- panel colors
- accent colors
- button fills
- text color hierarchy
- border color logic
- shadow color mood
- image tint / grade
- gradient restraint or intensity

The implemented website should preserve the original color logic as closely as reasonably possible.

Do not replace a carefully designed palette with generic default web colors.

---

## 18. DESIGN-TO-CODE COPY DISCIPLINE

After generating and analyzing the reference image(s), implement the website in a copy-oriented way.

This means:
- follow the references closely
- preserve layout logic
- preserve spacing rhythm
- preserve section ordering
- preserve text/image balance
- preserve typography mood
- preserve component style
- preserve overall visual cleanliness

Do not drift into a different design direction during implementation.
Do not “improve” the design by replacing it with a generic coded layout.

The goal is not:
- inspired by the image

The goal is:
- visually faithful to the image, translated into real frontend

---

## 19. ANTI-DRIFT IMPLEMENTATION RULE

A common failure mode is design drift:
the reference images look strong, but the coded result becomes generic.

Strictly avoid that.

During implementation:
- do not simplify into default templates
- do not replace distinctive sections with generic rows
- do not compress generous spacing into dense layout
- do not replace strong typography with plain hierarchy
- do not remove the page’s visual identity for convenience
- do not merge section logic into repetitive patterns that were not present in the source images
- do not reintroduce nested-box complexity that was intentionally removed during analysis

The final coded result should still feel like the same website as the references.

---

## 20. MISSING DETAIL RESOLUTION

When implementing from images, some details may still be unclear.

Resolve ambiguity by following this order:
1. preserve the visible design language
2. preserve layout and spacing logic
3. preserve component family
4. preserve mood and polish level
5. ask the user for a closer or higher-resolution reference if needed
6. if generation was consented to, render the section again as a fresh standalone image
7. only then choose the most implementation-friendly faithful version

Do not fill ambiguity with generic defaults too quickly.

---

## 21. ANTI-AI-SLOP RULES

Strictly avoid these patterns unless explicitly requested.

### Layout slop
- one giant unreadable collage
- endless centered sections
- identical card rows repeated section after section
- cloned left-text/right-image blocks
- fake complexity without hierarchy
- decorative empty space with no purpose
- cards-inside-cards-inside-cards
- giant rounded wrapper sections around everything
- overcompartmentalized dashboard framing

### Visual slop
- default purple/blue AI gradients
- too many glowing edges
- floating blobs everywhere
- glassmorphism stacked without reason
- random futuristic details with no structure
- over-rendered noise that hides the layout

### Typography slop
- giant heading + weak tiny subcopy
- too many font moods
- awkward line breaks
- lazy all-caps everywhere
- generic gradient headline tricks

### Content slop
Avoid generic filler vibes like:
- unleash
- elevate
- revolutionize
- next-gen
- seamless
- transformative platform

Avoid fake brand slop:
- Acme
- Nexus
- Flowbit
- Quantumly
- NovaCore

Avoid fake complexity slop:
- pseudo-enterprise control labels
- decorative system markers
- filler status microcopy
- fake operator / runtime / orchestration jargon unless truly central to the brand

### Density slop
- over-packed sections
- card overload
- tiny spacing between major sections
- visually exhausting walls of content

---

## 22. TYPOGRAPHY-FIRST DISCIPLINE

Typography is a primary design material.

Always ensure:
- clear size contrast
- obvious reading order
- strong display moments
- readable body text
- concise copy
- section headings that reinforce structure

For editorial directions:
- let typography shape composition

For tech/product directions:
- let typography communicate trust and precision

---

## 23. SECTION RHYTHM RULE

A high-end site does not feel like the same block repeated forever.

Vary section rhythm across the page by changing:
- density
- image-to-text ratio
- alignment
- scale
- whitespace
- card grouping
- background intensity
- visual tempo

But:
- keep the page coherent
- keep spacing controlled
- avoid random jumps
- keep each section clean enough to analyze well

---

## 24. DENSITY & SPACING DISCIPLINE

Do not make the website too dense.

The page should breathe.

Rules:
- use even section spacing
- keep major section gaps controlled and intentional
- allow negative space to create calmness
- avoid one section feeling cramped while the next feels empty
- smaller sections should still have enough surrounding space
- prefer analyzable generous spacing over compressed compositions
- do not fill every available area with extra UI
- let simplicity do part of the design work

A premium website should feel:
- open
- composed
- balanced
- confident
- breathable

Not:
- cramped
- noisy
- uneven
- overfilled
- visually exhausting

---

## 25. DEFAULT SECTION PACKS

### 4-section pack
1. Hero
2. Features
3. Social proof / testimonial
4. CTA

### 8-section pack
1. Hero
2. Trust bar
3. Features
4. Product showcase
5. Benefits / use cases
6. Testimonials
7. Pricing
8. CTA

### 12-section pack
1. Hero
2. Trust bar
3. Feature grid
4. Product preview
5. Problem / solution
6. Benefits
7. Workflow
8. Metrics / proof / integration
9. Testimonials
10. Pricing
11. FAQ
12. CTA + footer

Ideally each section has its own readable reference.

---

## 26. MULTI-IMAGE CONSISTENCY RULE

For multi-image websites, enforce:
- same brand world
- same type scale logic
- same spacing discipline
- same CTA styling
- same icon mood
- same image treatment
- same tonal language
- same component family

Image 2, 3, or 8 must not drift into a different website.

---

## 27. CLARITY CHECK

Before finalizing, verify internally:

1. Is the reference source stated (user-provided, local screenshot, consented generation, or brief only)?
2. Have all reference images been deeply analyzed?
3. Was any unreadable detail requested again instead of guessed (or marked approximate)?
4. Is the hierarchy obvious?
5. Is the hero clean enough and readable on a small laptop?
6. Is typography analyzed properly?
7. Are spacing relationships understood properly?
8. Are buttons and components extracted properly?
9. Are colors analyzed properly?
10. Is the result visually faithful to the references, not a generic reinterpretation?
11. Is it free of obvious AI tells?
12. Has unnecessary nested boxing been removed?
13. Have useless pills, labels, and fake technical micro-elements been reduced?
14. Were no external images, fonts or scripts hotlinked (assets are local files or labeled placeholders)?

If not, refine internally before output.

---

## 28. RESPONSE BEHAVIOR

When the user asks to turn a design image into a website, or for a visually important page:
1. infer site type and number of sections
2. collect the references (Section 2 order) and state the source
3. if a reference is unreadable, ask for a better one once instead of guessing
4. choose a coherent visual combination (Section 5) consistent with the references
5. enforce hero cleanliness and a short hero line count
6. reduce unnecessary pills, labels, and micro-UI clutter
7. avoid cards-inside-cards-inside-cards and giant boxed section wrappers
8. deeply and cleanly analyze every reference
9. extract text, typography, spacing, buttons, colors, components, and layout logic
10. implement the website to match the references as closely as reasonably possible, with local assets or labeled placeholders for imagery
11. create the final files only after the full analysis pass
12. verify the result visually (local Playwright screenshots, see `design-workflow`) and compare against the references

Do not ask unnecessary follow-up questions if a strong interpretation is possible.

---

## 29. EXAMPLE INTERPRETATIONS

### Example 1
User: "here is a screenshot of the hero I want, build it" (image attached)

Interpretation:
- source: user-provided image
- analyze headline, subheadline, CTA, spacing, colors, hero media
- if the CTA label is unreadable, ask for a sharper export
- implement the hero, imagery as local assets or labeled placeholders

### Example 2
User: "turn these 8 section mockups into a landing page" (8 images)

Interpretation:
- one reference per section, deeply analyze all 8
- extract text, typography, spacing, buttons, colors, cards, structure
- keep sections open and not overboxed
- implement the full site, then compare screenshots of the build with the mockups

### Example 3
User: "make a premium agency site, no references, use whatever you need"

Interpretation:
- no references and no consent for generation yet: ask once whether an image-generation tool may be used; otherwise proceed from a written design brief and say so

---

## 30. FINAL GOAL

Turn reference images into real frontend that feels premium, art-directed, clear, structured,
readable, memorable and anti-generic, and that stays visually faithful to the references.

Avoid cards-inside-cards-inside-cards. Avoid giant boxed wrappers around every section.
Avoid fake technical pills and decorative micro-labels. Keep the hero clean, spacious,
restrained, and readable on a small laptop. Keep everything offline: local assets, no hotlinks,
no ad-hoc downloads.

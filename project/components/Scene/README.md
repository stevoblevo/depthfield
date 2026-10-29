# Scene

A beat: one screen of the story, at least `scene-beat` (100svh) tall, its words riding over the world.

**Provide** `<section class="df-scene" data-df-chapter>` holding one `df-scene__block`: a ChapterMarker, a `df-lede`, optionally a `df-hint` (in `cue`) and one Button. Put the world canvas behind the beats, not inside them.

**Anchoring** (alternate down the page so the eye travels):
- default: bottom-start, padded `space-9` on top and `scene-pad-bottom` below (room for the HUD);
- `df-scene--top`: top-start, padded `scene-pad-top`;
- `df-scene--end`: right-aligned; the eyebrow rule flips to the right.

**Blocks**: `df-scene__block` stops at `size-measure-lede` (34em); `--narrow` at `size-measure-narrow` (24em) for one-line statements.

**Over art**: add `df-over-art` to the scene (or `<main>`) and display type takes `shadow-type-display`, ledes `shadow-type-lede`. Never set text over the art without it, and never body copy at all.

**Pinned sequences**: `df-pin` around a `df-pin__stage` holds the stage for a whole number of beats (`height: N × 100svh`); offer Skip intro past three beats.

**Reveal**: mark the marker, lede and button `data-df-reveal`; they rise `24px` over `dur-slow` with `ease-out`, `dur-stagger` apart, once.

**Behavior**: beats are inert to the pointer (the art underneath stays interactive); links, buttons and inputs inside them take the pointer back.

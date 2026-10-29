# ChapterMarker

The numbered eyebrow and display title that open every chapter.

**Provide** `<header class="df-chapter">` with a `df-chapter__eyebrow` ("Chapter 02 — Signal"; uppercase is applied) and an `h2.df-chapter__title` (`h1` for the opening scene, set with `df-h-xl` instead).

- Wrap at most one word of the title in `<em>`: it sets in `display-italic` and `accent`, and follows the accent when the weather changes it (`dur-slow`).
- The eyebrow's leading rule is 32px of `accent`; in a right-aligned beat it trails instead.
- Sizes: chapter titles `clamp(48px, 9vw, 96px)` (display-l); the thread skin swaps to Bodoni Moda at `thread-title` sizes automatically.
- Reveal: eyebrow first, then the title, `dur-stagger` apart.

**Don't** emphasize two words; don't use it for sub-sections (use `heading`); don't drop the number: chapters are how people say where they are.

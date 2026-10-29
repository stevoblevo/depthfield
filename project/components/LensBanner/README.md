# LensBanner

The reality lens: a mode that lets the machinery show through. Headings misregister in cyan, magenta and yellow, art goes flat, and every Chip shows what is proved, partial, proposed or missing.

**Provide** a Tool with `data-df-tool="lens"` and a `<div class="df-lens-banner" role="status" hidden><i></i>…</div>` that says what changed. `Depthfield.lens()` toggles `html.df-lens`; Escape turns it off.

- Misregistration uses `lens-c`, `lens-m`, `lens-y` only as text shadows and chip offsets: decoration, never meaning.
- Chips scale 1.06 and take a magenta edge so the status glyphs are the first thing you see.
- Images drop to luminosity so claims are judged without the art.
- The banner sits bottom-centre at `z-lens`, a pill on `surface-raised` with `shadow-banner`.

**Use it** on pages that make claims about real systems (architecture, roadmaps, research), where "is this real yet?" is the reader's question.

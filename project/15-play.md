# Folds and play

A page can hold more than it shows. 2.1 adds five ways to keep something back without hiding it badly: folds, the stack, secrets, the field and pop-ups. Each shipped first in a real page: the stack, the secret, the field and the folded letter in the Maesage e-paper explainer; the pop-up in chapter V of Saelion Storybook.

## Folds

Paper that opens in panels. Use one for something the reader chose to open: a letter, the long version, the receipts. Never the main story.

| Variant | Panels | How it opens |
|---|---|---|
| `df-fold--letter` | 3 | the bottom flap drops, then the top flap lifts; the middle never moves |
| `df-fold--fan` | 2–6 | a strip unrolls downward, one panel every `dur-fold-stagger` |
| `df-fold--gate` | 3 | two doors open from the middle at once; under `bp-medium` it folds like a letter |

- Each panel turns over `dur-fold` (700ms) on `ease-fold`: a slight overshoot, then still. Closing runs in reverse on `ease-in-out`.
- Paper is `surface-raised`. Its back keeps `op-paper-back` (72%) of that and goes the rest of the way to `void`, so a folded panel always shows a darker back. Creases are a hairline of `ink` at 16%.
- The tab is the paper's own dog-ear: a mono uppercase label on `surface-raised` with its top-right corner turned down. Say what is inside and how much: "1 letter", "The receipts · 4".
- Markup is a `<details>`: closed content stays out of the tab order and reads with JS off. Escape folds it back and returns focus to the tab.
- One fold open per screen. Reduced motion: panels appear flat; nothing turns.

## The stack

An exploded cross-section: the layers of a thing, skin out, lying in 3D. It opens as it scrolls into view, from `depth-stack-min` (12px) to `depth-stack-max` (56px) between planes, capped at 17% of the plane on phones, and stays open.

- A legend beside it names each plane, numbered in stack order, outermost first. Hovering or focusing a row lifts that plane 18px, rings it in `accent` and pulls focus: neighbours blur by distance (`blur-dof-1`, `-2`, `-3`). This is the depth-of-field rule from Depth, applied to a diagram.
- Seven planes at most. Each plane is one material drawn in CSS, quiet enough that its number reads.
- Reduced motion: the stack holds at 80% open; focus still blurs; nothing slides.

## Secrets

A hidden mode that shows itself in stages, so a reader who misses it is guided to it instead of locked out.

| Stage | When | What changes |
|---|---|---|
| 0 hidden | load | nothing |
| 1 glyph | `after` (40s), or the `revealAt` element enters view | an unlabeled `cue` diamond appears beside the tools and blinks every seven seconds; the echo appears |
| 2 named | `nameAfter` (30s) later, or the `watch` element comes back into view | the chip gains its name, flashes four times, and the hint line says where it is |
| 3 opened | a press on the chip or the echo, or the `word` typed anywhere | the mode opens; `df:secret:<id>` is remembered, so the next visit starts named |

- The echo is a second door somewhere quieter: a separator dot in the footer that turns into a diamond. One echo at most.
- The word is the mode's own name, four to six letters, never a password. Typing inside a field never counts.
- The hint is one line in the page's status voice: "Something in the scale field is alive. Try the small diamond next to Touch trace."
- Never time-limit a secret, never put something a reader needs behind one, never announce it with a modal.

## The field

A lattice of cells that each hold their state at zero power: the e-paper idea as a canvas. Diamond cells (a square grid turned 45 degrees, so standard Life patterns work) or square cells, with Life (B3/S23) built in.

- Cells flip through a dark frame on the way to their new state, the way e-paper redraws. Demo pace is `dur-generation` (420ms a generation); real film needs seconds, and the page says so.
- Count what costs: a readout of the generation, live cells and redraws this step. A settled pattern reads "settled, zero power to hold".
- Pressing plants live cells under the pointer. A field that paints takes touch, so keep it shorter than the window.
- Room light dims every cell toward `void`: reflective surfaces fade in the dark; emissive cues drawn over them do not.

## Pop-ups

A spread whose pieces stand up as the book opens. `--df-open` runs from 0 (shut) to 1 (flat) on `.df-popup`; the left page turns on the gutter and every piece rotates to stand at 90° × its `--lift`.

- The book leans back `depth-popup-tilt` (58°): enough to see pieces stand, not so much that the page disappears. It is never wider than `size-popup`.
- Pieces sit in rows, back row nearest the gutter's far edge, front row nearest the reader. A piece that should lean gets a `--lift` under 1.
- It opens by itself once, over `dur-scene`. After that the reader drags it (left opens, right shuts) or uses the controls. Turning to the next spread folds the pieces down, swaps the spread and opens again, `dur-fold` each way.
- Text never stands up. Captions sit under the book, in DOM order, so the spread reads with JS off.
- Reduced motion: the book is open; turning cuts.

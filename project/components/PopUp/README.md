# PopUp

A spread whose pieces stand up as the book opens: chapters that unfold instead of scroll.

**Provide** `<div class="df-popup" data-df-popup>` → `<div class="df-popup__book" aria-hidden="true">` → `<div class="df-popup__page df-popup__page--left">` and `--right`, each holding pieces: `<div class="df-popup__piece" style="--x:12%;--y:18%;--w:30%;--lift:1">` with art inside (an image, a drawn shape). Under the book, a `df-popup__caption` with the spread's words, and controls (Open, Shut, Next spread). `Depthfield.init()` binds `[data-df-popup]` (`data-df-popup="shut"` waits closed); or call `Depthfield.popup(el, { open, auto, delay })` and drive it with `.open()`, `.close()` and `.to(value, ms, done)`.

- `--df-open` runs from 0 (shut) to 1 (flat). The left page turns on the gutter; each piece stands at 90° × `--lift`.
- The book leans back `depth-popup-tilt` (58°) and is never wider than `size-popup`.
- It opens by itself once, over `dur-scene`. Dragging opens (left) and shuts (right) and snaps to the nearer end. A next spread folds the pieces down, swaps the content and opens again, `dur-fold` each way.
- Pieces sit in rows: back row near the far edge, front row nearest the reader. Text never stands up.

**Accessibility**: the book is `aria-hidden` decoration; the caption and controls are the content, in DOM order, and read with JS off. Every drag has a button twin. Reduced motion: the book is open; turning cuts.

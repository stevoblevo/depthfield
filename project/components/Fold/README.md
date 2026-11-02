# Fold

Paper that opens in panels, for something the reader chose to open: a letter, the long version, the receipts.

**Provide** `<details class="df-fold df-fold--letter">` → `<summary class="df-fold__tab">` (a mono label that says what is inside and how much: "1 letter", "The receipts · 4") → `<div class="df-fold__panels">` → one `<div class="df-fold__panel">` per panel. `Depthfield.init()` binds every `details.df-fold`; or call `Depthfield.fold(details)`.

- `df-fold--letter`: three panels; the bottom flap drops, then the top flap lifts. `df-fold--fan`: two to six panels unroll downward. `df-fold--gate`: two doors open from the middle; under `bp-medium` it folds like a letter.
- Panels turn over `dur-fold` on `ease-fold`, `dur-fold-stagger` apart; closing reverses on `ease-in-out`.
- Paper is `surface-raised`; its back keeps `op-paper-back` of it and darkens toward `void`; creases are a 16% `ink` hairline.
- One open per screen. Never the main story.

**Accessibility**: a real `<details>`, so the tab is a button to assistive tech, closed panels leave the tab order and the content reads with JS off. Escape folds it back and returns focus to the tab. Reduced motion: no turning.

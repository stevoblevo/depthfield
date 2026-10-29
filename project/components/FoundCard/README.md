# FoundCard

The discovery toast: a kicker with the running count, the find's name, a one-line definition and one true fact.

**Provide** `<div class="df-found" role="status" aria-live="polite">` with `df-found__kicker`, `df-found__title`, `df-found__line`, `df-found__fact` and an optional `df-found__more` ("also: octave, just major third"). Queue finds with `Depthfield.found(el).show({kicker, title, line, fact, more})`.

- Top-left at `z-overlay`, 340px max; `scrim` with `blur-backdrop`; rises 8px over `dur-base` and stays six seconds, one at a time.
- Kicker: `DISCOVERED · 16/111` in `accent` mono caps. Title in the display face, italic.
- Hold toasts while a guided tour runs on phones; show the batch at the end ("also: …").

**Don't** toast for things the reader did not do or find.

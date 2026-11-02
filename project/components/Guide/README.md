# Guide

The "find N" pattern as an API: a count, one hint at a time for the next thing not yet found, and memory between visits.

**Provide** a HudChip for the count and a `df-hint` line; call `Depthfield.guide({ id, steps: [{ id, hint }], count, hint, label, done, onFind, onDone })` → `{ find(id), has(id), count(), next(), reset(), total }`. Call `find()` from wherever the thing happens (a pluck, a hotspot, a typed word).

- The count reads "found **2** / 8". The hint always names the next step not yet found, in order, so a reader who misses one is guided to it instead of left out.
- Order the steps from obvious to hidden. The last can be a secret (Secret); its hint names where to look, never the answer.
- When the count is full the hint closes the loop: "All 8 found. The page is yours."
- Found steps are kept in local storage as `df:guide:<id>`. `find()` fires `df:guide` and a confirmation haptic, and returns false for anything already found.

**Accessibility**: the count and the hint are text. Nothing a reader needs is behind a step. Never put a timer on finding.

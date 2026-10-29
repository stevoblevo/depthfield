# CursorRing

A ring that follows a mouse pointer and grows over things you can press: a quiet cue that the art is interactive.

**Provide** nothing: `Depthfield.cursor()` (or `init({cursor: true})`) adds it for fine pointers only. Add `data-df-cursor` to anything else that should grow it.

- 28px `cue` ring at 1.5px, lagging the pointer by a quarter each frame; 48px in `accent` over a link, button or hotspot.
- `z-cursor`; never on touch, never with reduced motion; the system cursor stays visible (over the world it is a crosshair).

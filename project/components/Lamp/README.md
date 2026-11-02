# Lamp

One warm light that follows the hand, and a room light that dims everything reflective while cues that make their own light stay bright.

**Provide** an element to light (the page by default) and, if the reader may dim the room, a range input. Put `data-df-room` on that input and `Depthfield.init()` lights the page with it; or call `Depthfield.lamp(el, { input, radius, floor, onMove })`. Paint the pool with `df-lamp-pool`, which reads the custom properties the lamp writes on `el`: `--df-lamp-x`, `--df-lamp-y` and `--df-room`.

- `lamp.light(u, v)` (0–1 across the element) is how lit a reflective thing is there: the room level, falling from full under the lamp to `op-lamp-floor` far away. Draw paper, e-paper, pigment and ink with it.
- Emissive things (cues, LEDs, the guardian, the cloth's threads) ignore it. That split is the point: in a dark room, reflective surfaces fade and only light that is emitted carries a cue.
- The lamp lags the pointer at `depth-follow`, so it feels like a lamp on an arm, not a cursor. `lamp.at(u, v)` aims it from code (a reel, a guided tour).
- Color: `lamp` for the pool, never for text.

**Accessibility**: decoration; nothing is only visible under the lamp. The room slider is a labelled Slider. Reduced motion: the lamp jumps instead of drifting.

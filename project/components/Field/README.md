# Field

A lattice of cells that each hold their state at zero power, the e-paper idea as a canvas, with Conway's Life built in.

**Provide** `<canvas class="df-field" data-df-field="diamond" aria-label="…">` (or `"square"`), and under it a `df-field-bar` of mono Buttons (Pause, Step, Soup, Clear) with a `df-field-stats` readout. `Depthfield.init()` starts every `canvas[data-df-field]` (its API on `canvas.__dfField`); or call `Depthfield.field(canvas, { lattice, cell, pace, light, on, off, onStep })`.

- Diamond cells are a square grid turned 45 degrees, so standard Life patterns (gliders, blinkers) work; each cell has eight neighbours, four along its edges and four at its corners.
- Cells flip through a dark frame, the way e-paper redraws. Demo pace is `dur-generation`; real film needs seconds, so offer that pace too and say so.
- The readout counts the generation, live cells and redraws; a settled pattern reads "settled, zero power to hold".
- Pressing plants live cells; `light` (0–1) dims everything toward `void`, the way reflective surfaces fade in a dark room.

**Accessibility**: the canvas is decoration with a short label; the controls and the readout carry the content. A field that paints takes touch, so keep it shorter than the window. Reduced motion: it starts paused and steps on demand.

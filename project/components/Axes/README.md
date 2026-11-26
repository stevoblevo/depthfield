# Axes

The five-axis strip: x, depth, time, look and memory on one line, each with a slider and a readout. It is the second way into a world: whatever a hand can do on the canvas (turn, descend, hold, change the weather, leave a mark), a keyboard and a screen reader can do from here.

**Provide** `components/axes.js` after `bundle.js`, or alone; it carries its own few rules and reads the kit's tokens where they exist. Then `var strip = Depthfield.axes(el, state)` and `strip.update()` once a frame.

- `el` is an empty element (the strip is built in it) or one that already holds `[data-axis]` rows, each a `<label>`, an `<input type="range">` and an `<output>`. Write the rows in the page when the words should be there without JavaScript.
- `state` is a plain object `{ x, depth, time, look, memory }`. The strip reads it on every `update()` and writes it when a slider moves. Leave it `null` and give `opts.get(id)` and `opts.set(id, value)` when the numbers live somewhere else, or when setting one has to do more than store it (ease a camera, stop an autoplay).
- `opts.text(id, value)` returns the readout: `042%`, `×1.00`, `rain`, `07`. A readout says the value in the world's own terms, never a bare float where a word exists.
- `opts.axes` renames, re-ranges or drops axes: `[{ id, label, min, max, step }]`. The default five are x −1…1, depth 0…1, time −1…1, look 0…6 (the seven looks) and memory 0…1.
- `strip.update(live)` takes the id of the axis the scene is teaching now. That one axis takes the accent; the others stay in ink. One accent per strip.
- `opts.readonly: true` makes a readout that cannot be moved. `strip.destroy()` unbinds it.

Where it goes: along the bottom edge, inside the HUD's gutter, under the words and never over the subject. On a phone it is the full width; from 760px give it a fixed width of about 500px. The strip does not place itself.

**Accessibility**: each axis is a native range input with a label, so arrow keys step it, and its readout is also its `aria-valuetext`. The strip is a group named "Five axes" (or `opts.label`). Hit area is 30px tall inside a 72px strip; do not shrink it. Nothing in it moves on its own except the thumbs following the world.

First used by The Void (`family/void/`), where each chapter teaches one axis.

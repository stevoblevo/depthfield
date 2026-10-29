# WorldCanvas

The world behind the words: one full-bleed canvas of sky, a pointer-led sun, light shafts, three ridges with haze, particles that part around you, ripples where you press, and a vignette. Scrolling is the camera descending.

**Provide** `<canvas class="df-world" data-df-world="glasshouse" aria-hidden="true">` as the first child of `<body>` (or `Depthfield.world(canvas, options)`), and a static poster image for no-JS (`df-world-poster`).

**Modes**
- `glasshouse`: the mint world. The palette moves from deep mint to frost over the scroll (`gh-*` tokens); shafts and haze on.
- `weather`: the peach world. Four keyframes across the scroll (Weather); with `eye: true` the eye opens on the back ridge in the mint clearing. The page's `accent` follows the weather.

**Depth** (tokens): planes shift `depth-pointer-back/mid/front` (18/36/64px) across the pointer's travel and sink `depth-sink-*` (60/130/220px) over the scroll; the planes ease after the pointer at `depth-follow`. Tilt adds to the pointer (`depth-tilt-gain`).

**Hooks**: `draw(ctx, plane)` paints your own things on each plane (doors, landmarks); `ridgeY(plane, x)` tells you where the ground is; `ripple(x, y)`, `setWeather(n)`, `setScroll(s)`, `setTilt(x, y)`, `redraw()`.

**Performance**: device pixel ratio is capped at 2; particles at `W×H/7000` (max 240); the loop pauses when the tab is hidden.

**Reduced motion**: no loop; the world draws once per scroll, resize or press, with particles still.

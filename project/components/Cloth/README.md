# Cloth

A woven cloth on a canvas: warp threads you can pluck, a weft you can pull, hung on a loom (`hang`) or laid down as land under the weather (`lay`).

**Provide** `<canvas data-df-cloth="hang" data-df-threads="#threads" data-df-bands="#bands" aria-label="…">` inside a sized `df-cloth-wrap`, and two lists. `#threads` is a `ul.df-threads` of `<li data-color="#…"><a href="…">Name</a></li>`, one per warp thread; `#bands` lists the weft bands the same way (a `<b>` name is enough). `Depthfield.init()` starts it (its API on `canvas.__dfCloth`), or call `Depthfield.cloth(canvas, { threads, bands, view, weather, onPluck, onPull, onReject, onHold, onHover, frame })`.

- The lists are the content. Keep them in the page (visible, or as a drawer or index); the cloth is a picture of them. With JS off, the list is what reads.
- Threads sit on every other warp column; a cloth holds up to 40. Bands split the weft rows evenly, top to bottom.
- On load the cloth weaves itself over `dur-weave`: the warp drops from the beam, then a shuttle lays each weft row, alternating sides.
- Tap a thread to pluck it: it rings over `dur-pluck` and, if sound is on, plays its note on the Bohlen–Pierce scale (`Depthfield.tone`). Drag to pull; past `rejectAt` (42% of the short side) the cloth lets go and springs back. Hold still for two seconds to feel it pulse (`onHold`).
- `setView('lay')` tips the same cloth back by `depth-cloth-pitch` into hills under the weather (`setWeather(0–3)`: peach fall, red rain, mint clearing, night garden); threads become pennants.
- Events: `df:cloth` with `{type: 'pluck' | 'pull' | 'reject' | 'view' | 'weather'}`.

**Accessibility**: the canvas is a picture with a label; the thread list carries every link and name. Never put something only on the cloth. Reduced motion: no weaving, no wind; views cut; the cloth redraws only while it settles.

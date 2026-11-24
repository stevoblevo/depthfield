# Plate

One drawing, made in a night material. Give it a canvas of flat fills on transparency and it returns a new canvas: nothing is redrawn by hand.

**Provide** a source canvas. Call `Depthfield.plate(mode, source, options)` and place the canvas it returns.

- `scan`: the drawing's contours in `art-accent` with a soft glow, over a faint grid on `art-void`, the fill at 14%. A mono label sits bottom left; `readout` adds a line top left. Use it for specimens, maps and anything measured.
- `stage`: a footlit shadow play. The drawing becomes a silhouette with an `art-ink` rim, two puppet rods, hanging stars and a warm floor light. Use it for characters and stories told at night.
- `Depthfield.tint(source, colour)` and `Depthfield.edges(source, rgb, gain)` are the two helpers the family shares; other systems build their own materials from them.
- One accent per plate: the readout on a scan, the hanging star on a stage. Do not add a second.
- A plate is still. It needs no reduced-motion branch. Give the canvas `role="img"` and an `aria-label` that names the subject and the material.

Family task F9; the recipes come from Reignfawn's field journal (`stevoblevo/reignfawn`, `docs/look-media.md`).

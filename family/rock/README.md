# Saelion Rock

One small island, drawn once, and made in seventeen materials by the three kits, live. It is a sketch for the family's next step (task F11 in `docs/family.md`): the plate, which makes a still drawing in a look's material, becomes a material that runs on the GPU every frame over a living scene.

Open <https://saelion.co/rock> (short link `/sr`; each version keeps its own address, the first is `/rock/v0.1`), or `family/rock/` on the kits' site. The toolkit shelf at <https://saelion.co/toolkit> has a way in. A self-contained copy is also the Claude artifact <https://claude.ai/artifact/MZF9FaDkNqypZYd7yfFzqM>.

The saelion.co copy is the inline build (`build.py out.html inline`), published from `stevoblevo/saelion-relay-canary` (`rock/`). To publish a new version: bump the number in `src/shell.html`, build inline, add `rock/v<x.y>/index.html` there and replace `rock/index.html`; never rewrite a published version.

## What you do

- Drag sideways to walk round the island. Pinch or use the wheel to come nearer.
- Drag up or down to move the sun. Day is Storeybrook, dusk is Hypermetapunk, night is Depthfield; the look changes with the hour, spreading out from the sun.
- The chips pick any of the sixteen looks. Cross the day once (day, dusk, night) and the seventeenth opens: Deep, a single-image stereogram made from the depth buffer.
- Tap the star and the seal heads it. Each touch in the air rings one step higher; thirteen touches is a whole tritave.
- Sound is off until you switch it on. One sequence, three arrangements by the look's mood (still, impact, lit), in 13 steps of the tritave (Bohlen-Pierce) or the ordinary 12.
- The strip above the chips reads the five axes: where you stand, how near, the hour, the look, and how many looks you have worn.

## How it is made

1. **The one drawing.** The scene is low-poly triangles of one flat colour each (`src/scene.js`): the island, the sea, a lighthouse, a seal on a rock balancing a star, pines, a kite, a paper boat, three cranes, clouds. It is drawn once a frame into a G-buffer: flat colour, facet normal, shadow, depth. That is the same rule as the plate's source canvas: flat fills, nothing else.
2. **The looks.** Each look is a material in `src/shaders.js`, a process over that drawing and never a redraw, following its kit's plate: a wash, lamplight, brush ink, print, cut paper and cross-stitch for Storeybrook; a neon halftone, a xerox with one red and a solid cut for Hypermetapunk; four weathers of ridges, a scan and a stage for Depthfield. Each paints its own sky and sun.
3. **The inks.** Every colour a material uses is a token of its kit, read from the three `tokens.json` files when the page is built (`src/palettes.py`). The looks' names and moods are the kits' own.
4. **The pets.** The creatures on the beach are drawn each frame by the kits' own `pets.js` add-ons (Storeybrook 1.5.0, Hypermetapunk 0.5.0, Depthfield 2.5.0), stood up in the world as cut-outs. They keep their own inks and take the look's line.
5. **Edges.** A silhouette is found from the second difference of depth, which is zero on any flat surface however steeply it is seen; a crease is a step in the facet normal.

## What it is not

- The materials are new shaders written for this page. They are not yet part of any kit: moving each into its kit as an add-on (`media.js`) is task F11.
- Nobody has listened to the sound. The levels were set by reasoning, and the test only confirmed that the sequencer runs.
- It was checked in headless Chromium on a software renderer, at desktop and phone sizes. It has not been run on a real phone or in Safari.
- It needs WebGL 2 and says so plainly where there is none.

## Build

```
python3 -I family/rock/src/build.py                    # writes family/rock/index.html; the pets are pinned by address
python3 -I family/rock/src/build.py out.html inline    # one self-contained file, the pets inlined
```
The build reads `project/tokens.json` from the three kits, which it expects beside this repository (`../storeybrook`, `../hypermetapunk`); set `STOREYBROOK` or `HYPERMETAPUNK` to point elsewhere. `index.html` is generated: change the files in `src/` and build.

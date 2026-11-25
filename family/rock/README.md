# Saelion Rock

One small island, drawn once, and made in seventeen materials by the three kits, live. It is a sketch for the family's next step (task F11 in `docs/family.md`): the plate, which makes a still drawing in a look's material, becomes a material that runs on the GPU every frame over a living scene.

Open <https://saelion.co/rock> (short link `/sr`; each version keeps its own address, the first is `/rock/v0.1`), or `family/rock/` on the kits' site. The toolkit shelf at <https://saelion.co/toolkit> has a way in. A self-contained copy is also the Claude artifact <https://claude.ai/artifact/MZF9FaDkNqypZYd7yfFzqM>.

The saelion.co copy is the inline build (`build.py out.html inline`), published from `stevoblevo/saelion-relay-canary` (`rock/`). To publish a new version: bump the number in `src/shell.html`, build inline, add `rock/v<x.y>/index.html` there and replace `rock/index.html`; never rewrite a published version.

## Versions

- **0.4** (25 Nov 2026). A third tuning, from Bleve's project brief, which names Bohlen-Pierce 13 and 10-tone equal temperament side by side. The tuning button now cycles 13 steps of the tritave, the ordinary 12, and 10 equal steps of the octave (120 cents each). In 10 the chord is a neutral triad (0, 360 and 720 cents, between minor and major) and the progression moves by 4, 6 and 3 steps; the juggle's thirteen touches climb the octave. Measured offline: the 10-step arrangement sits at the level of the other two, no clipping.
- **0.3** (25 Nov 2026). A sound fix found by recording the music offline (the first time anyone measured it). With sound on and the page hidden (a locked phone, another tab), the scheduler stopped while the audio clock ran on, and coming back fired every missed note at once: 170 oscillators after 30 s away. Now the sound sleeps while the page is hidden and the scheduler skips what it missed. Levels measured: peak about -6 dBFS, no clipping. Nothing else changed; the card is still `card-0.2.jpg`.
- **0.2** (25 Nov 2026). Bleve: "a few looks still need work, mostly Hypermetapunk." The three Hypermetapunk materials are rewritten. Dusk lights each form twice, warm from the sun's side and cyan from the other, in four toner steps with dots between them, under one thin tube line; the sun has its slits. Zine keeps the one red for the sun, the lamp and what was red to begin with, and puts the middle tones through a coarse dot screen instead of flooding the sea with the spot colour. High contrast cuts every facet to ink or void by one light that stays over your shoulder, with a single acid keyline and sea lines of one weight. Also: Skein silk is full crosses on land and half stitches on the sea, with stronger thread; Ink Blot's sea is quiet; the four Depthfield weathers pick the island out with a rim and a shadow. A new helper, `shoulderL()`, is a light tied to the eye, for looks that must read whichever way the sun is.
- **0.1** (25 Nov 2026). First version. Kept at <https://saelion.co/rock/v0.1>.

## Open, from the 25 Nov Dora pass

Take one: put your name on it in `docs/family.md` (F11 row) or open a branch.

- **Repin "One drawing, sixteen looks" to Hypermetapunk 0.5.2** once <https://github.com/stevoblevo/hypermetapunk/pull/8> is merged. `family/index.html` loads `/hypermetapunk/v/0.5.0/plate.js`, so the family page keeps the old Zine (every middle tone in red) until it is repinned. Do not repin before that merge: `/v/0.5.2/` does not exist on the kits' site until then.
- **A real iPhone.** WebKit 26.6 (Safari's engine, on Linux) runs 0.3 with WebGL 2, the pets, every look and touch drags, and no console errors or warnings. A real phone has not run it, and frame rate on a phone GPU is unknown. Bleve's tap.
- **Listen.** The sequencer was rendered offline to a file (still, impact and lit in the tritave, still in 12 and in 10 steps, then the 13-touch juggle climb), and sent to Bleve. Bleve's ears.
- **F11**: move the materials into the kits as `media.js`, so a game can wear a look without this page.
- ~~A third tuning~~: done in 0.4.
- **Testing note**: the help panel covers the middle of the screen for the first 11 seconds, so a scripted drag there hits the panel, not the island.

## What you do

- Drag sideways to walk round the island. Pinch or use the wheel to come nearer.
- Drag up or down to move the sun. Day is Storeybrook, dusk is Hypermetapunk, night is Depthfield; the look changes with the hour, spreading out from the sun.
- The chips pick any of the sixteen looks. Cross the day once (day, dusk, night) and the seventeenth opens: Deep, a single-image stereogram made from the depth buffer.
- Tap the star and the seal heads it. Each touch in the air rings one step higher; thirteen touches is a whole tritave.
- Sound is off until you switch it on. One sequence, three arrangements by the look's mood (still, impact, lit), in 13 steps of the tritave (Bohlen-Pierce), the ordinary 12, or 10 equal steps of the octave (the tuning button cycles them).
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

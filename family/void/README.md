# The Void

A descent under the page. Depthfield grounds every page on a color token named `void` (`#07110f`); this page goes under it. Six beats, one for each sign people use for nothing, and each chapter teaches one of the five axes of a Depthfield world (plan task D2).

Open <https://saelion.co/void> (each version keeps its own address, the first public one is `/void/v0.2`), or `family/void/` on the kits' site. A copy is also the Claude artifact <https://claude.ai/artifact/MTibnHzH7xTDYb8RfkBFWk>.

| Beat | Sign | Axis | Hand | Second way in |
| --- | --- | --- | --- | --- |
| 00 The void | the name, `--void` | (depth) | swipe up, scroll | ↓ ↑, Descend, the depth slider |
| 01 The gap `#gap` | zeros of up to nineteen scripts, one ring each; the gap you part is the one none can write | x | swipe sideways | ← →, the x slider |
| 02 The vanishing point `#vanishing-point` | the zero of pictures | depth | keep falling | the same |
| 03 The rest `#rest` | the zero of music | time | press and hold | Space; the time slider also runs it backwards |
| 04 The pupil `#pupil` | a hole; *pupilla*, the little doll | look | hold still and it opens; it follows the pointer and blinks when tapped | L, the look slider |
| 05 The trace `#trace` | what you left | memory | tap leaves a mark | M, the memory slider, Forget in the Index |

## Versions

- **0.2** (25 Nov 2026). The first public version. The strip is now the kit's own add-on, `project/components/axes.js`, inlined at build time. Each chapter has an address (`#gap` … `#trace`) that a link opens at and that follows the descent. At the bottom the trace plays back: the thread reaches each mark in the order it was made and the mark rings again. The sound sleeps while the page is hidden. Safe areas on phones, a share card, links out from the Index. The sound was rendered offline for the first time: a fall from top to bottom with marks rung on the way peaks at about −5 dBFS, no clipping.
- **0.1** (24 Nov 2026). The first version, as a Claude artifact only.

## How it is made

One fixed scene in three.js r128, drawn to a render target and finished by one lens pass.

- **The floor.** The kit's sky, sun, seven shafts and three ridges in one fragment shader. The ridges sink, nearest fastest, then the horizon leaves by the top.
- **The shaft.** Noise in log-polar space, scrolled by the depth, so it has no bottom to run out of.
- **The zeros.** Instanced billboards from a canvas atlas. A script the device has no glyph for is dropped (the probe looks for the missing-glyph box). The pointer parts them in screen space within the kit's 118px. Focus follows the pointer; the blur is the atlas's own mipmaps, picked by a bias.
- **The vanishing point.** Pentagon frames with helix rails, a pentagram every sixth. A dolly zoom holds the hole's apparent size at 1.00× through the chapter: the lens widens as fast as the camera falls, and the readout shows it.
- **The rain.** Wraps around the camera. A hold eases the clock to zero and the streaks shrink to beads.
- **The lens pass.** A gravitational-lens warp around the hole, a fringe toward the corners, the photon ring, the drawn eye (lids, iris fibres, pupil, a glint, and the small light that is your pointer), a vignette to `art-void`, and a dither. At depth 5.0 the canvas is exactly `rgb(7, 17, 15)`; the check reads the pixels.
- **The looks.** The kit's four weathers (mint, peach fall, red rain, night garden) and thread. Left on auto, the look follows the descent.
- **Memory.** Marks are kept in `localStorage` (`df5d:void:marks`), in this browser and nowhere else. On a later visit the earlier ones hang dimmer in the shaft.
- **Sound** (off until switched on). A Shepard–Risset glissando tied to the depth, over a layer a harmonic seventh (7/4) above. A mark rings a harmonic from 8 to 16 of 55 Hz, chosen by where you tap. A hold is a rest.
- **The reel.** "Watch the whole fall" in the Index plays it by itself and waits at the eye. Any touch hands it back.
- **The strip** is `Depthfield.axes` (see the Axes page in the docs).

Frame rate is held before resolution: if frames run long, the render scale drops in steps to a half. Under reduced motion the ambient motion stops and the eye opens at once. Without WebGL or JavaScript the same words read as a column over a still.

## What it is not

- The eye is drawn. It follows the pointer and nothing else. The page has no camera and no microphone and sends nothing anywhere.
- Nobody has listened to the sound. Its levels were measured from an offline render, not judged by ear.
- It was checked in headless Chrome on a software renderer, at phone and desktop sizes. It has not been run on a real phone or in Safari, so its frame rate there is unknown.
- The zeros depend on the device's fonts. The test machine had few; a phone should show most of the nineteen.

## Build and check

```
python3 -I family/void/src/build.py                      # writes family/void/index.html, one self-contained file
python3 -I family/void/src/build.py out.html artifact    # three.js from cdnjs, for the Claude artifact
node family/void/test/check.js                           # 21 checks in headless Chrome (needs Playwright; sharp for the pixel check)
node family/void/test/card.js card.jpg                   # the 1200 x 630 share card, from the page itself
```
`index.html` is generated: change `src/shell.html` or `project/components/axes.js` and build. `src/vendor/three-r128.min.js` is three.js r128 (MIT), unchanged.

To publish a new version on saelion.co: bump `Depthfield5D.version` and the line in the Index in `src/shell.html`, build, add `void/v<x.y>/index.html` in `stevoblevo/saelion-relay-canary` and replace `void/index.html`; never rewrite a published version. A new card gets a new file name.

## Open

- A real phone and Safari. Bleve's tap.
- Listen to it. Bleve's ears.
- A day face for the art itself (Storeybrook paper), not only the chrome.
- Mount `Depthfield.axes` in Reignfawn 0.11.0 and AND SO's lattice (the rest of D2's purpose).

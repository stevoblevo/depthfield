# The world

The world is one full-bleed canvas behind the words: the picture is the page, and the art itself is the interface. It is generated, so it is light to ship and can be replaced by concept art or video without breaking anything built on it.

## Anatomy, back to front

1. **Sky**: a vertical gradient (`*-sky-top` to `*-sky-low`; the weather sky ends at 85% of the height).
2. **Sun**: a radial glow led by the pointer (and a disc in weather worlds); it sits lower as the camera descends.
3. **Light shafts** (glasshouse): seven additive shafts from the sun, `op-shaft`.
4. **Stars** (night garden): ninety points that twinkle with the weather's weight.
5. **Three ridges**: noise silhouettes with a rim light and, in the glasshouse, a haze band; they shift with the pointer and sink with the scroll (Depth).
6. **Things on the ridges**: the eye on the back ridge, doors on the middle ridge, hotspots on any of them; drawn with the `draw` hook at their plane.
7. **Particles**: motes in the glasshouse; petals, rain, motes or fireflies by weather. They part around the pointer and ride the ripples.
8. **Ripples**: a ring from every press, in the rim hue.
9. **Vignette**: the corners fall to `art-void`.

## Two worlds

| Mode | Palette | Moves over the scroll | Signature |
|---|---|---|---|
| `glasshouse` | `gh-*`: deep mint to frost | the palette brightens, the haze thins, the ridges sink | light shafts that follow the cursor; three hidden spores |
| `weather` | `wx-*`: four keyframes | peach fall, red rain, mint clearing, night garden | the eye; three doors at the end |

Start one with `<canvas class="df-world" data-df-world="glasshouse" aria-hidden="true">` and `Depthfield.init()`, or `Depthfield.world(canvas, { mode, eye, draw, onWeather })`.

## Rules

- One world per page, behind everything (`z-scene`), fixed to the window. Previews and cards use `df-world--contained`.
- The art is decoration to assistive tech (`aria-hidden`). Everything the art says or does is also a button, a link or a sentence.
- Words over the world: display lines, ledes and hints only, in a scene marked `df-over-art`, placed where the world is dark (low ridges, upper sky), never over the sun.
- The art keeps its own light in both faces; the day face changes the chrome around it.
- Give every world a poster (`df-world-poster`, a still of its opening frame) for no-JS and as the reduced-data fallback.
- Keep the world quiet while text is being read: no new events in it while a beat's text is mid-reveal.

## Placing things in the world

- `world.ridgeY(plane, x)` gives the ground height at `x` on a plane; put landmarks a little above it so they sink and parallax with that ridge.
- The `draw(ctx, plane)` hook runs after each ridge is painted: draw doors on plane 1, the eye on plane 0, nothing on plane 2 (it is too close).
- Hotspots (`Depthfield.hotspots`) take `{u, v, plane}` and stay pinned to their plane as it moves.

## Replacing the art

Swap the generated world for concept art, a render or video and keep everything else: keep the three-plane idea (a back, a middle and a front layer), keep the dark band where words sit, keep the hotspots' coordinates, and keep a poster. Video loops are muted, paused under reduced motion, and never carry information.

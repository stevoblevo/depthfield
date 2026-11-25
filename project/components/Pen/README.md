# Pen

A look's inks and its world for canvas: `Depthfield.pen(look)` resolves the look's colours to RGB and draws the sky, the sun, the stars and the three ridges, so a game drawn on canvas stands in the same world as the page around it.

**Provide** `components/pen.js` after `bundle.js`, or alone: a single-file game needs nothing else, and the pen reads no CSS. Then `var P = Depthfield.pen('night')` (a look id, an element whose look to use, or nothing for the page's look) → `{ look, name, light, inks, rgb(name, a), weathers, weather(wx), sky(ctx, o), sun(ctx, o), stars(ctx, o), ridgeY(n, x, o), ridges(ctx, o), haze(ctx, o), vignette(ctx, o), world(ctx, o), rim(ctx, src, x, y, o) }`.

- `P.inks` holds every colour token as `[r, g, b]` (`[r, g, b, a]` for the few with alpha), with references such as `accent` already followed. Ask for a colour by its token name, never by a hex value: `P.rgb('art-accent', 0.6)`.
- `P.weather(wx)` gives a weather's palette (`sky`, `sun`, `ridge`, `rim`). `wx` is `peach`, `rain`, `mint` or `night`, a number from 0 to 3 that blends between neighbours (the way the showcase's sky changes down the page), or four weights `[peach, rain, mint, night]` that blend any of them, for a game whose weather follows its music. Each look has a weather of its own when none is asked for.
- `P.sky`, `P.sun`, `P.stars`, `P.ridges`, `P.haze` and `P.vignette` each take a box (`x, y, w, h`) and a `weather`. `P.ridges` takes `t` in seconds (the ridges breathe; they hold still under reduced motion or when the pen was made with `{ still: true }`), `par` from -0.5 to 0.5 to slide the three planes past each other, and `from` and `to` to draw only some of them, so a game can put its own things between the far ridge and the near one.
- `P.ridgeY(n, x, o)` says where ridge `n` stands at `x`, for placing things on it.
- `P.world(ctx, { w, h, weather, t, par })` does the whole scene in one call.
- `P.rim(ctx, src, x, y, { w, h, lx, ly, weather, ground, amount, alpha })` (2.4.0) lights a creature drawn anywhere else (a canvas or an image) as if it stood in this night: it draws `src` centred at `x, y` at `w × h`, with a moonlit rim on the side facing the light at `lx, ly` (put the moon there), a thin highlight just inside that edge and, when `ground` is given, a soft contact shadow on the ground below. The rim takes the weather's rim ink: frost in the night garden, mint in the mint clearing. `amount` from 0 to 1 sets how strong the rim is. It works on a few small offscreen canvases kept by size, so a game can call it every frame for its creature (AND SO does, at about 90 × 110). In High contrast the rim is a plain white keyline round the silhouette and the ground a line.
- The ridges come from a fixed table, so the world is the same for everyone.
- High contrast prints the void, white rim lines and white stars, with no glow, haze or vignette.
- `Depthfield.looks` lists the seven looks as data (`id`, `name`, `light`, `motion`, `print`, `weather`), the family's shape for a look picker.

The numbers are `tokens.json` resolved to RGB; `tools/pen-inks.py` fails when they drift.

The night pets have their own add-on, `components/pets.js` (see Pets), drawn with the same inks.

**Accessibility**: a canvas is a picture; give it `role="img"` and an `aria-label` that says what is drawn, and keep anything a player must read or press out of the canvas. Nothing flashes; the only motion is the ridges' slow breath and the stars' twinkle, and both hold still when asked.

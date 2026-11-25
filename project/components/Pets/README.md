# Pets

The five night pets as data and as drawings: `Depthfield.pets` lists them, keeps the family's shared record of who found what, and draws each one on canvas, lit like the art and dancing to a beat with a swing.

**Provide** `components/pets.js` after `bundle.js`, or alone: like the pen it reads no CSS and needs no page to draw on, so a single-file game can carry it. Then `var pets = Depthfield.pets` → `{ kit: 'df', key: 'crossing:pets', version, list, has(id), find(id), count(), total(), draw(ctx, id, o) }`.

- `pets.list` holds the five night pets in the order they are met: `glass-bloom`, `mint-spore` and `frost-seed` (the three spores in the glasshouse), `winkle` (the eye in the mint clearing) and `firefly` (the night garden). Each is `{ id, name, line, how, where }`: `line` is what the found card says, `how` the hint for one still out there, `where` the address on this site where it is found.
- `pets.has(id)` says whether a pet is found; `'winkle'` and `'df:winkle'` are the same pet, and another kit's id such as `'sb:saelion'` is looked up as given. `pets.find(id)` records a find and returns `true` only the first time. `pets.count()` counts Depthfield's five.
- `pets.total()` counts the whole family from the same save: `{ sb, df, hmp, all }`, out of seven day pets (Storeybrook), five night pets (Depthfield) and five dusk pets (Hypermetapunk), seventeen in all. All seventeen open the lattice in AND SO.
- `pets.draw(ctx, id, o)` draws a pet centred on `o.x, o.y`, about `o.size` pixels tall (24 to 160 look right; 40 is the default). `o.t` is the time in seconds; `o.look` a look id (`night` unless given); `o.alpha` fades it; `o.still` holds it in its rest pose; `o.lookX, o.lookY` tell Winkle where to look (the pointer, in the same coordinates). It saves and restores the context and makes no canvases.

## The shared save

The save is `localStorage['crossing:pets']` on `stevoblevo.github.io`, one key for all three kits: `{ found: { 'sb:<id>': time, 'df:<id>': time, 'hmp:<id>': time }, active: { sb: id } }`. Each kit writes only its own prefix, reads and writes in one step so nothing another kit wrote is lost, and never removes an entry. When storage is out of reach (a private window, blocked site data) the finds last until the page closes. Storeybrook (`sb:`, seven day pets) and Hypermetapunk (`hmp:`, five dusk pets) offer the same object with the same names, so a page that hosts all three, like AND SO, can treat them alike (family task F9).

## Dancing

Give `o.beat` a value that jumps to 1 on each beat and falls away (`Math.exp(-phase * 7)` works); 0 or nothing means no music, and the pets idle: the spores breathe and turn, the eye wanders and blinks every few seconds, the firefly flickers. With music each one dances its own way, with a swing: the main move lands a little behind the beat and a smaller one on the off-beat, two thirds of the way to the next beat (long, short). The glass bloom opens and sways; the mint spore pumps its spines and steps round a twelfth of a turn; the frost seed rings, steps round and its spark flashes on the off-beat; Winkle squashes on the beat, blinks on the off-beat and glances side to side when it has nothing to look at; the firefly flares and hops. Each pet reads the beat's rhythm from the gaps between beats, so draw from one clock per page.

## Looks

The inks are the pen's own tables (`tools/pen-inks.py` checks them against `tokens.json`). In the night looks the pets glow, with light added where it overlaps. On paper (`day`, `peach-day`, `thread-day`) they take the look's darker inks, keep a pale halo and cast a soft shadow below. In `contrast` they are plain keylines with no glow.

## Cost

Seven pets every frame at 60 fps is well inside the budget: a pet is a few paths and gradients, with no canvas made per frame and nothing kept but one small beat record per pet.

**Accessibility**: a canvas is a picture; give it `role="img"` and a label that names the pets drawn. The flares are small and soft, never a flash across the screen, and under reduced motion the pets hold still whatever `o.still` says. Keep a pet's name and its hint in the page as text, as the showcase's pet list does.

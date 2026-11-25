# Depthfield plan

Owner: Bleve. Last updated 25 Nov 2026 by Claude (session 013Z7RfDQ7jddLT6yzpjZp9y). Work that crosses the family (versions, the pen, origami, Hypermetapunk) is in `docs/family.md`. Claim a task the same way as there.

## Where things stand

- The current runtime is **Depthfield 2.5.0** (25 Nov 2026): seven themes each with a mood, 19 brand-book chapters, and for canvas the plate (in the bundle since 2.3), the pen (`components/pen.js`, 2.3.0) and the night pets (`components/pets.js`, 2.4.0). 2.5.0 is the first build under `v/` that holds all three; see the README. It began this plan as 2.2.0 (43 components), merged 3 Nov from `claude/depthfield-2-2`.
- The showcase (`index.html`) tells 2.0 as a scroll story with five night pets and a seven-shot reel; it does not yet show anything added in 2.1 or 2.2.
- Consumers: Reignfawn (Depthfield look, five-axis strip planned for its 0.11.0), the Malachi sites (a copied `depthfield-components.css`), AND SO (`glasshouse` and `obsidian` skins).

## Open tasks

| ID | Task | Acceptance check | Size | Who | Status |
| --- | --- | --- | --- | --- | --- |
| D1 | Showcase chapters for 2.1 and 2.2: PopUp opening a chapter, Lamp following the hand, Stretch type bound to the scroll, Stack as an exploded diagram of the world's planes, Sense in the HUD | Each appears in the scroll story doing its job, in its theme, with reduced motion handled | M | Sae(lion) | doing: additive Missing Page chapter on sae/D1-missing-page |
| D2 | Five-axis strip component (x, depth, time, look, memory) for Reignfawn 0.11.0 and AND SO's lattice | `Depthfield.axes(el, state)` with README and preview; Reignfawn can mount it | M | open | open |
| D3 | A changelog page in the docs, one entry per version, read from `project/` | `docs.html#/changes` lists 2.0, 2.1 and 2.2 | S | open | open |
| D4 | Night pets reach the 2.2 companions: a found pet can become the page's Guardian | Picking a pet in the list sets the Guardian | S | open | open |
| D5 | The showcase's reel gains a shot for each new chapter added by D1 | Reel runs end to end; any touch still hands it back | S | open | open |
| D7 | One build with the plate, the pen and the pets: merge `claude/F9-pets` (pen 2.3.0, pets 2.4.0) with `main` (the plate), keep `v/2.3.0` and `v/2.4.0` byte-identical, cut `v/2.5.0`, and give every look a mood (family F10) | `tools/release.py` and `site/build.py` leave no diff; `tools/pen-inks.py` passes; the docs list the Plate, Pen and Pets pages with no console errors | S | Claude | done (2.5.0, pull request 7) |
| D8 | A plate per look: `Depthfield.plate` takes a look as well as a mode, so the family's call is the same in all three kits (`plate(look, source)`), with `scan` and `stage` chosen by the look's mood or by option | The Plate page shows one drawing in all seven looks; old calls with a mode still work | S | open | open |
| D9 | Versioned showcases (Bleve, 25 Nov: "we can version landing pages too"): `tools/release.py` freezes `index.html` and the `site/` files it loads under `v/<version>/`, pointed at that version's runtime; `tools/landing.py` back-fills from history | `/v/2.3.0/`, `/v/2.4.0/` and `/v/2.5.0/` each open their own showcase with no console errors and report their own version; a second release run leaves no diff | S | Claude | done (with 2.5.0, pull request 7). The 2.3 showcase that `main` served with the plate was the same page as `v/2.3.0/` |

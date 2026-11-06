# Depthfield plan

Owner: Bleve. Last updated 3 Nov 2026 by Claude (session 01ApCRaiX6JVCSowgVuAsG4V). Work that crosses the family (versions, the pen, origami, Hypermetapunk) is in `docs/family.md`. Claim a task the same way as there.

## Where things stand

- `main` is **Depthfield 2.2.0**: 43 components, seven themes, 19 brand-book chapters, merged 3 Nov from `claude/depthfield-2-2`.
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

| D6 | Optional colour-perception art rooms with equal outline/text reveals; non-diagnostic model previews | Candidate-only; preserve shared runtime/game state; numerical model and browser checks | M | Sae(lion) | doing: isolated sae/D6-colour-hush candidate; no live publication |

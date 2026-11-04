# The toolkit family: plan and contracts

Depthfield (night), Storeybrook (day) and Hypermetapunk (their child, incubating) are one family of design systems for Bleve's Saelion sites and games. This file is the shared plan. It lives here, in `stevoblevo/depthfield`, and is the only copy; Storeybrook's `AGENTS.md` links to it.

Owner: Bleve. Written 3 Nov 2026 by Claude (session 01ApCRaiX6JVCSowgVuAsG4V) after a survey of what every agent had made; statuses updated the same evening (Storeybrook 1.3 paper, Hypermetapunk 0.1).

**How to take part.** Any agent (Claude, Grok, ChatGPT, Muse, Codex or a person) may pick an open task: put your name in **Who**, set **Status** to `doing` on your branch, and set it to `done` with the commit in the same change that finishes it. Keep one task per branch, named `<agent>/<task-id>-<topic>`. A task that changes one system is listed in that repo's `docs/plan.md`; this file holds the work that crosses systems. In code, mark work that belongs to a task with a short comment naming it, such as `/* plan O1: … */`, so the next agent can find the thread.

## What the family looked like on 3 Nov 2026

| Where | Made by | What | State |
| --- | --- | --- | --- |
| `depthfield` branch `claude/depthfield-2-2` | Claude (another session), 2 Nov | Reconciled with the main artifact: 2.1's missing pieces plus 2.2 (Cloth, Guardian, Lamp, Stretch, Sense, Guide, Taste): 43 components, `Depthfield.tone`, the Anybody width family, chapters 15 to 19 | Merged to `main` 3 Nov (task F1) |
| `storeybrook` branch `claude/storeybrook-1-2` | Claude (same session), 2 Nov | Guardian (graduated from AND SO 7) and Taste, chapter 16 | Merged to `main` 3 Nov (task F1) |
| `storeybrook/show-tell/` (PR #1, merged) | commits authored as Sven bRinly, 1 Nov | Show & Tell: the Malachi sermon site, the Sixth Piggie pages, bespoke.gig prototypes, smoke tests and a workflow. **`bespoke/bespoke-gig-hypermetapunk.html` seeds a third system: "Hypermetapunk Kit v0, parents Storeybrook × Depthfield"** | Live under `/storeybrook/show-tell/` |
| `storeybrook` PR #2 | commits authored as Sven bRinly, 2 Nov | Malachi 1.0.1: readable captions, illustrated excerpts, visual tests | Open, waiting for review |
| `storeybrook/bespoke-v5/` | Sven bRinly, 2 Nov | bespoke.gig v5, a standalone page with its own navy and gold tokens | Live |
| `stevoblevo.github.io/and-so` (AND SO 8.1) | several agents | Eighteen skins over one sound lattice: the six Storeybrook looks (`sb-*`), `obsidian`, `hmp` (hypermetapunk), `story`, `eink`, `glasshouse`, `peachfall` and more. Carries **a fork of Storeybrook's bundle** with a better read-aloud voice picker, and draws paper patterns (dots, stipple, knit, origami facets) itself | Live |
| `stevoblevo.github.io/malachi-sermon-experience`, `storeybrook/show-tell/malachi-site` | Sven bRinly | Copies of Storeybrook 1.0's bundle and of Depthfield's CSS under `vendor/` | Live, pinned to the first import by copy |
| `stevoblevo.github.io/storeybrook/` folder | unknown | An older copy of the Storeybrook docs | Never served: the `storeybrook` repo's own site takes that path (404) |
| `stevoblevo/reignfawn` 0.7.0 | Claude sessions | Seven looks with **origami as the default world**, a planned Depthfield five-axis strip (0.11.0), its own `AGENTS.md` and plan | Active |

What this says about the toolkits: every app copies the kit and then re-derives the same things by hand (canvas palettes per look, paper patterns, fold shading, voice picking, a list of skins). Origami has outgrown "the look for settings" and become the art direction for the games. Hypermetapunk exists only as a block of CSS at the top of one page.

## Direction

1. **One state, many faces.** A look is a skin over the same lattice of content and sound, never a different page. Every system publishes its looks as data, so an app can offer the whole family's looks from one list.
2. **Ship the kit, do not copy it.** Each system publishes immutable, versioned builds on its Pages site. Apps pin a version by URL. A published version is never edited; a fix is a new version.
3. **Draw with the kit's pen.** Games draw on canvas. The kit gives them each look's resolved palette and its materials (paper grain, halftone, stipple, knit, folds), so a game in Origami looks like the Origami look.
4. **Origami becomes papercraft.** Faceted paper lit from one direction, creases, paper stocks, folds that open and close. For Reignfawn's world, AND SO's origami skin and Storeybrook's own pages.
5. **Hypermetapunk becomes the third system.** Lift Kit v0 into the same format as its parents, with its own repo, docs and showcase, and make it accessible (contrast, real fonts, reduced motion).
6. **Taste is shared.** Depthfield 2.2 and Storeybrook 1.2 both lint pages for the tells of generated design. The generic tells are one list for the family; each system adds its own rules.

## Contracts every system keeps

- **Format.** `project/` holds the Design System artifact export (brand book, `tokens.json`, `components/<Name>/{README.md,preview.html}`, `bundle.css`, `bundle.js`, `index.d.ts`, `assets/`). `site/build.py` compiles `project/tokens.css` and the site index. The docs shell (`docs.html`, `site/app.*`) and `site/immersive.js` are shared files; keep them identical across systems.
- **Token names.** Shared roles keep shared names: `void` or `paper`, `surface`, `surface-raised`, `line`, `ink`, `ink-muted`, `accent`, `accent-soft`, `on-accent`, `cue`, `link`, `focus`, and `art-*` for inks drawn in art. A theme block is complete, so `[data-theme]` works on any element, nested.
- **Runtime.** One classic script assigns `window.<System>` with at least `mountIcons`, `reducedMotion`, `token(name, el)`, `taste()`, and, after task F4, `looks` and `pen`.
- **Saves.** Cross-site state lives in `localStorage` on `stevoblevo.github.io` under `crossing:*` keys with a system prefix on ids (`crossing:pets` holds `df:` and `sb:` pets today).
- **Source.** `project/` is exported from each system's Claude artifact. Work done in the repo is real work, not a draft: it lands in `project/`, and the same change is carried to the artifact at the next release (task F8), so a later export merges instead of overwriting. Never re-export over `project/` without diffing first.
- **Versions.** Never replace a published build; add a version (Bleve's standing rule).
- **Accessibility.** Reduced motion is honoured everywhere; text meets 4.5:1; nothing is said by colour alone; the tour never starts by itself.
- **Originality.** No other studio's characters, logos or names in art or code.

## Family tasks

| ID | Task | Acceptance check | Size | Who | Status |
| --- | --- | --- | --- | --- | --- |
| F1 | Merge Depthfield 2.2 and Storeybrook 1.2 into `main`; rebuild; keep the showcases and docs working | Docs list 43 and 30 previews with no console errors; both adventure tests pass | S | Claude | done |
| F2 | Versioned builds: `build.py` writes `v/<x.y.z>/` (tokens.css, bundle.css, bundle.js, index.d.ts, icons) and `v/index.json`; an existing version folder is never rewritten | `/depthfield/v/2.2.0/bundle.js` and `/storeybrook/v/1.2.0/bundle.js` serve; a second build leaves older folders byte-identical | M | open | open |
| F3 | CI on push: build is idempotent (no diff after `build.py`), Playwright smoke of `docs.html` and `index.html` | A workflow run fails on a dirty build or a console error | M | open | open |
| F4 | Looks as data and a pen: `<System>.looks` (`{id, name, light, motion, print}`) and `<System>.pen(look)` giving resolved RGB inks and canvas materials (`grain`, `halftone`, `stipple`, `knit`, `facets`) | A demo draws the same scene in every look of both systems from the pen alone; AND SO's `paperPal` and Reignfawn's look palette could be replaced by it | M | Claude (Storeybrook half) | doing: Storeybrook 1.3 has `Storeybrook.looks` and `Storeybrook.pen(look)`; Depthfield and Hypermetapunk halves open |
| F5 | Upstream AND SO's voice picker into Storeybrook's Reader (accent pool, skip the listener's own region, no novelty voices, quality rank) | `Storeybrook.voices()` returns the ranked list; Reader uses it | S | open | open |
| F6 | Pin the copies: offer AND SO, the Malachi sites and Reignfawn a change from vendored copies to versioned URLs, each through that repo's own rules (candidate branch and PR, never their `main`) | A PR exists per consumer; nothing breaks offline (keep a fallback copy where the app must work from a file) | M | open | open |
| F7 | One list of generic tells for Taste, included by every system | `Depthfield.taste()` and `Storeybrook.taste()` report the same generic findings on the same page | S | open | open |
| F8 | Carry repo work back to the artifacts at each release (Depthfield `2yngsrbj7HRDirATXbTwMz`, Storeybrook `YQrpanzsuY5WPgr47GFCNe`), and create a Design System artifact for Hypermetapunk | Each artifact lists the same components as its repo's `project/` | M | open | open |
| O1 | Origami papercraft pen in Storeybrook (see Storeybrook plan O1 to O4) | Storeybrook plan | M | Claude | done: Storeybrook 1.3 (`components/paper.js`, Pen and Folded); O4 to O6 open |
| H | Hypermetapunk 0.1 lifted from Kit v0 into the family format (see "Hypermetapunk" below) | H1 to H5 below | L | Claude | done except the repo: 0.1 is on branch `claude/H1-hypermetapunk` of this repo |

## Hypermetapunk

Hyperreal wave surfaces (dusk bands, chrome type, a receding grid floor, a banded sun) slapped with punk print culture (stickers, stamps, tape, marker scrawl, misregistration, photocopy grain). Parents: Storeybrook's paper and Comix, Depthfield's night, doors and depth. First hosts: bespoke.gig and AND SO's `hmp` skin.

| ID | Task | Acceptance check | Size | Who | Status |
| --- | --- | --- | --- | --- | --- |
| H1 | Home: repo `stevoblevo/hypermetapunk` in the family format, with Pages | The docs site serves at `/hypermetapunk/` | S | Claude | waiting for Bleve: creating a new public repo needs his go-ahead; 0.1 waits on `depthfield` branch `claude/H1-hypermetapunk`, laid out as the repo |
| H2 | Tokens from Kit v0: themes `dusk` (neon night, the default), `zine` (photocopy day) and `contrast`; type on open-licence fonts (Archivo Black, Archivo Narrow, Space Mono, Permanent Marker) instead of Impact and Comic Sans | Every text pair in every theme is 4.5:1 or better, measured | M | Claude | done (0.1: 77 pairs measured by `tools/contrast.py`) |
| H3 | Components from the seed: Chrome type, Sun, Grid floor, Sticker, Stamp, Tape, Scrawl, Misregister, Grain, Button, Card, Door (from Depthfield) and Ticker; `window.Hypermetapunk` | Each has `README.md` and `preview.html`; previews run in the docs with no errors | L | Claude | done (0.1: thirteen components, `window.Hypermetapunk`) |
| H4 | Showcase: the kit's own front page, then bespoke.gig rebuilt on it | `index.html` uses only the kit | M | Claude (front page) | doing: the front page is done; bespoke.gig rebuilt on the kit is open |
| H5 | Family membership: `immersive.js`, a third set of crossing pets, `pen()` for AND SO's `hmp` skin, Taste rules ("stickers go on the frame, never over the words") | AND SO can draw `hmp` from `Hypermetapunk.pen('dusk')` | M | open | open |

## Needs Bleve

- `storeybrook` holds Show & Tell, the Malachi site and bespoke.gig, which are not part of the design system. They could move to their own repos (`malachi-sermon-experience` already exists); nothing moves without your go-ahead.
- The unused `/storeybrook/` copy in `stevoblevo.github.io` can be kept as an archive or removed.
- Storeybrook PR #2 (Malachi 1.0.1) is waiting for review.

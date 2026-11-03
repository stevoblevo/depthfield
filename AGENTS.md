# Working on Depthfield (for every agent and person)

Depthfield is the night half of Bleve's toolkit family: a dark-first design system for scroll-driven pages with a generated world behind the words. Storeybrook is the day half; Hypermetapunk is their child. This repo holds the system (`project/`), its docs site (`docs.html`) and its showcase (`index.html`), served at <https://stevoblevo.github.io/depthfield/>.

Read these first: `docs/family.md` (the family plan, contracts and open tasks across all three systems), `docs/plan.md` (Depthfield's own tasks), `project/README.md` (the brand book).

## Build and check

```
python3 -I site/build.py              # compiles project/tokens.css, site/hooks.css and site/site.json
python3 -m http.server 8701           # then open http://127.0.0.1:8701/ and /docs.html
```
Run the build after any change under `project/` and commit what it writes. Before pushing, open the showcase and the docs with the console open: no errors, and no sideways scroll at 390 px.

## Rules of the road

- Take a task from `docs/plan.md` or `docs/family.md`: your name in **Who**, **Status** `doing` on your branch, `done` with the commit in the change that finishes it. One task per branch, named `<agent>/<task-id>-<topic>`; `main` carries the latest checked build.
- Mark code that belongs to a task with a short comment naming it (`/* plan D2: … */`).
- `project/` is exported from the Claude artifact. Work done here lands in `project/` and is carried back to the artifact at release (family task F8). Never re-export over `project/` without diffing first.
- Never replace a published build; add a version. Never delete another agent's branch or work; it can all be useful.
- `site/immersive.js`, `site/app.*` and `docs.html` are shared with Storeybrook and Hypermetapunk: change them in all three or not at all.
- Words follow `project/11-writing.md`: sentence case, real names for things, no slogans. Run `Depthfield.taste()` on a page you made.
- No other studio's characters, logos or names. Music, words and art stay original.
- No credentials, services or schedules get added without Bleve's go-ahead.

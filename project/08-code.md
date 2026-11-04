# Code

## Files

```
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/bundle.css">
<script src="components/bundle.js"></script>
```
`<html data-theme="dusk">` picks the theme; `[data-theme]` works on any element, nested. `body.hmp-body` sets the ground, ink and face.

## window.Hypermetapunk

- `theme.get()`, `theme.set(id)`, `theme.list`: kept in the address (`?theme=zine`) and on this device. Buttons with `data-hmp-theme="zine"` switch it.
- `still.get()`, `still.set(on)`: the page's motion switch; buttons with `data-hmp-still`.
- `ticker(el)`, `slap(frame)`: run by `init()` for `.hmp-ticker` and `[data-hmp-slap]`.
- `taste({ root, log })` returns findings `{ rule, severity, count, sample, fix }`; `taste.badge()` shows them.
- `token(name, el)`, `reducedMotion()`, `looks` (the themes as data: `id`, `name`, `light`, `motion`, `print`).
- Events: `hmp:theme`, `hmp:still`, `hmp:taste`, `hmp:ready`.

`init()` runs by itself on load and is safe to call again.

## Budgets

`bundle.css` 24 KB, `bundle.js` 16 KB. No dependencies, no network except the fonts.

## The family

Hypermetapunk keeps the family contracts (shared token names, complete theme blocks, a runtime on `window`, reduced motion everywhere, versions never replaced). Its plan and open tasks (H4 onward: the showcase, bespoke.gig rebuilt on the kit, a pen for AND SO's `hmp` skin) are in `stevoblevo/depthfield`, `docs/family.md`.

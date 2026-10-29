# Iconography and the mark

## The set

Thirty-seven icons on a 24px grid, drawn with 1.5px round strokes and round joins, no fills; dots are zero-length strokes. They live in the Icons group and in the bundle (`Depthfield.icons`).

| Group | Icons |
|---|---|
| Navigation | `arrow-right`, `arrow-up`, `arrow-down`, `arrow-up-right` (leaves the site), `chevron-left`, `chevron-right`, `top`, `chapters`, `menu`, `close`, `expand` |
| Media | `play`, `pause`, `skip`, `reel`, `sound-on`, `sound-off`, `mic` |
| Faces and modes | `sun` (day), `moon` (night), `lens` (the reality lens), `weather`, `archive`, `knot` (versions, the thread) |
| Cues | `drag`, `press`, `orbit`, `tilt`, `level`, `ripple`, `spore` (a hotspot), `eye` (the winking eye), `door` (a portal) |
| Status | `check`, `info`, `alert` |
| Input | `gamepad` |

## Using them

- In code: `Depthfield.icon('lens', { size: 16 })` returns an inline SVG drawn in `currentColor`; or put `data-df-icon="lens" data-size="16"` on an empty element and `Depthfield.init()` (or `mountIcons()`) fills it.
- Sizes: `size-icon-sm` (16px) inside tools and chips, `size-icon-md` (20px) beside text and in buttons, `size-icon-lg` (24px) alone. Keep the 1.5px stroke at every size.
- Color: `ink` or `ink-muted`, `accent` only when the icon is the active state, `cue` for interaction cues. Icons that carry meaning reach 3:1 on their ground.
- Every icon-only control has an `aria-label`; decorative icons are `aria-hidden`.
- The files in the asset store are drawn in #5c766e so they read on both night and day grounds in the asset view; in pages, use the inline versions.

## Drawing a new icon

Stay inside a 20px live area on the 24px grid, 1.5px stroke, round caps and joins, no fills, no gradients, one idea per glyph. Match the set's corners: radius 1px on boxes, full circles for dots. Name it for what it does, not what it shows (`press`, not `finger`).

## The mark (proposed)

The lens: a slab with the depth rings cut from its corner, built on a 64 grid (a 64 square, a quarter disc of 48 removed from one corner, a ring from 16 to 32 left standing). It is Depthfield's own mark, offered until a site has its own logo.

- Two files: `depthfield-mark.svg` in `mint` for night grounds, `depthfield-mark-day.svg` in the day mint for day grounds.
- Clear space: a quarter of its width on every side. Smallest size: 16px.
- Never rotate it, outline it, put it on a busy part of the world, or recolor it outside the accent of the skin it sits in.
- A site's own name, set in italic display (the Ribbon's mark) or in `eyebrow`, always beats the mark.

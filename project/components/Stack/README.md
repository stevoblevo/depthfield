# Stack

An exploded cross-section: the layers of a thing, skin out, lying in 3D, with a legend that pulls focus to one layer.

**Provide** `<div class="df-stack" data-df-stack data-df-legend="#layers">` → `<div class="df-stack__set" aria-hidden="true">` → one `<div class="df-stack__plane">` per layer, innermost first, each with a `<span class="df-stack__n">` number and a CSS texture for its material. Beside it, `<ol class="df-stack__legend" id="layers">` with one `<li data-i="n">` per plane, outermost first: a `df-n` number, a `<b>` name and a one-line note.

- Opens as it scrolls into view, from `depth-stack-min` to `depth-stack-max` between planes (17% of the plane at most on phones), and stays open.
- Hover or focus a legend row: that plane lifts 18px and takes an `accent` ring; the others blur by distance (`blur-dof-1`, `-2`, `-3`).
- Seven planes at most; textures quiet enough that the numbers read.

**Accessibility**: the 3D set is `aria-hidden`; the legend is the content, a real list in reading order, each row focusable. Reduced motion: the stack holds at 80% open and focus still blurs.

# Ribbon

The version thread across the top: the mark, one knot per version on a hairline thread, and the page's tools.

**Provide** `<header class="df-ribbon">` → `df-ribbon__in` → a `df-ribbon__mark` link (icon + name), `<nav class="df-knots" aria-label="Versions">` of `df-knot` links (`<i>` numeral + `<span>` name; `aria-current="page"` on this one) and a `df-ribbon__tools` cluster of Tools.

- `chrome` ground with `blur-chrome` and a `line` hairline; `z-chrome`; 54px tall plus the top safe area. Set `scroll-padding-top` so anchors land below it.
- The current knot fills `accent` with `on-accent` numeral and `shadow-glow`; others are `surface-raised` circles that ring `accent` on hover.
- Below `bp-medium` only numerals show and tool labels hide; the mark keeps its icon.
- Versions open where they live (a page, a path on the site); say "Only you" with the owner marker when a version is private.

**Don't** put page navigation here: the ribbon is versions and tools.

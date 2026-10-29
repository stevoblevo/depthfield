# Footer

The closing band: the mark, one statement that closes the loop, a short colophon and jump links back into the story.

**Provide** `<footer class="df-foot">` → `df-wrap` → `df-foot__in` with the mark (`df-foot__mark`, the Depthfield mark or the site's own) and a block with an italic display `h2`, a `p` note and a `<nav>` of `df-jump` links.

- The statement echoes the opening ("Every chapter ends at a door.").
- Jump links are mono caps in `accent`; the last one goes back to the door (the top).
- Leave `env(safe-area-inset-bottom)` under it; nothing fixed overlaps it.

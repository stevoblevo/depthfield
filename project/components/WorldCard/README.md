# WorldCard

A list row that opens a world: a 64px tile (art or an icon on `surface`), the world's name in italic display, one line under it.

**Provide** `<a class="df-world-card" href>` → an `<img>` or `<span class="df-tile">` with an icon → `<span><b>Name</b><small>One line.</small></span>`. Mark private worlds with `<span class="df-only">Only you</span>` inside the `<b>`.

- Rows separate with a `line` hairline; the name turns `accent` on hover.
- One line of description, written as what the world is or does ("Every controller, every stick, tested.").
- Group rows under an eyebrow; six to a dozen per group.

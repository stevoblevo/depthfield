# VersionCard

A version in the archive: its art with the numeral over it, the name and date, one line, and how to open it.

**Provide** `<a class="df-version" href>` → `<figure>` (an `<img>` and a `<b>` numeral) → `<h3>Name <small>2026-10-11</small></h3>` → `<p>` → `<span class="df-open">Open ↗</span>`. The current version carries `aria-current="page"` and an `accent` outline.

- Art at 16:11, radius 4px; it scales 1.05 over a second on hover (none under reduced motion).
- Grids of four on wide screens, two on medium, one on phones.
- Dates in ISO form, tabular.

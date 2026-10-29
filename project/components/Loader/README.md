# Loader

The entry veil while the world warms up: the site's name, a thin progress line, a percentage, and a way past it.

**Provide** `<div class="df-loader" role="progressbar" aria-label="Loading" aria-valuenow>` with `df-loader__name`, `df-loader__track > i` (width = progress), `df-loader__pct`, and a text Button "Skip". Add `is-done` to dissolve it over `dur-scene`.

- Show it only when the world truly needs time (fonts, textures, audio); under 400ms, skip it.
- Never fake progress: tie the line to real loading, or show the name alone.
- The page behind is already in the DOM and readable by assistive tech; the loader is presentation.

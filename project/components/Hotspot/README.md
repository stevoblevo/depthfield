# Hotspot

A real button laid over something drawn in the art, so the picture itself is the interface (spores in the haze, an eye on a ridge, doors at the end).

**Provide** data, not markup: `Depthfield.hotspots([{u, v, plane, kicker, title, body}], {world, caption, onFound})`. `u`/`v` place the spot as fractions of the world; `plane` (0–2) pins it to a ridge so it sinks and parallaxes with that plane.

- Each spot becomes a transparent 56px (`size-hotspot`) `<button>` at `z-hotspot` with an `aria-label` of title and body; hover or focus shows the live SceneCaption ("Hold to open", "Press"), press fires a ripple in the world and counts it found once.
- Shaped art (a door, the eye) uses `df-hotspot--shape`, sized to the drawing, `radius-md`.
- `df-hotspot--visible` draws an `accent` dot for keyboard and touch discovery; found spots turn `cue`.
- Spots hide within 40px of the window's edge, and wherever the art they belong to is not drawn.

**Discovery**: say how many there are ("Three spores are hiding in the haze. 0 found.") in a `df-hint`, count them in a HudChip, and confirm the last one in words ("All three found. The scene is yours.").

**Accessibility**: the art is `aria-hidden`; the buttons are the content, in reading order after the beat they belong to; focus moves the pointer-led light to the spot.

# Door

A portal drawn into the world: an arch that glows its destination's color and swings ajar on hover.

**Provide** an `<a class="df-door" href>` with a `df-door__arch` span and an `aria-label` naming the world, what kind it is and where it opens ("Porch: a narrative world. Opens in a new tab"). Set `--door-c` to the destination's art hue (`var(--wx-peach-rim)`, `var(--wx-rain-rim)`, `var(--wx-mint-rim)`), else it takes `art-accent`; doors belong to the art, so they keep the night colors in every face.

- In a canvas world, draw the door in the art and lay a `df-hotspot--shape` link over it instead; the SceneCaption shows kind, name and a one-line description on hover or focus.
- Doors appear only in the night garden weather (the end of a story); at most three on a ridge.
- External destinations open in a new tab with `rel="noopener"`, and say so in the label.

**Don't** use a door for an in-page jump (that is a tick or a jump link).

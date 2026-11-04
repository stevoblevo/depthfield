# GridFloor

A neon grid floor that runs toward you under the dusk band; together with the Sun it makes the Horizon, the system's one scene.

**Provide** a positioned Horizon with the floor inside: `<section class="hmp-horizon"><span class="hmp-sun" aria-hidden="true"></span><div class="hmp-gridfloor" aria-hidden="true"></div> … your words … </section>`. The band is `--hmp-band` (the `wave-*` tokens, top to bottom); the floor's squares are `tex-grid` and one square passes every `dur-drift`.

- The Horizon is the page's opening and, at most, its closing. Words sit above the floor, never on it.
- Zine draws the floor in photocopy ink on a pale band; High contrast draws a quiet ink grid on black.

**Accessibility**: the floor and sun are `aria-hidden`. The drift stops under reduced motion and with the page's motion switch (`[data-hmp-still]`).

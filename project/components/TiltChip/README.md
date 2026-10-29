# TiltChip

The bubble level in the top bar: the phone's tilt, live. Tap to call wherever you are holding it level; hold to switch tilt off.

**Provide** `<button class="df-tilt" type="button" data-df-tilt aria-label="Tilt: tap to level here, hold to switch off"><span class="df-tilt__dot"></span></button>`; `Depthfield.tilt({chip, world})` drives it and feeds the world's parallax.

| State | Looks | Means |
|---|---|---|
| idle | grey dot, centred | sensors quiet or not reaching the page |
| `is-on` | `cue` dot that moves with the tilt | sensors live |
| `is-rolling` | `accent` dot and ring, glowing | tilted past the roll threshold |
| `is-ask` | dashed `cue` ring | iOS: tap once to allow motion |
| `is-off` | hollow dot | tilt switched off (tap to switch back on) |

- Shown on touch devices even without sensors, so a tap can explain where they went ("the standalone page has them").
- The neutral follows a resting hand slowly and snaps home when you come back toward where a roll began; a shake never reads as a tilt.
- Motion is never required: everything tilt does has a pointer or key equivalent.

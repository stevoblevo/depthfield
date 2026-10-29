# Sound and haptics

## Sound

- Off by default, always. The sound Tool sits in the HUD or the ribbon with its state in words ("Sound off"); the first press starts the audio context.
- The choice lasts for the visit (`df:sound` in session storage), not forever.
- Nothing autoplays with sound. Video is muted until the reader unmutes it.
- Sound never carries information alone: a chime that confirms a landing also has a ripple, a word or a count.
- Ducking: when something speaks or a video plays, ambient sound drops by half over `dur-base`.
- Spoken audio has a transcript or captions on the page.

## Haptics

Short, rare, and only where the hand already is (`Depthfield.haptic(ms)`; off with `Depthfield.haptic.off = true`).

| Pulse | Means |
|---|---|
| 5–6ms | a tick: a ripple, a hop, a wink |
| 8ms | a confirmation: something found, level set |
| 12ms | a mode change by long press: tilt off |
| 20ms | a refusal: that does nothing here |

Never continuous, never on scroll, never while a reel plays by itself.

## Rumble (controllers)

Dual-rumble only on landings, blooms and finds: weak 0.15–0.25, strong 0–0.35, 40–120ms. Never on navigation.

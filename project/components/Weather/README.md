# Weather

Four weathers that follow the music, or the scroll: peach fall, red rain, mint clearing, night garden.

| Weather | Means | Accent | Particles | Lives here |
|---|---|---|---|---|
| peach fall | the story is moving | `peach` | petals drifting | the opening |
| red rain | tension; a dissonance is being held | `rain` | streaks, heavy | the turn |
| mint clearing | a settled chord, a resolution | `mint` | motes rising | the eye opens |
| night garden | nobody has touched it in a while | `frost` | fireflies, stars | the doors appear |

- In a weather world the keyframes sit at 0, ⅓, ⅔ and the end of the scroll and blend between (`dur-scene` when set directly).
- `accent` follows the weather (the eyebrow rule, the progress fill, the emphasized word, the HUD weather name), so it is still one accent per screen.
- Name the weather in a HudChip (`data-df-weather-name`) so the change is not carried by color alone.
- The art colors are tokens (`wx-<weather>-sky-top`, `-sky-low`, `-sun`, `-ridge-1..3`, `-rim`).

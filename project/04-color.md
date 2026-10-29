# Color and theming

## Roles

| Role | Tokens | Rule |
|---|---|---|
| Ground | `void`, `surface`, `surface-raised`, `chrome` | the stage, bands, floating UI, translucent fixed bars |
| Text | `ink`, `ink-muted` | on the three grounds and on `scrim`, in every theme |
| Accent | `accent`, `accent-soft`, `on-accent`, `link` | one per screen; aliases the skin's hue |
| Cue | `cue`, `on-cue` | live interaction only (drag, hold, press, the tilt bubble, hints); never beside accent in one component |
| State | `danger`, `focus` | errors with a word or icon; the focus ring |
| Overlay | `scrim` | between busy media and words |
| Line | `line` | hairlines and tracks; decorative except in high contrast |
| Art | `art-void`, `art-ink`, `art-ink-muted`, `art-accent`, `art-on-accent`, `art-cue`, `wx-*`, `gh-*`, `eye-*` | the world's own colors, the same in both faces |
| Category | `tag-gold`, `tag-rose`, `tag-violet`, `tag-sea`, `tag-peach` | tags only; never good or bad |
| Lens | `lens-c`, `lens-m`, `lens-y` | the reality lens's misregistration; decoration only |

## Skins

A skin is a hue and the grounds tinted toward it. Each has a night face and a day face; `contrast` stands beside them.

| Skin | Accent | Grounds | Type | For |
|---|---|---|---|---|
| mint | `mint` #5ef2b8 (day #0b7255) | green-black | Fraunces, Hanken Grotesk, JetBrains Mono | glasshouse worlds, tools, design pages |
| peach | `peach` #ffb48a (day #a5461f) | blue-black ("Ways night ground") | the same | weather worlds, game hubs |
| thread | `thread` #f2c98a (day #8f6116) | indigo | Bodoni Moda and Alegreya, mono for labels | ledgers, architecture, version archives |

- Switch with `data-theme` on `<html>`, or `Depthfield.theme.set({ skin, face })`. A choice is remembered (`df:theme`).
- Night first: a page opens in its night face. Follow the system's light setting only when a page asks (`Depthfield.theme.init({ followSystem: true })`), and let a choice made on the page win.
- The day face changes the chrome, not the sky: the world keeps its night art and the words over it keep the art inks (`df-over-art`). Image heroes in day go grey (`grayscale(.9) contrast(1.05)`) and sit on the light void's gradient.
- Where the principles say `mint`, read the skin's accent.

## Weather accents

In a weather world, `accent` follows the weather: peach fall `peach`, red rain `rain`, mint clearing `mint`, night garden `frost`. It is still one accent per screen, and the HudChip names the weather so the change is never carried by color alone.

## High contrast

`contrast` is an added theme, not a re-tint: every text color is 7:1 or more on every ground, `line` borders reach 3:1 so surfaces are told apart by edges, and shadows become outlines. Offer it from the face tool's menu or the settings sheet; never force it.

## Contrast

Worst case of each text color across `void`, `surface` and `surface-raised` (WCAG 2 ratio). Body text needs 4.5:1 (7:1 in `contrast`), large text and marks 3:1.

| Theme | ink | ink-muted | accent | cue | danger | on-accent on accent | focus ring |
|---|---|---|---|---|---|---|---|
| `night` | 14.4 | 6.5 | 11.4 | 12.5 | 7.0 | 13.6 | 12.5 |
| `day` | 15.0 | 5.3 | 5.0 | 5.7 | 5.5 | 5.9 | 15.0 |
| `peach-night` | 13.6 | 6.4 | 9.2 | 12.3 | 7.0 | 10.4 | 12.3 |
| `peach-day` | 13.6 | 6.1 | 5.1 | 5.8 | 5.5 | 6.0 | 13.6 |
| `thread-night` | 14.1 | 8.3 | 10.7 | 12.8 | 7.2 | 11.3 | 10.7 |
| `thread-day` | 12.1 | 6.0 | 3.9 ⚠ | 4.9 | 4.8 | 5.0 | 3.9 |
| `contrast` | 18.5 | 13.6 | 15.0 | 15.2 | 10.0 | 17.0 | 18.5 |

Known shortfalls, kept exact because they are the source's values: in `thread-day`, `accent`/`link`/`thread` on `void` and `surface` reach 3.9:1 (24px and up only; small accent text there uses `ink`), and the tag and palette hues on `surface` sit between 4.1 and 4.5:1. Over a sun core, `ink-muted` on the night scrims falls to about 3:1: keep captions off the light.

## Making a new skin

1. Pick one hue. Set its night value so it reads 4.5:1 on a near-black ground tinted toward it; set a day shade that reads 4.5:1 on a near-white tinted the same way.
2. Derive `void` (darkest), `surface` (+1 step), `surface-raised` (+2 steps), `line` (≈1.4:1 on void) for each face; `ink` and `ink-muted` from the same tint.
3. Add `<hue>`, `<hue>-soft` (12–16% of the hue over the void; 10% over white for day) and `on-<hue>`; alias `accent`, `accent-soft` and `on-accent` to them in the new themes.
4. Add the art inks for the skin (its night void, ink, muted ink, accent).
5. Run the contrast audit for every pair above in both faces; fix authored values, flag source values.
6. Add the two themes (`<skin>-night`, `<skin>-day`) to the token file. The list holds eight themes and uses seven, so a fourth skin's pair means retiring one (or shipping its night face alone).

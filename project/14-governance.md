# Governance

## Versions

Depthfield is versioned as a whole: `tokens.json` carries the major version (2), `Depthfield.version` the full one (2.0.0).

- **Major**: a token or class renamed or removed, a behavior that changes what a page does.
- **Minor**: new tokens, components, icons, themes or options.
- **Patch**: values tuned, bugs fixed, wording.

## 2.0.0, from 1

- Added: the peach and thread skins (both faces), a high-contrast theme, role tokens (`accent`, `accent-soft`, `on-accent`, `cue`, `on-cue`, `chrome`), art inks, weather and glasshouse art palettes, categorical tags, lens colors; type for captions, hints, mono labels and the thread skin; `radius-md`; four shadows; and the depth, blur, duration, easing, breakpoint, size, opacity, border and scene families.
- Added: twenty-six components (to thirty), the behavior bundle, types, thirty-seven icons and a proposed mark.
- Kept: every Depthfield 1 token name and value (`mint`, `mint-soft`, `on-mint`, `frost`, `on-frost` stay as palette hues; new work uses the roles), the four original components and their classes, the principles and the voice.
- Changed: motion values moved from prose into tokens; Lucide gave way to the Depthfield set.

## How a pattern gets in

1. It ships first, in a real page (a world, a lander, an instrument).
2. It is used a second time somewhere else, or asked for twice.
3. It is written down here with exact values from the page that shipped it, a preview, a README and its accessibility notes.
4. Its tokens, classes and API are named for what they do, not where they came from.

## Checklist for a new page

- One accent per screen, one `display-xl`, one italic word per display line.
- Night face first, then day, then `contrast`; the world keeps its night art.
- Every hotspot is a button with a name; every scene readable with JS off.
- Reduced motion checked; sound off by default; sensors and microphone asked for from a tap.
- The HUD says where the reader is; the hint says what to do; the ending has a way out.
- Contrast pairs from the Color table; nothing new below 4.5:1.

## Known gaps

- `thread-day` keeps the source's accent at 3.9:1 on `void`: small accent text there uses `ink`.
- `peach-day` and `contrast` are authored, not taken from a shipped page: tune them when a page ships in them.
- Durations and easings live as plain token families because the token format has no motion family.
- Fonts are hosted by Google; a page that cannot load them falls back to the stacks' system faces.
- The mark is a proposal until it is adopted.

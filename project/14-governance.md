# Governance

## Versions

Depthfield is versioned as a whole: `tokens.json` carries the major version (2), `Depthfield.version` the full one (2.2.0).

- **Major**: a token or class renamed or removed, a behavior that changes what a page does.
- **Minor**: new tokens, components, icons, themes or options.
- **Patch**: values tuned, bugs fixed, wording.

## 2.2.0, from 2.1

- Added: eight behaviors (`cloth`, `lamp`, `stretch`, `sense`, `guide`, `guardian`, `tone`, `taste`) and seven components (Cloth, Guardian, Lamp, Stretch, Sense, Guide, Taste), to forty-three; nine tokens (`lamp`, `dur-stretch`, `dur-cue`, `dur-response`, `dur-weave`, `dur-pluck`, `depth-cloth-pitch`, `size-guardian`, `op-lamp-floor`), the `stretch` family (Anybody) and the `display-stretch` style; three chapters, Threads and light, Companions and sensing, and Taste.
- Shipped first in: Saelion Loom (the cloth, the guardian, the inferred-state chip, found 0 / 8, the Bohlen–Pierce pluck, the hold), Saelion Field (the strawberry), the Maesage e-paper explainer and its Direction B sketch (the lamp, stretch type), October and November 2026. Taste comes from the Maesage Study 03 review, November 2026.
- Changed: the bundle.js budget rose from 64 KB to 120 KB to hold the cloth and its companions.
- Kept: every 2.1 token, class and API.
- Reconciled: the GitHub export (`stevoblevo/depthfield`) had been made from a 2.0 copy of this system; it now follows this one.

## 2.1.0, from 2.0

- Added: five behaviors (`fold`, `stack`, `secret`, `field`, `popup`) and six components (Fold, Stack, Secret, Field, PopUp, Letter), to thirty-six; ten tokens (`dur-fold`, `dur-fold-stagger`, `dur-generation`, `ease-fold`, `depth-stack-min`, `depth-stack-max`, `depth-popup-tilt`, `size-letter`, `size-popup`, `op-paper-back`); two chapters, Folds and play, and Letters.
- Shipped first in: the Maesage e-paper explainer (the stack, the secret, the field and the folded letter) and chapter V of Saelion Storybook (the pop-up), October 2026.
- Changed: the bundle.js budget rose from 60 KB to 64 KB to hold the five modules.
- Kept: every 2.0 token, class and API.

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
- Folds and pop-ups turn in CSS 3D; a browser without it shows them flat and open.
- The Letter is a pattern with a preview, not a mail renderer: check it in the clients that matter before sending widely.

# Code

## Files

| File | What |
|---|---|
| `tokens.css` | every token as a custom property; themes as `[data-theme]` blocks; a class per type style |
| `components/bundle.css` | every component, prefixed `df-`; the skin hooks; reduced-motion rules; the Google Fonts import |
| `components/bundle.js` | one classic script, no dependencies, no network: `window.Depthfield` |
| `components/index.d.ts` | the markup contracts (`<Comp>Props`) and the JS API, as types |

Load them in that order, set `data-theme` on `<html>`, give `<body>` `df-page df-no-js`, and call `Depthfield.init()` at the end of the body.

## Data attributes

| Attribute | On | Does |
|---|---|---|
| `data-df-world="glasshouse"` or `"weather"` (+ `data-df-eye`) | `<canvas class="df-world">` | starts the world |
| `data-df-chapter` | each scene | counts chapters for progress and ticks |
| `data-df-progress`, `data-df-ch`, `data-df-pct` | the ScrollProgress pill and its readouts | filled from scroll |
| `data-df-reveal` | text in a beat | rises and fades in once, staggered among siblings |
| `data-df-tool="face"` / `"sound"` / `"lens"` | Tools | the face switch, the sound toggle, the reality lens |
| `data-df-banner="#id"` | the lens Tool | which LensBanner to show |
| `data-df-open="#id"` | a Tool or Button | opens a Drawer or a `<dialog>` |
| `data-df-close` | inside a Drawer or Dialog | closes it |
| `data-df-tilt` | a TiltChip | the bubble level, fed by the sensors |
| `data-df-icon="name"`, `data-size` | an empty element | filled with that icon |
| `data-df-weather-name` | an element | kept equal to the weather's name |
| `data-df-cursor` | anything | grows the CursorRing |
| `details.df-fold` (+ `df-fold--letter`, `--fan`, `--gate`) | a Fold | opens in panels; Escape folds it back |
| `data-df-stack`, `data-df-legend="#id"` | a Stack and its legend | opens with the scroll; the legend pulls focus |
| `data-df-popup` (`"shut"` to wait) | a PopUp | opens once over `dur-scene`; drag to open or shut |
| `data-df-field="diamond"` or `"square"` | `<canvas class="df-field">` | a lattice running Life; press to plant cells |
| `data-df-cloth="hang"` or `"lay"`, `data-df-threads="#id"`, `data-df-bands="#id"` | `<canvas>` in a `df-cloth-wrap`; two lists | a cloth woven from the lists; pull, pluck, hold |
| `data-df-room` | an `<input type="range">` | the room light; the lamp follows the pointer and writes `--df-lamp-x`, `--df-lamp-y`, `--df-room` on `<html>` |
| `data-df-stretch="0.7"` (+ `-min`, `-max`, `data-df-stretch-sense`) | a `df-h-stretch` heading | stretch type, optionally bound to the inferred state |
| `data-df-sense` | a HudChip | the inferred state, labelled inferred |
| `?df-taste` in the address | the page | shows Taste's findings |
| `data-df-secret="id"` with `data-df-after`, `data-df-name-after`, `data-df-word`, `data-df-reveal-at`, `data-df-watch`, `data-df-hint`, `data-df-hint-target` | a Secret chip | the staged reveal; `data-df-secret-echo="id"` marks its second door |

## The API

`Depthfield.init(options)` binds all of the above and returns the API. Underneath: `theme` (`get`, `set`, `toggleFace`, `init`), `story`, `reveal`, `world`, `hotspots`, `eye`, `tilt`, `sound`, `lens`, `drawer`, `dialog`, `found`, `reel`, `focus`, `cursor`, `slider`, `icon`, `icons`, `haptic`, `token`, `reducedMotion`; and since 2.1 `fold`, `stack`, `secret`, `field`, `popup`; and since 2.2 `cloth`, `lamp`, `stretch`, `sense`, `guide`, `guardian`, `tone`, `taste` (with `taste.badge`). Each is typed in `index.d.ts`.

Events arrive on `window` as `df:<name>` with a `detail`: `theme`, `progress`, `chapter`, `weather`, `ripple`, `found`, `wink`, `tilt`, `sound`, `lens`, `drawer`, `reel`, `ready`; and since 2.1 `fold`, `stack`, `secret`, `field`, `popup`; and since 2.2 `cloth`, `lamp`, `stretch`, `sense`, `guide`, `guardian`, `taste`.

## Progressive enhancement

- No JS: `df-no-js` keeps every reveal visible; the poster stands in for the world; links and buttons that open things are plain links or degrade to anchors.
- No canvas or WebGL: the same.
- Reduced motion: every module checks it at run time and draws on demand instead of looping.
- Missing sensors, controller or microphone: the controls that need them explain themselves and stay out of the way.

## Storage

`df:theme` (local storage: the chosen theme, kept) and `df:sound` (session storage: this visit only), and since 2.1 `df:secret:<id>` (local storage: a secret once opened, so it starts named next time), and since 2.2 `df:guide:<id>` (local storage: the steps found). The inferred state is never stored. Every read and write is wrapped; a page works with storage blocked.

## Frames and embedding

A page inside an `<iframe>` gets motion sensors, controllers and the microphone only if the frame allows them: `allow="accelerometer; gyroscope; magnetometer; gamepad; microphone; fullscreen; autoplay"`. Without that, the TiltChip says where the sensors are.

## Budgets

- One canvas; device pixel ratio capped at 2; up to 240 particles; the loop paused when hidden.
- bundle.js under 120 KB (64 KB in 2.1, 60 KB before), bundle.css under 60 KB, before compression; fonts are the largest cost: load only the families a page uses.
- Evergreen browsers. `color-mix()`, `:is()`, `backdrop-filter` and `svh` units are used with fallbacks (solid surfaces where blur is missing).

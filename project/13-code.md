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

## The API

`Depthfield.init(options)` binds all of the above and returns the API. Underneath: `theme` (`get`, `set`, `toggleFace`, `init`), `story`, `reveal`, `world`, `hotspots`, `eye`, `tilt`, `sound`, `lens`, `drawer`, `dialog`, `found`, `reel`, `focus`, `cursor`, `slider`, `icon`, `icons`, `haptic`, `token`, `reducedMotion`. Each is typed in `index.d.ts`.

Events arrive on `window` as `df:<name>` with a `detail`: `theme`, `progress`, `chapter`, `weather`, `ripple`, `found`, `wink`, `tilt`, `sound`, `lens`, `drawer`, `reel`, `ready`.

## Progressive enhancement

- No JS: `df-no-js` keeps every reveal visible; the poster stands in for the world; links and buttons that open things are plain links or degrade to anchors.
- No canvas or WebGL: the same.
- Reduced motion: every module checks it at run time and draws on demand instead of looping.
- Missing sensors, controller or microphone: the controls that need them explain themselves and stay out of the way.

## Storage

`df:theme` (local storage: the chosen theme, kept) and `df:sound` (session storage: this visit only). Every read and write is wrapped; a page works with storage blocked.

## Frames and embedding

A page inside an `<iframe>` gets motion sensors, controllers and the microphone only if the frame allows them: `allow="accelerometer; gyroscope; magnetometer; gamepad; microphone; fullscreen; autoplay"`. Without that, the TiltChip says where the sensors are.

## Budgets

- One canvas; device pixel ratio capped at 2; up to 240 particles; the loop paused when hidden.
- bundle.js under 60 KB, bundle.css under 60 KB, before compression; fonts are the largest cost: load only the families a page uses.
- Evergreen browsers. `color-mix()`, `:is()`, `backdrop-filter` and `svh` units are used with fallbacks (solid surfaces where blur is missing).

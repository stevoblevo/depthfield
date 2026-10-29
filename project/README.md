Depthfield is a dark-first kit for scroll-driven, immersive sites: full-bleed scenes, pinned media, big editorial type and a minimal HUD. The content is the spectacle; the UI stays quiet and gets out of the way.

The system has three skins (mint, peach, thread) in two faces (night, day) plus a high-contrast theme; a world canvas with real depth; thirty components with live previews; a behavior bundle (`window.Depthfield`); an icon set and a mark; and the rules below. This page is the short version. The sections after it go deep: depth, motion, layout, color and theming, type, iconography, the world, input, sound, accessibility, writing, patterns, code and governance.

## Principles

- **The scene leads, the UI recedes.** Media runs full-bleed at `radius-none`. Chrome (HUD, nav, captions) floats on `surface-raised` and never competes with the picture.
- **One accent per screen.** `mint` marks the single thing that matters right now: the primary action, the active chapter, one word in a headline. If two things are mint, one of them is wrong.
- **Type is architecture.** Display lines are set huge in Fraunces and do the work an illustration would. Body copy stays narrow and calm.
- **Motion has a reason.** Every movement reveals, connects or orients. Nothing loops for decoration.
- **Night first.** Design in `night`; `day` is a full alternate, not an afterthought — check both.

Added in 2:

- **Depth is earned.** Three planes, never more; each moves for a reason (the pointer, the scroll, the phone's tilt) and by a token amount. Flat is fine; fake depth is not.
- **The art carries its own light.** The world is a night scene in every face. Text over it uses the art inks (`art-ink`, `art-accent`); the day face changes the chrome, not the sky.
- **Everything has a second way in.** Nothing needs motion sensors, a microphone, a controller, sound or a mouse. Every hotspot is a real button; every scene is readable with JS off.

In the peach and thread skins, read `mint` above as the skin's accent (`accent` aliases `mint`, `peach` or `thread`).

## Voice

- Short, declarative, present tense. "The floor drops away." not "You will experience the floor dropping away."
- Second person sparingly; never exclamation marks; no emoji.
- Eyebrows are uppercase mono and numbered: `CHAPTER 02 — SIGNAL`.
- Calls to action are verbs: "Begin", "Enter", "Keep scrolling", "Skip intro".

## Start here

Load `tokens.css`, `components/bundle.css` and `components/bundle.js`; set the theme on `<html>` and call `Depthfield.init()`:

```html
<html data-theme="night">
<body class="df-page df-no-js">
  <canvas class="df-world" data-df-world="glasshouse" aria-hidden="true"></canvas>
  <main class="df-over-art">
    <section class="df-scene" data-df-chapter>
      <div class="df-scene__block">
        <header class="df-chapter" data-df-reveal><span class="df-chapter__eyebrow">Chapter 01 — Glasshouse</span><h1 class="df-h-xl">Cool <em>air</em></h1></header>
        <p class="df-lede" data-df-reveal>The picture is the page. Move through it, then press anything that looks like decoration.</p>
      </div>
    </section>
  </main>
  <div class="df-hud"><div class="df-progress" data-df-progress role="progressbar" aria-label="Story progress"><span data-df-ch>01 / 04</span><span class="df-progress__track"><span class="df-progress__fill"></span></span><span data-df-pct>000%</span></div></div>
  <script>Depthfield.init();</script>
</body>
```

| Theme (`data-theme`) | Skin | Face | Use for |
|---|---|---|---|
| `night` | mint | night | the default; glasshouse worlds, tools, design pages |
| `day` | mint | day | the same pages in daylight |
| `peach-night` | peach | night | weather worlds, game hubs, warm stories |
| `peach-day` | peach | day | the same in daylight |
| `thread-night` | thread | night | ledgers, architecture and version pages (Bodoni and Alegreya) |
| `thread-day` | thread | day | the same in daylight |
| `contrast` | high contrast | night | anyone who asks for more contrast (AAA text, 3:1 borders) |

## Color

- Ground everything on `void`. Step up to `surface` for bands, `surface-raised` for anything floating; `chrome` for translucent fixed bars.
- Text: `ink` for primary, `ink-muted` for captions and metadata, on `void`, `surface`, `surface-raised` and `scrim` in every theme.
- `accent` is the one accent: buttons (`on-accent` label), progress fill, active states, one highlighted word set in `display-italic`. It aliases the skin's hue; a weather world moves it with the weather.
- `cue` (frost) is reserved for live interaction cues (drag, hold, hotspot, the tilt bubble, hints). Never put it next to `accent` in one component.
- Text over imagery or the world sits on a `scrim` panel, or rides the art with the over-art type shadows — never raw over media.
- `line` is decorative (≈1.4:1) except in `contrast`. Controls get a border in `ink-muted` or a fill, never `line` alone.
- `danger` is errors only, always with a word or icon. Status is told by Chip shapes, never by color alone.

## Type

- Load from Google Fonts: Fraunces (variable, opsz 9–144, wght 300–600, italic), Hanken Grotesk (400–600), JetBrains Mono (400–500); the thread skin adds Bodoni Moda and Alegreya.
- `display-xl` once per page (the opening, `df-h-xl`). `display-l` for chapter titles, `display-m` for scene statements. Scale display styles fluidly with `clamp()` as each style's usage note gives; the token value is the max.
- `eyebrow` above every chapter title; `readout` for numbers (tabular); `hint` for the one-line interaction hint, in `cue`.
- `lede` beside scenes (max `size-measure-lede`), `body` for reading (max `size-measure-body`). Never set body copy on media.

## Layout and space

- Beats are `scene-beat` (100svh) tall with `scene-gutter` inline padding: `space-4` on phones to `space-6`.
- Rhythm: `space-9` between sections, `space-10` between static chapters, `scene-section` around static sections. Pinned scenes size in viewport units (`100svh` per beat) instead of spacing tokens.
- Use a 12-column grid inside `size-container`; text blocks span 5–6 columns and sit to one side of the subject, not centered over it.
- Layers: `z-scene` → `z-content` → `z-hotspot` → `z-caption` → `z-lens` → `z-chrome` → `z-drawer` → `z-hud` → `z-overlay` → `z-cursor`.

## Motion

- Durations `dur-fast` (hover), `dur-base` (UI in and out), `dur-slow` (text reveals), `dur-scene` (crossfades, weather), `dur-stagger` (60ms between lines); easings `ease-out` (arrivals), `ease-in-out` (camera), `ease-scrub` (linear: anything tied to scroll).
- Text reveals: rise 24px + fade, `dur-slow` `ease-out`, lines staggered `dur-stagger`, once (`data-df-reveal`).
- Scroll-linked motion is scrubbed (tied to scroll position), not triggered, for camera and parallax; triggered for text.
- Parallax depth tops out at `depth-scroll-max` (0.3×) scroll speed for backgrounds; the world's planes move by the `depth-*` tokens.
- `prefers-reduced-motion: reduce`: no scrubbing or parallax; crossfades only at `dur-fast`; autoplay video paused with a play control; the world draws on demand.

## States and accessibility

- Focus: `border-focus` solid `focus` ring at `border-focus-offset` (3px over art) on every interactive element; never removed.
- Hover lifts color, not size: the primary button gains `shadow-glow` at night.
- Every scene must be readable with JS/WebGL off: provide a static poster image and the text in DOM order.
- Sound is always off by default with a visible toggle in the HUD.
- Provide a "Skip intro" control on any pinned sequence longer than three beats.
- Camera, microphone and motion are asked for explicitly, from a tap, never on load.

## Imagery

- Full-bleed, `radius-none`, dark and high-contrast; let shadows go to `void`.
- Prefer real photography, video, 3D and the generated world over illustration. No stock gradients, no glows used as decoration.

## Iconography

- Use the Depthfield set (Icons): 24px grid, 1.5px round strokes, at `size-icon-sm/md/lg` in `ink` or `ink-muted`. In code call `Depthfield.icon(name)` (drawn in `currentColor`) or put `data-df-icon="name"` on an empty element.
- The mark (Mark, proposed) is the lens: a slab with the depth rings cut from its corner. Until a site has its own logo, set its name in `eyebrow` or as the Ribbon's italic display mark.

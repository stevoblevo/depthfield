<img src="site/icons/icon-192.png" alt="Depthfield mark" width="84">


**Patch 2.5.1:** Newly found night pets stay visible when browser storage is full or temporarily unwritable. Pending discoveries are saved alongside other kits’ progress on the next successful find. [Open the 2.5.1 showcase](https://stevoblevo.github.io/depthfield/v/2.5.1/).

# Depthfield

A dark-first design system for scroll stories. The content stays in front; generated mountains, weather and a quiet HUD give it depth.

It is the night half of Bleve's toolkit family, beside Storeybrook (day) and Hypermetapunk (dusk): seven looks, a component bundle exposed as `window.Depthfield`, and for canvas a plate, a pen and the night pets.

**Mint, peach and thread in night and day, plus high contrast**

[Open the showcase](https://stevoblevo.github.io/depthfield/) · [Read the interactive docs](https://stevoblevo.github.io/depthfield/docs.html) · [Compare the Saelion toolkits](https://saelion.co/toolkits)

## Try it

[Watch the seven-shot reel](https://stevoblevo.github.io/depthfield/?autoplay). To try it by hand, find a spore in the glasshouse, then scroll until the weather changes. The opening tour is not a catalog of every component.

## Use it in a page

From the repository root, save this as `scratch.html` and run `python3 -m http.server 8701`. Open `http://localhost:8701/scratch.html`. No package install is needed for this example. The kit stylesheets can load web fonts; your browser uses fallback fonts when unavailable.

```html
<!doctype html>
<html lang="en" data-theme="night">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Depthfield example</title>
  <link rel="stylesheet" href="v/2.5.0/tokens.css">
  <link rel="stylesheet" href="v/2.5.0/bundle.css">
  <script src="v/2.5.0/bundle.js"></script>
</head>
<body class="df-page">
  <a class="df-btn df-btn--primary" href="#chapter">Keep scrolling</a>
  <h1 id="chapter">The glasshouse</h1>
</body>
</html>
```

Use the three files from the same [2.5.0 runtime](v/2.5.0/), the first versioned build that holds the plate, the pen and the pets together; every earlier one stays where it was, byte for byte, and each version keeps its own showcase (`v/2.5.0/`, `v/2.4.0/`, `v/2.3.0/`). The [version manifest](v/index.json) records SHA-256 hashes. See the [Button](project/components/Button/README.md) for markup.

## Draw with it on canvas

- **The plate** (in `bundle.js`): `Depthfield.plate('scan' | 'stage', source)` takes one canvas of flat fills and returns it as a contour scan or a footlit stage. Storeybrook and Hypermetapunk make plates from the same source canvas. See [Plate](project/components/Plate/README.md).
- **The pen** (`v/2.5.0/pen.js`, after `bundle.js` or alone): `Depthfield.looks` lists the seven looks as data, each with the mood it rewards in play, and `Depthfield.pen(look)` draws the world: sky, sun, stars, three ridges, haze and four weathers. See [Pen](project/components/Pen/README.md).
- **The night pets** (`v/2.5.0/pets.js`): `Depthfield.pets` holds the five pets found in the showcase, their place in the family's shared save, and `draw(ctx, id, o)`. See [Pets](project/components/Pets/README.md).
- **The family's page**: [`family/`](family/index.html) makes one drawing in every look of all three kits.
- **Saelion Rock**: [`family/rock/`](family/rock/README.md) is one living 3D island with every look of all three kits as a live material over it. Live at <https://saelion.co/rock>.

## Project notes

[Brand book](project/README.md) · [Component types](project/components/index.d.ts) · [Project plan](docs/plan.md)

The [Claude artifact](https://claude.ai/artifact/2yngsrbj7HRDirATXbTwMz) is the design source of truth and may require access. The public repository and demos do not require Claude. For site development and checks, see [AGENTS.md](AGENTS.md).

### The toolkit family

[Storeybrook](https://github.com/stevoblevo/storeybrook) · [Hypermetapunk](https://github.com/stevoblevo/hypermetapunk) · [Shared toolkit contracts](https://github.com/stevoblevo/depthfield/blob/main/docs/family.md)

### License

The source is publicly viewable. No repository-wide license is published here; public visibility does not grant general permission to reuse or redistribute the code or artwork. Check individual notices for third-party materials, and ask the owner before reusing toolkit assets or code outside the repository.

<details>
<summary>Repository reference and maintenance notes</summary>

## Layout

```
SKILL.md                     How the Design System artifact format works (file shapes, caps, write order)
project/
  README.md                  Brand book — start here
  01-depth.md … 19-taste.md
                             Foundations, one topic per file:
                             depth, motion, layout, color, type, iconography, world,
                             input, sound, accessibility, writing, patterns, code, governance,
                             folds and play, letters, threads and light, companions, taste
  design-system.json         Index: title, namespace, libraries, asset-group records
  tokens.json                All tokens (color themes, type, spacing, radius, shadow, …) as lists
  components/
    bundle.js                One classic script that assigns window.Depthfield
    bundle.css               Component styles
    index.d.ts               Types, as documentation of the API
    <Component>/README.md    Usage guidelines (first sentence = summary)
    <Component>/preview.html Live preview card
  assets/
    Icons/                   37 icons (24px grid, 1.5px strokes) + README
    Mark/                    The proposed mark, night and day versions + README
```

## Notes on the export

- **Icon and mark SVGs** came from the artifact's asset store and sit under `project/assets/<Group>/` by the names in `design-system.json` → `assetGroups`. The asset files are drawn in a fixed #5c766e; in pages, use `Depthfield.icon(name)` from `bundle.js`, which draws in `currentColor`.

## What is not here

- **The artifact's other generated files.** `api/` and `manifest.json` are built by the artifact page and are not needed here.
- **Artifact runtime.** `artifact-type/` (the viewer's `app.js`, `app.css` and references) belongs to the hosting type, not to this system.

## The site

`index.html` is the showcase (with `site/showcase.css` and `site/showcase.js`). `docs.html` and the rest of `site/` make up the docs. The **Theme** menu in the header switches the whole site, the cover and every live preview between the system's styles. Depthfield's three skins each have a night and a day face, so a sun/moon button flips between them. The choice is kept in the address (`?theme=…`), so a link opens in the same style, and picking a look inside a preview, such as Storeybrook's own Looks component, restyles the site too. It loads each preview the way the artifact does: `project/tokens.css`, `components/bundle.css` and `components/bundle.js` come first, and `<html data-theme>` is set to the theme picked in the header.

- `project/tokens.css` is compiled from `project/tokens.json` by `site/build.py`, following the artifact's tokens.css rules: one `[data-theme]` block per theme, `--font-*` families, a class per type style.
- `site/site.json` is the site's index (sections, components, assets, style groups), and `site/hooks.css` repeats the bundle's per-look defaults so a look can sit inside another (the style cards). Both are written by the same script from `site/config.json`.
- `site/vendor/` holds pinned copies of marked 12.0.2 and DOMPurify 3.1.6 for rendering the Markdown.
- `.nojekyll` makes Pages serve the raw files.

### Full screen on phones

- **Android and iPad:** the first tap anywhere asks the browser for full screen (browsers only allow it after a tap), and the browser's bars fold away. Leaving full screen is respected for the rest of the visit. The full-screen button in the header switches it back on.
- **iPhone:** Safari gives full screen only to sites opened from the Home Screen. A one-time hint says so: Share, then Add to Home Screen. The site ships `manifest.webmanifest` (`display: fullscreen`) and Apple's web-app meta so it opens there without Safari's bars.
- The browser's own chrome (`theme-color`) is tinted to the ground of whatever is on screen, and the page paints its background before any stylesheet loads, so a slow font never shows a white screen.
- All of this is in `site/immersive.js`, which is shared with the sister site and has no dependencies.

### The adventure and the reel

- **Night pets.** Five are hidden in the showcase: three spores in the glasshouse (chapter 01), Winkle, who comes off the ridge when you wink at the eye (chapter 04), and a firefly drifting over the night garden (chapter 07). Whatever you find follows your pointer through the art; without a pointer, the pets take a slow loop over the near ridge. The **pets** chip in the HUD opens the list, with a hint for each one still out there.
- **The reel.** "Watch the reel" (in chapter 01, the ribbon, the pets list and the footer) plays the whole story in seven shots, about 47 seconds: it catches the spores, flips a setting, scrubs the weather, winks the eye, turns the lens on and off, and catches the firefly. Any key, wheel or touch hands control back, with every setting as it was. `?autoplay` starts it from a link, which is how the home-screen shortcut works. It never starts on its own.
- **Shared with Storeybrook and Hypermetapunk.** The three sites save to one `localStorage` key, `crossing:pets` (`sb:`, `df:` and `hmp:` ids), on the same origin. The pets list counts Storeybrook's seven day pets and Hypermetapunk's five dusk pets beside the five night pets; finding all seven of Storeybrook's puts Saelion in Depthfield's night sky as a constellation, and all seventeen open the lattice in AND SO.
- Reduced motion keeps the reel's cuts but drops the camera moves, and the pets wait in a row instead of following.

### Taste

Open any page with `?df-taste` in its address and the bundle lists the tells that make a page read as generated (see `project/19-taste.md`). The showcase passes its own check.

After changing anything under `project/`, run `python3 site/build.py` and commit the output.

## 2.3.0: the pen

`project/components/pen.js` adds `Depthfield.looks` (the seven looks as data) and `Depthfield.pen(look)`: a look's inks resolved to RGB and the world drawn on canvas (sky, sun, stars, three ridges, haze, vignette) in any of the four weathers. It works after `bundle.js` or alone, so a single-file game can use it. Versioned builds start here: pin `v/2.3.0/` (`tokens.css`, `bundle.css`, `bundle.js`, `index.d.ts`, `pen.js`); `tools/release.py` never rewrites a published version. Family tasks F2 and F4.

## 2.4.0: the night pets in the kit, and the rim light

`project/components/pets.js` adds `Depthfield.pets`: the five night pets as data (`list`), the shared save (`has`, `find`, `count`, and `total()` across Storeybrook, Depthfield and Hypermetapunk) and `draw(ctx, id, o)`, which draws each pet on canvas, lit like the art, from 24 to 160 px, dancing to a beat with a swing. Storeybrook and Hypermetapunk offer the same object for their pets (family task F9). The showcase now takes its pets, their save and their drawing from it. The pen gains `rim()`, which lights any creature drawn elsewhere as if it stood in the Depthfield night. Pin `v/2.4.0/` (`tokens.css`, `bundle.css`, `bundle.js`, `index.d.ts`, `pen.js`, `pets.js`); `v/2.3.0/` is unchanged.

## 2.5.0: one build with the plate, the pen and the pets

Two lines of work met here. The plate (`Depthfield.plate`, `tint`, `edges`; family task F9a) reached `main` on 23 Nov as "2.3" and was served from `project/`, but was never cut to `v/`. The pen (2.3.0) and the pets (2.4.0) were cut to `v/` on a branch without the plate, and AND SO pins those two folders. 2.5.0 is the first versioned build that holds all three: pin `v/2.5.0/` (`tokens.css`, `bundle.css`, `bundle.js`, `index.d.ts`, `pen.js`, `pets.js`). `v/2.3.0/` and `v/2.4.0/` are unchanged, byte for byte, and `pets.js` in 2.5.0 is the 2.4.0 file.

Each version keeps its own showcase too: open `v/2.5.0/` for the page as it shipped, running on that version's runtime, and `v/2.4.0/` or `v/2.3.0/` for the ones before it (back-filled from their branches). `tools/release.py` freezes the page with the release and refuses to rewrite it; `tools/landing.py` does the back-filling.

2.5.0 also gives every look a mood (`Depthfield.looks[i].mood`; family task F10): `lit` for the night faces and High contrast, `still` for the day faces. A game reads it to choose what a look rewards.

## The family's page

`family/index.html` ("One drawing, sixteen looks") makes one drawing in every look of Storeybrook, Hypermetapunk and Depthfield, from the three kits' versioned builds. It lives here because the family plan does (`docs/family.md`). It needs `/storeybrook/v/1.5.0/`, `/depthfield/v/2.5.0/` and `/hypermetapunk/v/0.5.0/` on the same origin, as on GitHub Pages.

</details>

<img src="site/icons/icon-192.png" alt="Depthfield mark" width="84">

# Depthfield

A dark-first design system for scroll stories. The content stays in front; generated mountains, weather and a quiet HUD give it depth.

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
  <link rel="stylesheet" href="project/tokens.css">
  <link rel="stylesheet" href="project/components/bundle.css">
  <script src="project/components/bundle.js"></script>
</head>
<body class="df-page">
  <a class="df-btn df-btn--primary" href="#chapter">Keep scrolling</a>
  <h1 id="chapter">The glasshouse</h1>
</body>
</html>
```

The checked-in 2.3 kit adds the [Plate](project/components/Plate/README.md) for staging flat fills as night materials. Keep all three runtime files on the same commit; this repository does not currently expose a `v/index.json` release manifest. The **2.3** working runtime is distinct from the standalone Pen proposal ([PR #2](https://github.com/stevoblevo/depthfield/pull/2)). See the [Button](project/components/Button/README.md) for markup.

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
- **Shared with Storeybrook.** Both sites save to one `localStorage` key, `crossing:pets` (`df:` and `sb:` ids), on the same origin. Each site counts the other's pets, and finding all seven of Storeybrook's day pets puts Saelion in Depthfield's night sky as a constellation.
- Reduced motion keeps the reel's cuts but drops the camera moves, and the pets wait in a row instead of following.

### Taste

Open any page with `?df-taste` in its address and the bundle lists the tells that make a page read as generated (see `project/19-taste.md`). The showcase passes its own check.

After changing anything under `project/`, run `python3 site/build.py` and commit the output.

</details>

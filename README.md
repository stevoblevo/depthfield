# Depthfield

A design system for scroll-driven, world-behind-the-words pages: three parallax ridges, generated canvas "worlds", night/day/contrast skins, and a small component bundle exposed as `window.Depthfield`.

This repo is a read-only export of the Depthfield design system (index format v3) from its Claude artifact:
<https://claude.ai/code/artifact/93303f79-895a-44d2-b5a8-7a4012464911>

The artifact is the source of truth. Opening that link requires access on claude.ai; everything needed to read the system is in this repo.

**Live site:** <https://stevoblevo.github.io/depthfield/> is the showcase, a scroll story through all seven themes, one chapter each: the glasshouse with three spores to find, day chrome over a night sky, a weather world that turns to red rain, a hub at the mint clearing, a ledger with the reality lens, this repo's own archive, and a high-contrast ending with doors out. The docs (brand book, tokens per theme, every component running live, assets) are at <https://stevoblevo.github.io/depthfield/docs.html>. Both are built from the system's own files.

## Start here

Read [`project/README.md`](project/README.md) first. It is the brand book and explains how the other files fit together.

## Layout

```
SKILL.md                     How the Design System artifact format works (file shapes, caps, write order)
project/
  README.md                  Brand book — start here
  01-depth.md … 14-governance.md
                             Foundations, one topic per file:
                             depth, motion, layout, color, type, iconography, world,
                             input, sound, accessibility, writing, patterns, code, governance
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

After changing anything under `project/`, run `python3 site/build.py` and commit the output.

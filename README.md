# Depthfield

A design system for scroll-driven, world-behind-the-words pages: three parallax ridges, generated canvas "worlds", night/day/contrast skins, and a small component bundle exposed as `window.Depthfield`.

This repo is a read-only export of the Depthfield design system (index format v3) from its Claude artifact:
<https://claude.ai/code/artifact/93303f79-895a-44d2-b5a8-7a4012464911>

The artifact is the source of truth. Opening that link requires access on claude.ai; everything needed to read the system is in this repo.

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
    Icons/README.md          About the 37-icon set
    Mark/README.md           About the proposed mark
```

## What is not here

- **Generated files.** `tokens.css`, `api/` and `manifest.json` are built by the artifact page from `tokens.json` and the bundle, so they are left out.
- **Icon and mark SVGs.** These are stored in the artifact's asset store, not as published files. `design-system.json` records them under `assetGroups`. The same 37 icons are also in `bundle.js` as `Depthfield.icons` / `Depthfield.icon(name)`.
- **Artifact runtime.** `artifact-type/` (the viewer's `app.js`, `app.css` and references) belongs to the hosting type, not to this system.

## Previews outside the artifact

Each `preview.html` expects the host to inject `tokens.css`, the fonts, `bundle.css` and `bundle.js` first. Opened directly (including on GitHub Pages), a preview loads unstyled. For styled output, see the artifact.

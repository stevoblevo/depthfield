# Tool

Small outlined pills for chrome: the ribbon's Lens, Day and Archive, the HUD's sound toggle, close buttons.

**Provide** a `<button class="df-tool" type="button">` with a 16px icon (`<span data-df-icon="lens" data-size="16">`, or inline SVG) and a `<b class="df-tool__label">` word. Toggles carry `aria-pressed`.

- `df-tool--solid`: on `surface-raised` with `shadow-float`, for tools floating over the world (HUD).
- `df-tool--round`: icon only, a 34px circle; needs `aria-label`.
- Labels hide below `bp-medium` (600px) unless `df-tool--keep-label`; the icon carries the meaning there, the `aria-label` the words.
- Every tool keeps 44px of hit area around its 34px box.

**Behaviors** (bundle.js, via `Depthfield.init()`)
- `data-df-tool="face"`: switches night and day within the current skin; the label names the face you would switch to.
- `data-df-tool="sound"`: sound is off until pressed; `aria-pressed` and the label follow; remembered for this visit only.
- `data-df-tool="lens"`: the reality lens; `data-df-banner` names its LensBanner.
- `data-df-open="#id"`: opens a Drawer or a `<dialog>`.

**States**: hover borders in `accent`; pressed (`aria-pressed="true"`) turns border and label `accent`; focus ring as everywhere.

**Don't** use a tool for the page's main action (that is a Button), or put more than four tools in one cluster.

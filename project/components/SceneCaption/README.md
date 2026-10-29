# SceneCaption

A blurred `scrim` card that carries words over live media, the world canvas or video.

**Provide** an optional `df-caption__label` (an interaction cue in `cue`, uppercase mono: "Drag to orbit", "Hold to open"), a `df-caption__title` (`caption-title`) and a `df-caption__body` (`caption`, two sentences at most).

- Static: place it inside the scene at `z-content`, inset `space-6`, on the side away from the subject; max width `size-caption`.
- Live (`df-caption--live`, `role="status"`, `aria-live="polite"`): it follows a Hotspot, fading and rising 8px over `dur-base`; `Depthfield.hotspots()` fills and places it on the far side of the spot and never under the light source.
- `radius-lg`, `scrim` with `blur-backdrop`; where blur is unsupported it falls back to `surface-raised`.

**Contrast**: `ink` and `ink-muted` read on the scrim over the dark two-thirds of the world; over a sun core, use `ink` for the body or move the card.

**Don't** stack two captions per beat, or put body copy over media without one.

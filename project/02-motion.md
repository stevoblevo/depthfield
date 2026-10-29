# Motion

Every movement reveals, connects or orients. The world breathes (particles drift, shafts sway, the eye blinks); everything else moves only when something happened.

## Tokens

| Token | Value | Use |
|---|---|---|
| `dur-fast` | 160ms | hover, press, a glow arriving; every crossfade under reduced motion |
| `dur-base` | 420ms | UI in and out: SceneCaption, FoundCard, drawers |
| `dur-slow` | 900ms | text reveals; the accent following the weather |
| `dur-scene` | 1600ms | scene crossfades, weather blends, letterbox bars, focus pulls |
| `dur-rise` | 1400ms | the hero title rising on load |
| `dur-stagger` | 60ms | between staggered lines or items |
| `dur-wink-open` / `dur-wink-closed` | 2600ms / 160ms | the eye's clock |
| `ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | everything that arrives |
| `ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1) | camera moves, scene transitions |
| `ease-scrub` | linear | anything tied to scroll position: scroll is already the easing |

## Choreography

- **Scrub the camera, trigger the words.** The world, parallax and progress fills follow the scroll exactly (`ease-scrub`). Text arrives once, when it enters, and stays.
- **Reveals**: rise 24px and fade over `dur-slow`, `ease-out`; the eyebrow first, then the title, the lede and the button, `dur-stagger` apart (`data-df-reveal`).
- **The hero** rises 14px over `dur-rise` on load; its thesis line follows 150ms later. Nothing else animates on load.
- **Scene changes** crossfade over `dur-scene` with `ease-in-out`; the weather blends over the same time; the accent follows over `dur-slow`.
- **Presses** answer at once: a ripple from the touch point (8px a frame, fading to nothing in about a second and a half) and a 6ms haptic tick.
- **Hover** answers in `dur-fast`: a color, a glow, a 3px nudge of an arrow. Never a change of size.
- **Pinned sequences** hold the stage for whole beats; past three beats, offer Skip intro.
- **The world's breath** (particle drift, shaft sway, the eye's blink) is the only looping motion allowed, and it stops when the tab is hidden.

## Performance

- One canvas per page; the device pixel ratio capped at 2; particles at one per 6,000–7,000 px² (240 at most).
- Animate `transform` and `opacity` only; never layout.
- The world's loop pauses when the page is hidden and resumes on return.
- Budget 60fps on a mid phone; if a world cannot hold it, halve the particles before cutting anything else.

## Reduced motion

| Normally | With `prefers-reduced-motion: reduce` |
|---|---|
| world loop, particle drift, shaft sway | one still frame, redrawn on scroll, resize and press |
| scroll-scrubbed parallax and sink | none: the planes hold still |
| reveals (rise and fade) | fade only, `dur-fast` |
| scene crossfades and focus pulls | cut, or `dur-fast` fade |
| the eye's clock and tracking | still; it winks only when pressed |
| the cursor ring | absent |
| autoplay video | paused, with a play control |
| the reel | cuts between shots, no moves inside them |

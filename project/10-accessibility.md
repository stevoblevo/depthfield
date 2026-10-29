# Accessibility

The bar is WCAG 2.2 AA in every theme, with a high-contrast theme at AAA. These are the rules in the order a page meets them.

## Reading

- The text of every scene is in the DOM, in reading order, with real headings (`h1` once, then `h2` per chapter). The world is `aria-hidden`.
- Without JS or WebGL the page is a readable story over a poster (`df-no-js` keeps reveals visible).
- Every text pair meets 4.5:1 (large text and marks 3:1) on its grounds in every theme; see Color for the table and the two known shortfalls.
- Color never carries meaning alone: chips have shapes, tags have words, the weather has a name.
- Language is set (`lang`), lines stay under `size-measure-body`, and nothing is set below 12px.

## Operating

- Everything is reachable by keyboard; focus is visible and never removed; Drawers and Dialogs trap focus and give it back.
- Hotspots are real buttons with names ("Mint spore: a hotspot drawn into the art…"), placed after their beat in the tab order.
- Targets are 44px (56px over art).
- Nothing needs a gesture, a sensor, a controller, a microphone, sound or hover; each has a button or key twin.
- Nothing is timed against the reader: captions stay six seconds and return on focus; the reel never starts by itself and stops at any input.

## Motion

- `prefers-reduced-motion: reduce` removes scrubbing, parallax, reveals' rise, the world's loop, the eye's clock and the cursor ring (Motion has the full table).
- Nothing flashes: stars and fireflies ease in and out over two seconds or more, ripples fade over a second and a half, and nothing blinks faster than the eye's 2.76-second clock.
- Scroll-linked camera moves never zoom.

## Announcing

- Live captions and FoundCards are `role="status"` with `aria-live="polite"`; one at a time.
- Progress is a `role="progressbar"` with a value; chapter ticks carry `aria-current="step"`.
- Pressed tools carry `aria-pressed`; the face tool's label names the face it will switch to.

## Asking

Camera, microphone and motion are asked for from a tap, in words that say what happens, with a visible live state and one tap to stop.

## Testing a page

1. Keyboard only, start to end: every hotspot found, every overlay closed with Escape.
2. A screen reader (VoiceOver or TalkBack): the story reads in order, the art is silent, finds are announced once.
3. Reduced motion on: nothing moves by itself; nothing is lost.
4. `contrast` theme, then 200% zoom, then a phone in both orientations.
5. JS off: the story and the poster are there.

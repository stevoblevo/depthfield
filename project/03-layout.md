# Layout

## Windows

| Class | Width | What changes |
|---|---|---|
| compact | under `bp-medium` (600px) | gutters `space-4`; HUD chips hide (but the progress pill stays); tool labels hide; Readouts stack; one VersionCard per row |
| medium | `bp-medium`–899px | gutters grow toward `space-6`; text blocks can sit to one side; two VersionCards per row |
| expanded | `bp-expanded` (900px)–1239px | Station asides take their own column; the ribbon shows the current version's name |
| wide | `bp-wide` (1240px) and up | content stops at `size-container`; the world keeps filling the window; four VersionCards per row |

## The beat

- A scene is a beat: `df-scene`, at least `scene-beat` (100svh), inline padding `scene-gutter`.
- Bottom-anchored beats pad `space-9` above and `scene-pad-bottom` below (room for the HUD); top-anchored (`df-scene--top`) pad `scene-pad-top`. Alternate them so the reader's eye travels down the world.
- One text block per beat, no wider than `size-measure-lede` (34em); `size-measure-narrow` (24em) for a single statement. Right-align a beat (`df-scene--end`) at most once every three.
- Put the block on the side away from the subject: if the sun is right, words go left.
- Image heroes are `scene-hero` tall with the void gradient behind the copy (from the left and from the bottom).

## Static sections

- Between stories, sections pad `scene-section` and sit in `df-wrap` (`size-container`, `scene-gutter`).
- A 12-column grid; text spans 5–6 columns; Stations use numeral / text / aside columns (4.5rem, the rest, 17rem).
- A section head: eyebrow, `thread-title` or `display-m` title with one italic word, one paragraph of `ink-muted`, `space-7` above the content.

## Chrome

- HUD row: fixed at the bottom, inset `scene-gutter` plus the safe area; progress at the start, chips at the end.
- Ribbon: 54px plus the top safe area; set `scroll-padding-top: calc(54px + env(safe-area-inset-top) + 12px)` so anchors land below it.
- FoundCard top-left, LensBanner bottom-centre, ReelHud top-centre: three corners, never stacked.
- Respect `env(safe-area-inset-*)` everywhere something is fixed.

## Spacing

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | icon to label |
| `space-2` | 8px | eyebrow to title; tight stacks |
| `space-3` | 12px | inside a scene block; control padding (vertical) |
| `space-4` | 16px | phone gutter; card padding |
| `space-5` | 24px | control padding (horizontal); paragraph gap |
| `space-6` | 32px | desktop gutter; HUD inset; dialog padding |
| `space-7` | 48px | title block to body |
| `space-8` | 64px | between groups inside a scene |
| `space-9` | 96px | between sections inside a chapter; a beat's top padding |
| `space-10` | 160px | between static chapters |

## Density

One idea per beat. Four to seven beats per story. If a beat needs two paragraphs, it is two beats; if it needs a list, it is a static section.

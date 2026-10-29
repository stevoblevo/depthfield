# Typography

## Families

| Family token | Face | Role |
|---|---|---|
| `display` | Fraunces (opsz 9–144, wght 300–600, italic) | display lines, chapter titles, italic emphasis, display names in cards |
| `sans` | Hanken Grotesk (400, 500, 600) | ledes, body, captions, UI |
| `mono` | JetBrains Mono (400, 500) | eyebrows, readouts, hints, tool labels, chips |
| `display-thread` | Bodoni Moda (opsz 6–96, wght 400–700, italic) | the thread skin's display |
| `body-thread` | Alegreya (400, 500, italic) | the thread skin's reading text |

Load from Google Fonts with `display=swap` (bundle.css carries the import). The fallbacks in each stack keep the shapes close: Iowan Old Style or Georgia for the serifs, the system sans, Menlo.

## Scale

| Style | Size / line | Weight | Tracking | Use (fluid size) |
|---|---|---|---|---|
| `display-xl` | 160 / 0.9 | 300 | −0.03em | the opening title, once per page: clamp(64px, 14vw, 160px) |
| `display-l` | 96 / 0.95 | 300 | −0.025em | chapter titles: clamp(48px, 9vw, 96px) |
| `display-m` | 64 / 1 | 400 | −0.02em | scene statements, pull quotes: clamp(40px, 6vw, 64px) |
| `display-italic` | 64 / 1 | 300 italic | — | the one emphasized word, in `accent` |
| `heading` | 36 / 42 | 600 | −0.015em | content sections inside a chapter |
| `title` | 22 / 30 | 600 | — | panel, dialog and card titles |
| `caption-title` | 20 / 28 | 600 | — | the SceneCaption's title |
| `lede` | 21 / 32 | 400 | — | narrative beside scenes: clamp(18px, 2vw, 21px) at 1.5 |
| `body` | 17 / 27 | 400 | — | reading text, max `size-measure-body` |
| `caption` | 15 / 23 | 400 | — | caption bodies, facts, notes |
| `small` | 14 / 20 | 500 | — | buttons, menu items |
| `eyebrow` | 12 / 16 | 500 | 0.14em | uppercase chapter markers |
| `label-mono` | 12 / 16 | 500 | 0.08em | uppercase tools, jump links, chips |
| `readout` | 13 / 18 | 400 | 0.02em | numbers, tabular |
| `hint` | 13 / 18 | 400 | — | the interaction hint, in `cue` |
| `thread-hero` … `thread-body` | see tokens | | | the thread skin's hero, section titles, stations, numerals and body |

## Rules

- One `display-xl` per page. Chapter titles are `display-l`; never use display sizes for UI.
- Emphasize one word per display line, in italic and `accent`. Two emphasized words means the line is two lines.
- Set display type with `text-wrap: balance` and the optical size the token gives (144 for the big sizes, 72 for `display-m`).
- Eyebrows are numbered and uppercase: `CHAPTER 02 — SIGNAL`, an em dash with spaces.
- Numbers in readouts are tabular and padded where they count up (`042%`, `02 / 05`); dates are ISO (`2026-10-11`).
- Body copy stays on flat grounds at `body` and `size-measure-body`; over the world only display lines, ledes and hints ride, with the over-art shadows (`shadow-type-display`, `shadow-type-lede`).
- Sentence case for titles and buttons. In-world voices (a game's captions, a character) may run lowercase; chrome does not.
- In the thread skin, display lines set in Bodoni Moda (italic for heroes and numerals), reading text in Alegreya at `thread-body`, and every label stays in mono.

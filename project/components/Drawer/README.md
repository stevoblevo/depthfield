# Drawer

A side panel over a veil: the archive of versions, a chapter index, settings.

**Provide** `<div class="df-drawer" id="archive" role="dialog" aria-modal="true" aria-labelledby="…" hidden>` → `df-drawer__panel` → a `df-drawer__head` (an italic display `h2` and a Close tool with `data-df-close`), then content: an eyebrow, a `df-drawer__list` of `df-drawer__item` links (numeral, title with a `small` line, a `df-go` hint), a closing note. Open it from a Tool with `data-df-open="#archive"` (`aria-haspopup="dialog"`, `aria-controls`).

- `size-drawer` (420px) wide, never wider than the window; `surface-raised`, `line` edge, `shadow-drawer`; the veil is the void at 55%.
- Opening moves focus to the first control and traps Tab; Escape, the Close tool and a press on the veil close it; focus returns to the opener.
- Rows hover to `accent-soft`; the current item carries `aria-current="page"`.

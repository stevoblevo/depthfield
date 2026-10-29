# Button

Pill-shaped actions; one primary per screen, in `accent`.

**Provide** a `<button>` (or `<a>` for navigation) with `df-btn` and one variant, and a verb label: "Begin", "Enter", "Keep scrolling", "Skip intro".

| Variant | Use | Paint |
|---|---|---|
| `df-btn--primary` | The one action that matters now | `accent` fill, `on-accent` label; gains `shadow-glow` on hover at night |
| `df-btn--ghost` | Secondary actions over scenes | `ink-muted` border, `ink` label; border goes `ink` on hover |
| `df-btn--text` | Escape hatches: skip, mute, back to top | `ink-muted` label, no box; keeps a 44px target |
| `df-btn--mono` | The thread skin's uppercase pill; any skin's ledger pages | `label-mono` caps, `accent` outline, 46px tall; add `--primary` to fill it |

Sizes: default (`size-control`, 44px), `df-btn--sm` (`size-tool`, 34px, for dense chrome), `df-btn--icon` (a 44px circle; give it an `aria-label`).

**States**
- Hover changes color, never size. Pressed nudges 1px down. Focus shows the 2px `focus` ring at 2px offset.
- Disabled: `disabled` (or `aria-disabled="true"` on a link) dims to `op-disabled`; say why nearby.
- Busy: `aria-busy="true"` adds a spinner after the label (a static half ring under reduced motion); keep the label.
- In the thread skin every button takes the mono caps treatment automatically.

**Arrows**: a trailing `<span class="df-arrow" aria-hidden="true">→</span>` nudges 3px on hover; `↑` (with `df-arrow--up`) for back-to-top, `↗` for links that leave the site.

**Do / Don't**
- Do keep one primary per view; if two things look primary, one is wrong.
- Don't put a button raw over busy media: sit it in a beat with the over-art text shadows, or on `scrim`.
- Don't use a primary for "Skip intro": skipping is an escape hatch (`--text`).

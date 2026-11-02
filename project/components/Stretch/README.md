# Stretch

Display type with a width axis that moves for a reason: Anybody, from condensed to wide, bound to a value the page actually has.

**Provide** a heading with `class="df-h-stretch"` and `data-df-stretch="0.7"` (0 is narrowest, 1 widest; `data-df-stretch-min` and `-max` set the axis range, 50 and 132 by default). Add `data-df-stretch-sense` to bind it to the inferred state (Sense). Or call `Depthfield.stretch(el, { value, min, max, intro, extra })` → `{ to(v), bind(map), unbind(), value }`.

- On load it stretches once from narrow to its value over `dur-stretch`: the type arrives the way fabric does.
- Bind it to something real: the inferred state (tense when caffeinated, wide when calm), a scripted rehearsal, a level, a loudness. A width that moves at random is decoration; say what drives it in words nearby.
- `display-stretch` is a display style for one line per page, instead of `display-xl`. Emphasis is one word in `accent`, upright: the width already carries the voice.
- The face is Anybody (wdth 50–150, wght 300–900), loaded with the kit's fonts.

**Accessibility**: the words never change, only their width; keep the line short enough to fit at the widest setting. Reduced motion: widths cut instead of easing, and there is no opening stretch.

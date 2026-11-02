# Secret

A hidden mode that shows itself in stages, so a reader who misses it is guided to it instead of locked out.

**Provide** `<button class="df-secret" data-df-secret="life" aria-pressed="false" aria-label="Conway's Life" hidden><span class="df-secret__glyph"></span><span class="df-secret__name">Life</span></button>` among the page's tools, with any of `data-df-after` (ms, default 40000), `data-df-name-after` (ms, default 30000), `data-df-word` ("life"), `data-df-reveal-at` (a selector: reaching it reveals the glyph), `data-df-watch` (a selector: coming back to it names the chip), `data-df-hint` with `data-df-hint-target` (a status line). An echo, `<button class="df-secret-echo" data-df-secret-echo="life" aria-label="Open the hidden mode" hidden>`, is the second door: a footer separator that turns into a diamond. Or call `Depthfield.secret({ id, chip, echoes, after, nameAfter, word, revealAt, watch, hint, onOpen })`.

- Stages: hidden → glyph (a `cue` diamond blinking every seven seconds) → named (the name appears, the chip flashes four times, the hint says where it is) → opened (remembered as `df:secret:<id>`, so the next visit starts named).
- The word is the mode's own name, never a password; typing inside a field never counts.
- One echo at most. Never a timer against the reader, never a modal, never content a reader needs.

**Accessibility**: the chip is a real button with a full `aria-label` from the start; the hint is announced by the page's polite status line; the echo is a button too. Reduced motion: no blinking or flashing; the glyph and a 2px `cue` ring stand still instead.

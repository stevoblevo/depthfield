# ReelHud

The guided tour's bar: shot number, shot name, a tuning or caption line, overall progress and a stop button, with letterbox bars sliding in.

**Provide** the markup below once per page and the shots as data: `Depthfield.reel([{name, tune, cap, d, go, at}], {onStart, onStop})`. Start it from a Button ("Watch the reel") or the entry screen.

- `d` is the shot length in seconds; `go()` sets the scene; `at: [[seconds, fn]]` times beats inside the shot.
- Any key, wheel, press or touch hands control back (the stop button too); `onStop(done)` restores everything the tour changed.
- While it runs, `html.df-reeling` brings the letterbox (`dur-scene`, `ease-in-out`); hide other HUD toasts on phones.
- The shot name sets in the display face, italic; the line in mono and ellipsized.

**Accessibility**: the tour never starts by itself; it announces nothing that is not also on screen; reduced motion keeps the cuts but drops camera moves inside shots.

# Sense

A state inferred from how the pointer moves (arriving, calm, curious, caffeinated, still), shown in a HudChip that says it is inferred.

**Provide** `<span class="df-hudchip" data-df-sense></span>`; `Depthfield.init()` fills it as "state **calm** inferred". Or call `Depthfield.sense({ el, labels, still })` → `{ state, on(fn), destroy() }`. Every change fires `df:sense` with `{state, label, speed, jerk, inferred: true}`.

- Speed and how often the path turns decide it, with a 1.2-second hold so it does not flicker; fourteen seconds without movement reads as still.
- Use it to adapt, quietly: a Stretch headline tensing, a guardian remarking once, a world slowing. Never to judge, score or gate anything.
- Always label it "inferred". People often do not know their own state; a page that guesses must say it is guessing.
- Nothing is recorded or sent; the state lives in the page and is gone when it closes.

**Accessibility**: the chip is text; changes are not announced (it would be noise). Nothing depends on it. Works with a mouse, pen or touch; a keyboard-only reader stays "arriving", which is fine.

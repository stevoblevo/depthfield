# Eye

The wink: one eye shared across the worlds. It follows the pointer, winks on its own clock, and winks back when pressed.

**Provide** the SVG below inside a `<button class="df-eye" type="button" data-df-wink="auto">` with an `aria-label` ("An eye: press and it winks back"). `Depthfield.eye(el)` (or `init()`) wires the look and the wink; in a canvas world pass `eye: true` and it is drawn on the back ridge instead.

- Clock: open `dur-wink-open` (2.6s), shut `dur-wink-closed` (0.16s). Pressing forces a wink.
- Colors are the eye's own art tokens: `eye-white`, `eye-iris` (mint), `eye-pupil`, `eye-glint`.
- It opens in the mint clearing weather; one eye per page.
- Reduced motion: no clock, no tracking; it still winks when pressed.

**Don't** recolor it per skin: the eye is a character, not a control.

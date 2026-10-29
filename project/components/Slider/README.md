# Slider

A continuous setting: tilt sensitivity, warmth, volume.

**Provide** `<div class="df-slider"><div class="df-slider__row"><label for="id">Label</label><output for="id">value</output></div><input type="range" id="id" min max step value></div>`; `Depthfield.slider(input)` (or `init()`) paints the filled part and keeps the output in step.

- 2px track in `line`, filled `accent` to the value; an `ink` thumb ringed in the void.
- 44px tall hit area; arrow keys step; the output shows the value with its unit.

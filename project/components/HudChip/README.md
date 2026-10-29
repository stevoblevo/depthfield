# HudChip

A small HUD readout opposite the progress pill: a count of finds, the weather's name, a mode.

**Provide** `<span class="df-hudchip">label <b>value</b></span>`; the value takes `accent` (and follows the weather). `data-df-weather-name` on the `<b>` keeps it named by `Depthfield.world()`.

- Lives at the right end of the `df-hud` row; hidden below `bp-medium` (600px) unless `df-hudchip--keep`.
- Lowercase label, mono `readout` metrics, tabular numbers: "spores **1** / 3", "weather **red rain**".
- One or two chips at most; each names something the reader is collecting or watching.

# ScrollProgress

The floating HUD pill that tells the reader where they are in the story.

**Provide** `data-df-progress` on the pill, with `data-df-ch` and `data-df-pct` readouts; `Depthfield.story()` fills it from scroll position, chapter by chapter (sections marked `data-df-chapter`).

- Two forms: the track (continuous progress, `readout` numbers, `role="progressbar"`) and ticks (one dot per chapter; `aria-current="step"` on the active one, `is-done` on passed ones). Ticks may be buttons that jump to their chapter.
- Fixed in the HUD row at `z-hud`, inset `scene-gutter` from the bottom-left; hidden during the opening `display-xl` scene.
- The fill tracks scroll 1:1 (`ease-scrub`): no easing, no lag.

**Don't** show both forms at once on phones; don't animate the fill.

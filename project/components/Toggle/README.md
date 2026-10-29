# Toggle

An on/off switch for settings panels: motion, sound, captions, the reality lens.

**Provide** `<label class="df-toggle"><input type="checkbox" role="switch"> Label</label>`; the label says what is on when it is on ("Tilt rolls the voices").

- Off: hollow track with an `ink-muted` edge. On: `accent` track, `on-accent` knob, moved over `dur-fast`.
- 44px target row; focus ring on the switch; disabled at `op-disabled` with a reason beside it.
- Changes apply at once; no Save button behind a toggle.

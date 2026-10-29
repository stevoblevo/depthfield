# Dialog

A centred modal for one decision: permission to use motion or the microphone, leaving a guided tour, resetting progress.

**Provide** a native `<dialog class="df-dialog" aria-labelledby>` with an `h2`, one or two sentences, and `df-dialog__actions` (the safe choice as a ghost Button, the action as primary). Open it with `data-df-open="#id"` or `Depthfield.dialog(el).open()`; `data-df-close` on the buttons that dismiss.

- `surface-raised`, `radius-lg`, `line` border, `shadow-float`; the backdrop blurs the world by `blur-dof-3` and dims it to the void at 60%.
- Escape closes (native); focus starts on the first control and returns to the opener.
- Camera, microphone and motion are always asked for here, explicitly, and never on load: "not spooky".

**Don't** use a dialog for information that could be a SceneCaption, or stack two.

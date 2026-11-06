# The hush room 0.1.0

An optional, non-diagnostic Depthfield art experiment. The two authored palettes carry a dotted doorway with colour differences and a moth with lightness differences. A matching model preview can quiet the palette toward gray, erasing the doorway and reducing colour noise around the moth. Everyone has the same outline and complete-text reveal. No person is assessed, scored, profiled or tracked.

## Candidate boundary

This is an isolated candidate for plan D6, not a live release. Based on Depthfield main `596376ea30dca7353a8bcd39992c7df30d818bcf`. Existing main showcase, Missing Page, `project/`, shared runtime, pets and browser saves remain untouched. No remote services, storage, timers, sensors, audio, dependency or credentials are used by the experiment. It makes no claim that a real viewer will see the model image.

Serve the repository and open `/hush-room/`, or open the packaged standalone HTML locally. The static fallback has an original poster and native expandable story. No-JS controls are hidden rather than left inert.

## Colour method

Machado, Oliveira and Fernandes, *A Physiologically-based Model for Simulation of Color Vision Deficiency* (2009), DOI 10.1109/TVCG.2009.113. Severity-1 matrices are multiplied by decoded linear-sRGB vectors, then clipped to the display gamut and encoded to sRGB. The approximation is applied to the complete raster after drawing. UI, labels and controls are outside that image.

- Paper abstract: https://pubmed.ncbi.nlm.nih.gov/19834201/
- Author matrices: https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
- Independent implementation documentation: https://colour.readthedocs.io/en/develop/generated/colour.matrix_cvd_Machado2009.html

Protan/deutan art colours use an authored linear-RGB family `y * [1,1,1] + a * v`, where `v` is the near-null direction of the selected matrix. Amplitudes are kept in gamut. This produces chromatic original colours at a common modelled neutral level; it is not an indiscriminate grayscale filter. Tritan is a comparison mode, not a promise that the art becomes gray. Its matrix is not near-singular.

The short labels “Approx. protanopia,” “Approx. deuteranopia” and “Approx. tritanopia” describe the chosen model presets, not a user category detected by the page. The 2009 model, display characteristics, partial differences and individual variation limit fidelity. No clinical plates are reproduced. Perceptual feedback with willing participants and an independent Brettel cross-check should precede claims about real viewers.

## Reuse in A nevik / Field

1. Consume the pure `HushColor` palette functions only for a bounded decorative layer, not the entire page or WebGL framebuffer containing gameplay/UI.
2. Keep one canonical game state. The colour layer must not affect collision, objectives, scores, unlocks, health, aim, rhythm or pet inventory.
3. Use a small optional doorway from an existing scene, backed by a named, keyboard-accessible button or link. A `Depthfield.secret` invitation may point here, but its discovery must not unlock necessary content.
4. Keep the accessible “Trace both secrets” and full-text route. If rewards are later added, award them for ordinary interaction through either route, never for a colour identification result.
5. Keep palette selection separate from simulated vision. Default to original art; no persisted vision preference, inferred diagnosis or analytic event.
6. Pin the experiment as a versioned additive component after review. Do not overwrite shared runtime or immutable toolkit releases.
7. Inspect each consumer's current owner/source and publish only through that app's review process. This candidate changes neither A nevik nor Field.

## Checks

`node --test hush-room/model.test.cjs` tests linear-sRGB processing against independent fixtures, neutral preservation, 7,520 palette cases, gamut, input stability and alpha. `tools/check-hush-room.cjs` checks desktop/phone widths, themes, model modes, rendered palette spread, contrast, keyboard/touch, repeated controls, blocked storage, no-JS, forced colours and existing pages. CI only uploads evidence. It never deploys.

Channel-spread tolerances are software checks, not perceptual thresholds or clinical validation. No real screen-reader or physical-display testing is claimed.

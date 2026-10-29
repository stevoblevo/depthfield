# Readout

Labelled values in mono: a ledger strip for facts a reader may want to copy.

**Provide** `<dl class="df-readout">` with `<div><dt>Label</dt><dd>Value</dd></div>` cells; set `--cols` (default 3).

- Labels: `ink-muted` mono caps at 10.5px, tracked .14em. Values: `ink` mono 13px, tabular, wrapping anywhere.
- Cells on `surface`, `radius-md`; one column below `bp-medium`.
- Units live in the value ("37.7749° N", "420 ms"), never in the label.

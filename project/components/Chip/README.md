# Chip

Reality status, told by shape first and color never alone.

**Provide** `<span class="df-chip df-chip--<status>">Label</span>` with one status:

| Status | Glyph | Means |
|---|---|---|
| `observed` | solid `accent` dot | proved: it exists and was seen working |
| `partial` | half-filled dot | some of it is real |
| `progress` | dashed ring | being built now |
| `proposed` | hollow ring | written down, not built |
| `missing` | ring with a slash | needed and absent |
| `rejected` | an X | decided against |
| `candidate` | ringed dot in `accent` | built, awaiting acceptance |

- Mono caps (`label-mono` at 11.5px), `line` outline, `surface-raised` at 70%.
- Under the reality lens chips scale 1.06 with a magenta edge.
- Put the chip right after the claim it qualifies; one chip per claim.

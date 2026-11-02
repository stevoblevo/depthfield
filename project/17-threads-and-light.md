# Threads and light

2.2 adds four ways for matter to answer a hand: a cloth you pull and pluck, a lamp that lights what reflects and spares what glows, type that stretches for a reason, and a string that sounds when plucked. Each shipped first in a real page: the cloth, the tone and the hold in Saelion Loom (October 2026); the lamp and the stretch in the Maesage e-paper explainer and its Direction B sketch.

## The cloth

One canvas, one cloth, two views.

| View | What it is | Threads become | For |
|---|---|---|---|
| `hang` | a tapestry on a loom, beams top and bottom, numbered | warp threads with a weave over and under the bands | an index of things, a family of pages, a ledger |
| `lay` | the same cloth tipped back by `depth-cloth-pitch` into hills under the weather | pennants on the land | a world map, a weather story |

- The warp is the content (one thread per thing, every other column); the weft bands are what the things answer to (layers, skins, chapters). Name both in lists on the page; the cloth is their picture.
- First load weaves it over `dur-weave`: the warp drops from the top beam, then a shuttle carries each weft row across, alternating sides. Once per visit, never on return.
- **Pluck** a thread with a tap: it rings over `dur-pluck`. If sound is on it plays its note (below). Open what was plucked in a card or a FoundCard, never a new page on its own.
- **Pull** with a drag: the cloth follows the hand, eased, and springs back. Past `rejectAt` (42% of the short side) it lets go and says so in the page's voice ("Rejected. Pulling harder is not a receipt.").
- **Hold** still for two seconds: the cloth pulses and warms under the hand in `lamp`. Use it for one thing per page.
- In `lay` view the weather is the Weather component's four (peach fall, red rain, mint clearing, night garden) with their `wx-*` colors, ridges behind the horizon, and particles. The HudChip names it.
- A cloth fills its frame: let it be the scene, not a widget in a card. One per page.

## The lamp

- Reflective surfaces (paper, e-paper, pigment, ink, a laid cloth) are lit by the room and the lamp: `lamp.light(u, v)`, falling to `op-lamp-floor` away from it. Emissive things (cues, LEDs, threads, the guardian) are not.
- This is the e-paper truth from the Maesage explainer: a reflective picture fades in the dark; light that is emitted still carries the cue. Draw it that way and the room slider teaches it without a word.
- The pool is `lamp` at up to 24% over `void`, centered on the lamp. The lamp lags the pointer at `depth-follow`.

## Stretch type

- `display-stretch` (Anybody, `wdth` 50–150) is the one display line that moves its width, and only for a reason the page can name: the inferred state, a level, a scripted rehearsal.
- Map tense to narrow and settled to wide. The default map: caffeinated 0.12, still 0.55, curious 0.64, arriving 0.7, calm 0.82.
- It arrives once from narrow to its value over `dur-stretch`, the way stretch fabric settles.

## Tone

- `Depthfield.tone.pluck(k)` plays a plucked string (Karplus–Strong) on the Bohlen–Pierce scale: thirteen steps to the tritave (3:1), degrees 0, 2, 4, 6, 8, 10, 13 from 82.4Hz. Thread `k` plays degree `k`, climbing a tritave every seven.
- `tone.thump()` is the soft low pulse of a held cloth.
- It follows the sound Tool: silent until the reader turns sound on, then on for the visit. Sound never carries anything alone.

## Invitation and contact

A page that asks for a touch shows two kinds of mark and never confuses them:

| Mark | Drawn as | Lasts |
|---|---|---|
| an invitation | light: a ring that opens and closes in `dur-cue` (800ms) | until it closes; it records nothing |
| a contact | pigment or a mark that stays | until cleared; it is the record |

Then read the response in a `dur-response` (1200ms) window. Light asks; marks remember. Never count an invitation as a touch.

# Depth

Depth is the system's name and its main idea: the words sit on a world that has distance in it. Use exactly the planes below, move each one for a reason, and move it by a token amount.

## The planes

| Plane | Layer token | What moves it | By how much |
|---|---|---|---|
| Sky and sun | `z-scene` | the pointer leads the sun; the scroll lowers it | sun x follows the pointer; y `18%`→`32%` of the height over the scroll |
| Back ridge | `z-scene` | pointer, scroll, tilt | `depth-pointer-back` (18px) across the pointer's travel; sinks `depth-sink-back` (60px) |
| Middle ridge | `z-scene` | pointer, scroll, tilt | `depth-pointer-mid` (36px); sinks `depth-sink-mid` (130px) |
| Front ridge | `z-scene` | pointer, scroll, tilt | `depth-pointer-front` (64px); sinks `depth-sink-front` (220px) |
| Particles | `z-scene` | the pointer parts them; presses push them | a 118px radius around the pointer; ripples push along their ring |
| Scene text | `z-content` | the scroll only | 1:1 (text never parallaxes) |
| Hotspots, captions | `z-hotspot`, `z-caption` | the plane they belong to | they ride their ridge |
| Chrome, HUD, overlays | `z-chrome` … `z-overlay` | nothing | fixed |

- Three ridges, never more. A fourth plane reads as noise, not distance.
- Planes move with the pointer, nearer planes more: that is what makes the near ones near. Ease them after the pointer at `depth-follow` (0.05 a frame at 60 fps), so the world feels heavy, not twitchy.
- Scrolling is the camera descending: every plane sinks, the nearest fastest. Any backdrop that scrolls by itself stays under `depth-scroll-max` (0.3 × the scroll).
- A phone's tilt adds to the pointer: `depth-tilt-gain` (2.2) turns the tilt's sine into pointer travel, clamped to the full travel.
- Text never moves with parallax. It scrolls 1:1 and holds still while you read.

## Depth of field

Blur by distance from the plane in focus, with `blur-dof-1` (2px) one plane away, `blur-dof-2` (6px) two away and `blur-dof-3` (12px) three or more.

- Open a Dialog and the world behind it falls to `blur-dof-3`; close it and it comes back over `dur-scene`.
- A scene may pull focus from far to near (`Depthfield.focus(planes, index)`) on a chapter change, over `dur-scene` with `ease-in-out`.
- Never blur text, hotspots or anything a reader needs to read or press.
- Reduced motion: focus changes jump; nothing animates.

## Atmosphere

- **Haze**: a band between ridges at up to `op-haze` (8%) in `gh-haze`, thinning as the camera descends.
- **Light shafts**: seven additive shafts from the sun at `op-shaft` (7%), swaying by 0.02 rad; glasshouse worlds only.
- **Rim light**: each ridge edge strokes 1.2px in the world's rim hue, fainter with distance (25% front to 15% back).
- **Vignette**: the corners fall to `art-void` at `op-vignette` (75%), so the eye stays in the middle and the HUD reads at the edges.

## Elevation

Depthfield floats chrome with one shadow, not a scale of them.

| Token | Use |
|---|---|
| `shadow-float` | the HUD, menus, the FoundCard: anything floating over a scene |
| `shadow-banner` | bottom banners: LensBanner, ReelHud |
| `shadow-drawer` | the Drawer's leading edge |
| `shadow-glow` | the primary button's hover and the current knot, at night only |

High contrast swaps every shadow for a 3:1 outline. Day faces keep shadows soft (14% ink) and drop the glow.

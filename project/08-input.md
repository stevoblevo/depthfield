# Interaction and input

Every input is optional. A Depthfield page works with a finger, a mouse, a keyboard, a screen reader, a game controller or a tilting phone, and needs none of the last three.

## Pointer

- **Hover** blooms what is pressable (a spore grows, a door swings ajar, a world name turns `accent`) in `dur-fast`, and shows its SceneCaption.
- **Press** answers where it lands: a ripple in the world, a 6ms tick on phones.
- **Move** parts the particles and leads the sun; the planes follow at `depth-follow`.
- The system cursor stays (a crosshair over the world); the CursorRing is an optional extra for fine pointers.

## Touch

- Targets: `size-target` (44px) for controls, `size-hotspot` (56px) over art. Tools draw 34px and keep 44px of hit area.
- Nothing depends on hover: captions also open on focus and on press.
- Long-press is reserved for one thing: holding the tilt bubble switches tilt off.
- Pinch and two-finger gestures belong to the browser unless a page says otherwise in words.

## Keyboard

| Key | Does |
|---|---|
| Tab / Shift-Tab | moves through scene buttons, hotspots (in reading order after their beat), chrome, then the HUD |
| Enter, Space | presses; on a hotspot, finds it and opens its caption |
| Escape | closes the Drawer or Dialog, turns the lens off, hands the reel back |
| Arrow keys | step Sliders; move between ticks when the tick bar has focus |
| any key | stops a running reel |

Focus is always visible (`focus`, 2px, offset 2px or 3px over art) and never trapped except inside an open Drawer or Dialog.

## Game controller

| Input | Does |
|---|---|
| left stick | moves the focused thing, like a finger (deadzone 0.18, radial) |
| right stick | turns or orbits what the scene shows (deadzone 0.25) |
| A | primary action |
| B | the secondary action |
| X / Y | add, and cycle the view |
| bumpers | pick the previous or next item |
| View | the next skin or look |
| Menu | the settings or tunings sheet |
| L3 | starts or stops the reel |
| R3 | strums, or resets the scene |

Rumble only on landings and blooms: weak 0.15–0.25, strong 0 to 0.35, 40–120ms. A controller connecting shows its map once, as a caption.

## Motion sensors

- **Tilt** (gravity in screen space) adds to the pointer's parallax and, in instruments, rolls things downhill. Past about 12° things move; a dead zone keeps a resting hand still.
- The neutral follows how the phone is held (an 8-second time constant) and snaps home when you come back toward where a roll began, so returning to level never rolls everything back.
- A shake is not a tilt: while the hand accelerates hard (3.5 m/s² and up) the gravity reading holds still.
- **Shake** (a new arrangement), **twist** (turn what the scene shows) and **flick** (strum) are extras; each has a button or key twin.
- The TiltChip shows the live tilt; tap to level here, hold to switch tilt off. On iOS the first tap asks permission. Sensors reach a page in a browser tab and in frames that allow them (`allow="accelerometer; gyroscope"`); when they do not arrive, the chip says where they will.

## Camera and microphone

Asked for explicitly, from a tap, in a Dialog that says what happens to the signal ("Nothing leaves this page"), never on load; a visible state while live; one tap to stop. Not spooky.

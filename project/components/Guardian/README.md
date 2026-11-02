# Guardian

A small companion that follows the hand, watches with one eye, says one dry line when pressed, and can be thrown at things.

**Provide** nothing but a host (the page, or a positioned box): `Depthfield.guardian({ host, home, hello, lines, miss, onLand, onPress, follow, svg })`. It draws the strawberry guardian by default (StrawberrySae, from Saelion Field); pass `svg` (a string, or a function of a unique id) for another, marking the pupil `data-df-pupil` and the eyelids `data-df-lid` so it can look and wink.

- It follows the pointer at `depth-follow`, a little up and to the right, never under it. `follow(pointer)` returns another target (a perch on a ridge, the nearest thread).
- Press it: it says the next of `lines` in its bubble. Drag and let go fast: it is tossed, slides to a stop, and `onLand(x, y)` decides what it hit; return a sentence to have it say so, or nothing for `miss`.
- Its voice is a reviewer's: short, dry, never praise. "Guardian on duty. Nothing gets adopted because I liked it." One guardian per page.
- The art carries its own light: the strawberry and its bubble keep their colors in every theme.
- Events: `df:guardian` with `{say}` or `{landed}`.

**Accessibility**: it is a real button with a name; Enter or Space makes it speak; its bubble is a polite status. Throwing is an extra: anything a throw does has a button or link twin on the page. Reduced motion: no bob, no wink, no toss (a release lands where it is).

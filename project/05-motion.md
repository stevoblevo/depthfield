# Motion

Three things move by themselves, slowly: the light over chrome type (`dur-sheen`, 7 s), the grid floor (`dur-drift`, one square every 3.2 s) and the ticker (`dur-ticker`, 28 s a lap). Everything else moves only when you touch it: stickers wobble back with `ease-snap`, buttons press in, doors lift and brighten (`dur-base`).

## Turning it off

- `prefers-reduced-motion: reduce` stops the sheen, the floor and the ticker; the ticker's items wrap instead.
- A page offers its own switch: a button with `data-hmp-still` sets `html.hmp-still`, kept on this device, with the same effect.
- Nothing flashes, nothing scrolls the page for you, and the ticker stops when pointed at or focused.

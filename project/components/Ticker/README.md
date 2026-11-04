# Ticker

One line of news that runs along a slapped strip, and stops when you point at it or tab into it.

**Provide** `<div class="hmp-ticker" aria-label="Tonight"><div class="hmp-ticker__track"><span>Twelve odd jobs tonight</span><span>A fold bench opens</span>…</div></div>`. `Hypermetapunk.ticker(el)` (run by `init`) copies the items once to make the loop and hides the copy from readers. `hmp-ticker--magenta` changes the strip.

- Four to eight short items; each makes sense alone. One ticker a page.
- Links inside it are fine; they pause the run when focused.

**Accessibility**: the items are read once, in order (the copy is `aria-hidden` and out of the tab order). Reduced motion and the page's motion switch stop it and let the items wrap.

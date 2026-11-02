# Letters

Depthfield in an inbox. Email clients drop most of what a page relies on, so a letter is built differently and judged by the same voice.

## Rules

- One column, `size-letter` (600px) wide, built from `role="presentation"` tables. Every style inline; no script, no external stylesheet, no web font relied on.
- Colors are literal values copied from the skin's night face, because mail clients ignore custom properties. Set `bgcolor` on the outer table as well as `background`, for clients that strip styles.
- Type uses system stacks: display in "Arial Narrow", "Helvetica Neue", Arial, bold; body in Georgia; labels in "Courier New", uppercase with letter-spacing.
- The structure mirrors a page: a hidden preheader line, an eyebrow, one title, a dek, a verdict row of up to three cells, sections with an eyebrow and a title, one action, sources.
- One action, a link drawn as a pill. Write its destination out in the plain-text part.
- Always send a plain-text alternative with the same words in the same order.
- Images are optional and never carry information; the letter reads with them off.
- Stay under 100 KB so long letters are not clipped.

## A letter in a page

When a letter also lives in a page, show it as a `df-fold--letter` inside a `df-letter-frame`: three panels, the bottom flap first, so the page and the inbox say the same thing. Paper in the page is `surface-raised`; in the inbox it is the literal night surface.

## Voice

The same as everywhere: short, declarative, dry. A P.S. may point at a secret; it never explains one.

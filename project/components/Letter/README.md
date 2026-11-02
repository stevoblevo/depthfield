# Letter

Depthfield in an inbox: an email built from tables and inline styles that says what a page would say.

**Provide** one 600px (`size-letter`) column of `role="presentation"` tables, every style inline, colors as literal night-face values (mail clients ignore custom properties), `bgcolor` beside every `background`. In order: a hidden preheader line, an eyebrow (`"Courier New"`, uppercase, spaced), one title (`"Arial Narrow"`, bold), a dek (Georgia), a verdict row of up to three cells, sections each with an eyebrow and a title, one action drawn as a pill, sources, and a quiet footer line. Send a plain-text alternative with the same words.

- No script, no external stylesheet, no web font relied on; images optional and never carrying information.
- One action; write its destination out in the plain-text part.
- Under 100 KB so long letters are not clipped.
- In a page, show the same letter as a `df-fold--letter` inside a `df-letter-frame`.

**Accessibility**: real headings (`h1`, `h2`) and real tables only for layout (`role="presentation"`); link text says where it goes; contrast follows the night face's table.

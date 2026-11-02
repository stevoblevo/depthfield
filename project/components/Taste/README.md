# Taste

A lint for pages: `Depthfield.taste()` reads the rendered page for the tells that make it look generated and returns findings, each with the rule, a sample and a fix. It never changes anything.

**Provide** nothing. Open any page with `?df-taste` in its address and `Depthfield.init()` shows the findings in a small panel (bottom left). Or call `Depthfield.taste({ scope, log })` → `[{ rule, severity: 'warn' | 'info', count, sample, fix }]`, and `Depthfield.taste.badge(findings)` to show them.

| Rule | Looks for |
|---|---|
| `one-display-xl`, `two-emphases` | more than one display-xl; two emphasized words in one display line |
| `italic-second-line` | a whole italic second line, more than once (the template headline) |
| `words-to-leave-out`, `exclamation`, `emoji` | Writing's banned words and marks in the page's own copy |
| `diminutive-tic`, `becomes-slogan` | "a little", "a hint of" four times or more; "X becomes a Y" twice |
| `eyebrow-flood` | more small letter-spaced capitals than twice the chapters, plus two |
| `identical-tiles`, `duplicate-inventory` | four or more siblings ending in the same label; one set of choices shown three times |
| `mode-stack`, `settings-sidebar` | four or more mode switches; an aside full of settings beside the picture |
| `no-first-gesture`, `showroom-hero` | nothing to pull, press or drag in the first screen; a render filling the first screen with nothing that answers |
| `unnamed-control`, `stock-face` | a button or link with no name; a stock grotesk (Inter, DM Sans, Roboto…) |

- Every rule came from a real review (Maesage Study 03, November 2026): each tell it names was on a page that read as made by a model.
- `warn` is a rule from this system's own chapters; `info` is a smell worth a second look. A page can ship with an `info` it means.
- Run it on every new page before review, in each theme. It reads layout, so run it at desktop and phone widths.

**Accessibility**: the panel is a `<details>` with text findings; it is a tool for authors, shown only when asked for.

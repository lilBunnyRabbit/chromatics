---
"@lilbunnyrabbit/chromatics": minor
---

`Srgb.ensureContrast(bg, ratio, { keepChroma? })`: moves a color to the nearest one (OkLCh hue held, lightness then chroma searched) that reaches a WCAG 2 contrast ratio against `bg`. Mutates, always in gamut; the better of black and white when the ratio can't be reached.

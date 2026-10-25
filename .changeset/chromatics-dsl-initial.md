---
"@lilbunnyrabbit/chromatics-dsl": minor
---

First release: the Chromatics color language as a package (ADR-018). `evaluate(source)` runs a program with a fixed environment (the color package's classes, `parse`, `ensureContrast`, `simulateCvd`, math, `preview` / `tokens` / `component` / `theme`) and never throws; variables carry source spans. `deriveScheme(source, { roles, pairs, auto? })` resolves the host's own roles in light and dark mode, reports unknown role keys as errors, and audits the host's pairs. Exporters: `toCssVars(mode)` for exactly the declared roles, `toPaletteVars` for every color variable, DTCG, Tailwind, Markdown and an SVG swatch sheet.

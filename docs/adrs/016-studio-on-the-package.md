# ADR-016: The studio on the package

**Date:** 2026-10-21
**Status:** Implemented

> **Revision 2026-10-26 (ADR-018):** the language core, previews, design system and exporters moved to `packages/chromatics-dsl`; the studio imports them. `ensureContrast` is no longer a studio builtin but the package's `Srgb.ensureContrast`; the DSL builtin always returns an Oklch now (also when the seed already passes; same displayed hex). `color/contrast-guard.ts` is gone.

> **Revision 2026-10-25:** the baseline is `apps/studio/scripts/baseline.ts` (`bun run baseline`), written to `apps/studio/tests/fixtures/baseline/{models,examples}.json`, one record per line. `models.json`: each backed model (66) read from a 48-colour grid (sRGB cube at 0 / 0.5 / 1, greys, four hexes, twelve OKLCH colours at chroma 0.35, one powerless-hue grey) and built natively at every min / mid / max channel corner; per record the channels, hex, CSS, sRGB gamut flag and `gamutMapped` hex. `examples.json`: each example's entries, light and dark roles, theme vars and CSS export. `tests/baseline.test.ts` pins it until the switch. Two findings already in it: RAL is registered as backed but every culori conversion throws (52 error records), and `gamutMapped` on some in-gamut wide-gamut values shifts them (a98 `#0000ff` → `#0031e5`), from culori's `clampChroma` on tiny negative channels.


> **Revision 2026-10-25: implemented** (branch `feat/studio-switch`)
>
> - `apps/studio/src/lib/models/` (culori, `ColorValue`, the registry, 1,675 lines of custom modes) is deleted; culori is no longer a studio dependency. Studio colour code left: `src/lib/color/` (`catalog`, `spaces`, `contrast-guard`, `legacy`).
> - DSL: `MODEL_CLASSES` keyed by export name (minified builds rename classes); internals hidden by name (`_*`, `assign`, `write`, `alphaOf`, `edges`, `terminal`); channel assignment and `+= -= *= /=`; `new` only on model classes. `theme.dark()` / `theme.light()` remain (builtin namespaces).
> - Display chains as decided (78g): hex `c.to(Srgb).gamutMap().to(Srgb8).toHex()`; theme vars and other CSS `c.to(Oklch).toCss()`; the export's as-defined mode keeps the colour's own `toCss()` when it is valid CSS.
> - `ensureContrast` returns a copy of `fg` when it already passes, otherwise an Oklch colour.
> - Hover and autocomplete read the package's JSDoc through a generated `src/lib/dsl/package-docs.json` (`scripts/package-docs.ts`, freshness test), and the receiver variable's model from the last evaluation. The package now exports the `ChannelPatch` type it uses.
> - Lost by decision: friendly channel labels (the package has names only; `/models` shows the package's channel JSDoc), stable/experimental badges, `scale.*` and the free `token()`.
> - `simulateCvd` is exposed as a builtin (owner, 2026-10-25, bending 78f by one package function): the package's signature, an Srgb argument it mutates. The migrator rewrites old `simulateCVD("deuteranopia" …)` to `simulateCvd(c.to(Srgb), "deutan")`; results differ from culori's, which applied Machado to gamma sRGB.
> - Gate: `apps/studio/tests/fixtures/baseline/review.md`. Brand Dark: 38 of 38 hexes identical. Other example changes are out-of-sRGB colours (clip → CSS 4 mapping), a 1-byte rounding on gamut edges, and HCT tones (the package stores the tone as given).

## Context

Roadmap step 6. The studio's engine (`apps/studio/src/lib/models/`) stores every colour as a raw culori object inside an immutable `ColorValue`. culori is imported in six files, not just `registry.ts`, and about 1,675 lines of custom culori modes sit beside it. The DSL reaches colours through `member()`, with 62 constructors, 196 flat snake_case channel keys (`ok_l`, `itp_t`) and per-model views (`c.oklch.lighten()`). The package covers 65 of the 66 studio models that ship, but under its own names. The studio has 101 registry entries, including 34 coming-soon stubs, RAL, and alias ids such as scrgb, rec601 and xvycc. Features the studio takes from culori and the package lacks: CVD simulation and CSS-style filters, alpha `blend`, ΔE CIE94 / CMC, `clampChroma`. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grill 78.

## Decision

The owner's rule: **follow the package, everywhere; no backwards compatibility.**

- **Colours are package instances (78a).** `ColorValue` goes; app code, analysis, export and state hold package classes. This reverses ADR-010's rejected alternative 4.
- **Freeze at the store boundary (78e).** Colours entering shared state (evaluation results, scheme entries, roles) are `Object.freeze`d, so a mutating call throws a TypeError at the call site. Local work clones first.
- **App code calls the package directly (78g).** No studio helper layer for `.hex`, `.toCSS()`, `.channel()`, `.gamutMapped`: call sites write the package chain (`c.to(Srgb).gamutMap().to(Srgb8).toHex()`).
- **Gamut mapping is the package's CSS Color 4 method (78d).** Out-of-gamut colours' hexes change from culori's `clampChroma`; the baseline dump lists every change for review.
- **The DSL is the package's API (78f, 78h, 78i).**
  - The evaluator exposes the package classes and `parse`. Classes can be called without `new` (`Oklch(0.62, 0.15, 250)`); that is the one convenience.
  - Members are the instances' own properties and methods (`c.to(Oklch).l`, `c.clone().lighten(0.1)`). No flat keys, no `c.oklch` views, no aliases.
  - JS semantics inside a program: `bg = brand.lighten(0.3)` mutates `brand`. Freezing happens only when results leave the program.
  - Saved documents and share links that use the old names stop working.
- **Studio models are the package's models (78j).** The DSL, mixer and pickers expose `/all` under package names. Coming-soon stubs, RAL and alias ids leave the DSL. The `/models` encyclopedia keeps their vault-sourced write-ups as reference text, marked not implemented.
- **Studio features stay; colour free functions go (78k).** `preview.*`, `tokens`, `roles {}`, `component.*` and `theme()` are kept, fed package instances. `mix()`, `contrast()` and `deltaE()` free functions go in favour of the methods. `ensureContrast()` stays a studio builtin until a package grill decides otherwise.
- **The missing culori features go into the package (78b),** each with a cited source and the full test matrix, with its API shape grilled per feature, before the switch: CVD simulation, CSS filter effects, alpha compositing, ΔE CIE94 and CMC.
- **Gate:** a culori baseline dump of the studio (models, hexes, CSS) is generated before the switch and diffed after; differences are reviewed, not forbidden. The Brand Dark golden hexes (`tests/acceptance/brand-dark.test.ts`) must still hold after the example is rewritten in the new DSL.

## Alternatives Considered

1. Keep `ColorValue` as an immutable wrapper over package instances (recommended in grill 78a).
2. Convention-only or compile-time (`Frozen<T>`) mutation guards.
3. Keep every DSL name as an alias, or keep old names deprecated (78c, first answered "alias", then reversed by the owner's "no backwards compatibility").
4. `new Oklch(…)` only, plain JS (recommended in 78h).
5. Freeze DSL variables after every statement.
6. A chroma-clamp gamut method in the package for pixel parity.
7. Gap features in studio code.

## Consequences

- One large PR (ADR-010's big bang), touching most of `src/lib/`, every example, the manifest, autocomplete, hover docs and the tests.
- Every existing user document and share link breaks.
- DSL code reads like package code, but `Oklch(…)` without `new` doesn't paste into TS unchanged.
- A forgotten `clone()` on shared state throws instead of corrupting it; inside a DSL program it silently aliases.
- Several package APIs (CVD, filters, compositing, ΔE94 / CMC) need grills before the switch.

---
tags:
  - glossary
  - reference
  - color-science
  - dsl
status: living
updated: 2026-06-24
---

# Glossary

Concise, precise definitions for every concept used across the Chromatics vault. Each term links to its deep note. Distilled from the [[Investigation Report]], the working DSL on `test-dsl`, and the [old/ knowledge base](../old/chromatics/Chromatics%20Knowledge%20Hub.md). When something is undecided, the entry says so and points to [[Open Questions]].

> [!tip] How to read this
> Terms are grouped by theme (Color models & science · DSL & runtime · Accessibility & vision · Product & tooling). Within each group they run roughly from foundational to specialized. Deep notes: [[Color Models]], [[Color Science & Algorithms]], [[Accessibility]], [[DSL Spec]], [[Library Landscape]].

---

## Color models & science

| Term | Definition |
|---|---|
| **OKLCH / Oklab** | The canonical color model of Chromatics. **Oklab** is a perceptually-uniform opponent space (`L` lightness, `a`/`b` axes); **OKLCH** is its cylindrical form (`L` 0–1, `C` chroma ~0–0.4, `H` hue 0–360°). The DSL `Color` stores colors internally as a culori `Oklch` object and derives all other spaces lazily (`src/lib/dsl/color.ts`). All math (`lighten`/`darken` → `L`, `saturate`/`desaturate` → `C`, `rotate`/`invert`/`complement` → `H`) happens here. See [[Color Models]], [[Color Science & Algorithms]]. |
| **Perceptual uniformity** | The property that equal numeric steps in a space correspond to equal *perceived* color steps. Why OKLCH is canonical: lightening in OKLCH keeps hue stable, whereas naive HSL lightening drifts hue (red → orange/pink). Underpins perceptual palette scales and ΔEok. See [[Color Science & Algorithms]]. |
| **sRGB / Display P3** | **sRGB** is the standard web/display gamut (white point D65). **Display P3** is a wider gamut covering more saturated colors. The `Color` exposes `inGamut` (culori `displayable`, = sRGB) and `inP3` (`inGamut('p3')`). Out-of-gamut colors are flagged but only corrected on demand via `gamutMapped`. See [[Color Models]], [[Accessibility]]. |
| **Gamut & gamut mapping** | A **gamut** is the set of colors a device/space can reproduce. **Gamut mapping** brings an out-of-gamut color back inside, ideally preserving hue/lightness. Chromatics uses culori `clampChroma(oklch, 'oklch')` — reduce chroma until the color is displayable (the CSS Color 4 binary-search approach). See [[Color Science & Algorithms]]. |
| **hex** | The `#RRGGBB` notation, an sRGB encoding. `hex("#6c5ce7")` is a DSL constructor (culori `parse`, throws `Invalid hex color` on failure); `.hex` is a getter (culori `formatHex`, fallback `#000000`). See [[DSL Spec]]. |
| **HSL / HSV / HWB** | Cylindrical transforms of sRGB. **HSL** = hue/saturation/lightness; **HSV** = hue/saturation/value; **HWB** = hue/whiteness/blackness. `HSL(h,s,l)` is a DSL constructor; `.h/.s/.l` are getters. Convenient but *not* perceptually uniform — hence OKLCH for math. See [[Color Models]]. |
| **CIE XYZ (hub)** | The device-independent CIE tristimulus space; the **hub** through which most conversions route (sRGB ↔ XYZ ↔ Lab/Oklab). The from-scratch chromatics engine's conversion graph is an sRGB/XYZ-hub lattice. See [[Color Models]], [color pipeline](../old/chromatics/Research/Conversion%20Pipeline.md). |
| **Transfer function** | The non-linear encoding mapping linear light ↔ encoded values (sRGB gamma ≈ 2.4 piecewise; also PQ/HLG for HDR). Linearization (`sRGB → linear`) is required before luminance and many conversions. See [[Color Science & Algorithms]], [transfer functions](../old/chromatics/Research/Transfer%20Functions.md). |
| **Chromatic adaptation** | Re-referencing a color from one white point to another (e.g. sRGB **D65** ↔ ICC Lab **D50**). Methods: **Bradford** (default for D65↔D50), **CAT16** (for CAM16/HCT), **Von Kries** (simplest). Same white point = no adaptation. See [chromatic adaptation](../old/chromatics/Research/Chromatic%20Adaptation.md). |
| **deltaE (ΔE)** | A color-difference metric. **CIEDE2000** (ΔE2000) is the modern standard: ΔE ≈ 1.0 ≈ one *just-noticeable difference*; ~2.0 is "acceptable". **deltaEok** is ΔE computed in Oklab (cheap, perceptually decent). Used for "nearest catalog color" and perceptual comparisons. *Not yet wired in the working DSL.* See [[Color Science & Algorithms]], [[Open Questions]], [ΔE formulas](../old/chromatics/Research/Color%20Difference%20Formulas.md). |
| **Color harmony** | Theory-based relationships between hues — complementary (180°), triadic (120°), split-complementary, analogous, tetradic. In the DSL these are hue rotations: `complement()` = `rotate(180)`; examples build triads via `rotate(150)` / `+72°`. Deterministic, no AI. See [[Color Science & Algorithms]]. |
| **Interpolation space** | The model in which a blend/gradient is computed; the choice changes the result (mixing in OKLCH vs sRGB vs Lab gives different midpoints). DSL `mix(a,b,ratio)` interpolates `L`/`C` linearly with **shortest-arc hue** interpolation in OKLCH. See [[Color Science & Algorithms]]. |
| **Tonal palette / HCT** | **HCT** (Hue · Chroma · Tone) is Google Material's perceptual model; a **tonal palette** is the fixed tone ladder (0,10,…,90,99,100) generated at constant hue/chroma — the basis of Material You theming. Specced as `hct.tonalPalette()` in the library design; *not implemented*. See [[Color Models]], [[Open Questions]]. |

## DSL & runtime

| Term | Definition |
|---|---|
| **DSL** | Domain-Specific Language. Chromatics' DSL lets users declare colors and the **relationships** between them as code, so changing one variable cascades downstream. It is deliberately a *strict subset of JavaScript syntax*, not a bespoke grammar. See [[DSL Spec]], [[DSL Implementation Notes]]. |
| **REPL** | Read-Eval-Print-Loop. The webapp is a two-pane, Strudel-inspired live REPL: CodeMirror editor (left) + live Inspector (right), re-evaluating on a 100 ms debounce (`src/routes/+page.svelte`). See [[DSL Spec]], [[Product Architecture]]. |
| **AST / acorn** | **AST** = Abstract Syntax Tree. **acorn** is a real JS parser; the DSL parses source with `acorn.parse(src, { ecmaVersion: 2020, sourceType: 'module', locations: true })`, then walks the ESTree AST. *"Parse as JS, do not execute as JS."* See [[DSL Implementation Notes]]. |
| **Controlled interpreter** | A custom AST walker that evaluates only a whitelisted subset of node types (Literal, Identifier, Unary/Binary/Logical/Conditional, Member, Call, Assignment, ExpressionStatement); anything else throws `Unsupported syntax: <type>`. Chosen over raw `eval` to retain introspection (dependency tracking, source mapping). See [[DSL Implementation Notes]]. |
| **Reactive dependency graph** | A DAG of which variables read which others. The evaluator's `Scope.currentDeps` records every user-variable read during an assignment's RHS, snapshotting `deps: string[]` per variable (shown as "depends on: …"). Editing one color reactively recomputes dependents — *the core product novelty*: "color schemes as dependency graphs, not static palettes." See [[DSL Spec]], [[Vision]]. |
| **Conversion registry** | The from-scratch chromatics engine's lazy `from → to` converter map (symbol-`ref`-keyed `Map<symbol, Map<symbol, fn>>` on the active `tmp` branch). Returns pure `(in) → out` functions; no graph pathfinding (multi-hop = manual chaining). The working DSL bypasses it and uses culori directly. See [[Architecture Decisions]], [[Build vs Buy]], [[Open Questions]]. |
| **culori** | The JS color library (v4.0.2) doing the *actual* color math in the working DSL: converters, `formatHex`, `clampChroma`, `wcagContrast`, `displayable`, `inGamut('p3')`, `parse`, CVD filters. Decision: wrap culori, don't reimplement conversions. See [[Library Landscape]], [[Build vs Buy]]. |

## Accessibility & vision

| Term | Definition |
|---|---|
| **WCAG contrast (AA/AAA, ratio)** | Web Content Accessibility Guidelines luminance contrast. **Ratio** = `(L_light + 0.05) / (L_dark + 0.05)` over relative luminance. Thresholds: normal text **AA ≥ 4.5:1**, **AAA ≥ 7:1**; large text AA ≥ 3:1, AAA ≥ 4.5:1. DSL exposes `contrast(a,b)` and `.contrast(other)` (culori `wcagContrast`). See [[Accessibility]]. |
| **APCA** | Advanced Perceptual Contrast Algorithm — the WCAG 3.0-era successor. **Polarity-aware** (dark-on-light ≠ light-on-dark), uses perceived lightness (Lc) not a luminance ratio, and handles dark themes better. Specced for the library; *not yet implemented*. See [[Accessibility]], [[Open Questions]]. |
| **CVD / color vision deficiency** | Color-blindness. The old app simulates protanopia (no red), deuteranopia (no green), tritanopia (no blue), plus grayscale/contrast/brightness/saturation filters (culori `filterDeficiency*`). To be ported into the DSL app's preview/audit. See [[Accessibility]], [[Feature Specs]]. |
| **Semantic role (bg/fg/primary)** | A token's *meaning* in a theme — background, foreground, primary, secondary, accent, success/warning/error/info, surface, muted. The DSL Inspector's PREVIEW heuristically detects `bg`/`fg`/`primary` by **name substring** (brittle, undocumented — see [[DSL Gaps & Bugs]]). See [[Feature Specs]]. |

## Product & tooling

| Term | Definition |
|---|---|
| **ColorGroup / scheme** | The old "Color Scheme Tester" data shape: a scheme is `ColorGroup[]`, each `{ label, colors: ColorInput[] }`, auto-discovered via `import.meta.glob`. `brand-dark.ts` was the canonical example and the Phase-1 DSL test gate ("rewrite brand-dark.ts as a script"). See [[Project History]], [[Feature Specs]]. |
| **Design tokens** | Named, exportable theme values (CSS custom properties, JSON tokens, Tailwind config). The DSL's intended primary output: a script *is* a token set with relationships. Export is planned, not built. See [[Feature Specs]], [[Roadmap]]. |

---

> [!note] Status of terms
> Terms marked *not implemented* / *not yet wired* (deltaE, APCA, HCT/tonal palette, the from-scratch conversion registry, export) are **specified in design docs but absent from the working `test-dsl` code**, which relies on culori. See [[Status & Inventory]] for the full built-vs-specced split and [[Open Questions]] for unresolved decisions.

## See also

- [[Color Knowledge Hub]] — entry point to all color-science notes
- [[DSL Spec]] · [[DSL Implementation Notes]] · [[DSL Gaps & Bugs]]
- [[Decision Log]] · [[Build vs Buy]] · [[Architecture Decisions]]
- Source archive: [old/ knowledge base](../old/chromatics/Chromatics%20Knowledge%20Hub.md)

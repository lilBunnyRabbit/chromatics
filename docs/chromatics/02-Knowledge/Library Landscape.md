---
tags:
  - color-libraries
  - culori
  - dependencies
  - build-vs-buy
  - evaluation
status: stable
updated: 2026-06-24
---

# Library Landscape

The external color libraries evaluated for Chromatics, with verdicts. **Bottom line: `culori` is chosen** and already powers the working DSL in `color-testing/test-dsl`; everything else was weighed against it. See [[Build vs Buy]] for the strategic "wrap vs reimplement" decision and [[Architecture Decisions]] for where this sits in the stack.

> [!decision] Decision of record
> Use **culori** for all conversion math, plus a **thin typed `Color` wrapper** for ergonomics (methods on colors, lazy/cached channel access), plus **optional chromatics model-specific methods** layered on top (the genuine value-add). Conversion math is explicitly *not* the novel contribution — the DSL is. This is the position the 2026 planning note and the shipped code both took. See [[Build vs Buy]].

---

## TL;DR comparison

| Library | Model coverage | API style | Bundle size (gzip) | Gamut / contrast support | Verdict |
|---|---|---|---|---|---|
| **culori** | 30+ (sRGB, P3, Rec.2020, Oklch, Okhsl/Okhsv, Lab, Luv, HSL, HWB…) | Functional, plain `{mode,…}` objects, tree-shakeable | **~12 KB**, far less when tree-shaken | `displayable`, `inGamut('p3')`, `clampChroma`, `wcagContrast`, `wcagLuminance` | ✅ **CHOSEN** — broadest modern coverage at smallest cost |
| colorjs.io | 25+ (all CSS Color 4 spaces) | Class-based, reference impl (Lea Verou, CSS Color 4 co-author) | ~30 KB | gamut mapping, interpolation, deltaE | Reference / fallback if a class-based foundation were preferred; heavier, less tree-shakeable |
| chroma.js | Older set — **no Oklch, no P3, no Rec.2020** | Class/chainable, great for mixing/scales | ~14 KB | basic; not CSS-spec-aligned | ❌ Rejected — missing the perceptual spaces Chromatics centers on |
| colord | Very limited core; plugins add models | Chainable, plugin architecture | **1.7 KB** core | via plugins | ❌ Rejected — too thin in core; OKLCH/P3 need plugins |
| d3-color | Minimal (RGB/HSL/Lab/HCL…) | Functional, D3-flavored | small | none to speak of | ❌ Rejected — built for D3, not standalone |
| color / tinycolor | Legacy sRGB/HSL family | Chainable | small–medium | basic WCAG only | ❌ Rejected — legacy model coverage, no perceptual spaces |

> [!note] Sourcing
> Sizes, model counts, and strengths/weaknesses are taken verbatim from the user's own research note [Existing Library Analysis](../old/chromatics/Research/Existing%20Library%20Analysis.md) (and the candidate list in [Color Packages](../old/chromatics/Research/Color%20Packages.md)). The `culori` verdict is corroborated by the shipped code (below).

---

## culori — CHOSEN, and already in production

`culori` v4 is not a hypothetical pick; it is the live engine of the only working DSL artifact (`color-testing` branch `test-dsl`). `package.json` pins `culori` `^4.0.2` (+ `@types/culori` `^4.0.1`).

The `Color` class (`src/lib/dsl/color.ts`) imports and uses exactly these culori entry points:

```ts
import {
  type Oklch, type Color as CuloriColor,
  converter, formatHex, clampChroma,
  wcagContrast, displayable, inGamut, parse
} from 'culori';

const toOklch = converter('oklch');
const toHsl   = converter('hsl');
const toRgb   = converter('rgb');
```

| culori API | Used in Chromatics for |
|---|---|
| `converter('oklch'/'hsl'/'rgb')` | Canonical OKLCH storage + lazy/cached HSL & RGB projections |
| `formatHex` | The `.hex` getter (fallback `'#000000'`) |
| `parse` | `hex("#…")` constructor (throws `Invalid hex color` on null) |
| `clampChroma(_, 'oklch')` | `.gamutMapped` — CSS Color 4 style binary-chroma reduction into sRGB |
| `displayable` | `.inGamut` (sRGB gamut check) |
| `inGamut('p3')` | `.inP3` (Display P3 gamut check) |
| `wcagContrast` | `.contrast(other)` method + the global `contrast(a,b)` function |

The older static app (`color-testing/master`, `src/lib/oklch.ts`) leaned even harder on culori — additionally using `formatCss`, `wcagLuminance`, `blend` (alpha compositing for opacity-aware contrast), and the full CVD filter family (`filterDeficiencyProt/Deuter/Trit`, `filterGrayscale`, `filterContrast`, `filterBrightness`, `filterSaturate`). So culori has already proven it covers the project's **conversion + gamut + WCAG + CVD** needs end to end across two app generations.

> [!tip] Why culori specifically
> Modular & tree-shakeable (you import only the converters you touch), CSS Color 4 parsing, the broadest set of *modern perceptual* spaces (Oklch, Okhsl/Okhsv, P3, Rec.2020) — the exact models Chromatics treats as Critical-tier. The one cost is ergonomics: culori colors are plain objects (`{mode:'oklch', l, c, h}`) with **no methods**. That gap is precisely what the thin `Color` wrapper fills.

### culori's only weakness, and how Chromatics answers it

| culori weakness (per [Existing Library Analysis](../old/chromatics/Research/Existing%20Library%20Analysis.md)) | Chromatics' answer |
|---|---|
| Plain-object API, no methods on colors | The `Color` class: methods (`lighten`/`darken`/`saturate`/`rotate`/`mix`/…) + getters (`ok_l`/`h`/`r`/`hex`/`inGamut`/…) |
| No model-specific utilities | Optional layer on top: `hct.tonalPalette`, `oklch.gamutMap`, `lab.deltaE`, APCA, harmony — added *only as the DSL surface demands them* |
| No class hierarchy | Single unified immutable `Color` type, internally OKLCH |

This three-layer shape — **culori (math) → typed wrapper (ergonomics) → optional chromatics methods (differentiator)** — is the architecture of record. See [[Architecture Decisions]] and [[DSL Implementation Notes]].

---

## The alternatives, briefly

> [!note] colorjs.io — the reference implementation
> Class-based, authored by Lea Verou (CSS Color 4 co-author), so it is the most spec-faithful. Covers all CSS Color 4 spaces, gamut mapping, interpolation, deltaE. **Rejected as the foundation** only because it is ~2.5× heavier (~30 KB vs ~12 KB) and less tree-shakeable. Best role: a correctness reference / oracle, and the fallback if a class-based engine were ever wanted instead of a wrapper.

**chroma.js** — popular and pleasant for mixing/scales/gradients, but its model coverage predates the perceptual era: **no Oklch, no P3, no Rec.2020**, and it is not CSS-spec-aligned. Since OKLCH *is* the canonical workspace, this is disqualifying.

**colord** — tiny (1.7 KB core) with a plugin architecture; attractive for size-constrained apps, but the core is too thin and OKLCH/P3 require plugins, eroding the size advantage.

**d3-color** — minimal, well-tested, but designed for the D3 ecosystem rather than standalone color work; limited models.

**color / tinycolor** — legacy sRGB/HSL-family libraries with chainable APIs and only basic WCAG; no modern perceptual spaces. Listed in [Color Packages](../old/chromatics/Research/Color%20Packages.md) as candidates but never serious contenders.

---

## What none of them do (Chromatics' differentiators)

From the user's competitive matrix in [Existing Library Analysis](../old/chromatics/Research/Existing%20Library%20Analysis.md) — the features no library on the market provides, which is *why* a wrapper exists at all rather than just adopting one:

| Feature | culori | colorjs.io | chroma | colord | **Chromatics** |
|---|---|---|---|---|---|
| Model-specific utility methods | No | Partial | No | No | **Yes** |
| Color **relationships as code** | No | No | No | No | **Yes (DSL)** |
| Reactive **dependency graph** | No | No | No | No | **Yes (DSL)** — *shipped* |
| Two-way editing (UI ↔ code) | No | No | No | No | **Planned** ([[Open Questions]]) |
| HCT tonal-palette generation | No | No | No | No | **Yes (planned)** |
| APCA contrast | No | Partial | No | No | **Yes (planned)** |
| CVD simulation | No | No | No | No | **Yes** (already in `master` app via culori filters) |

> [!warning] Reality check
> Of the "Yes" column, only the **dependency graph** and **CVD simulation** are actually built today. Relationships-as-code (the dep graph) is the one differentiator that is both promised everywhere *and* shipped (`Scope.currentDeps` in the evaluator). HCT/APCA/two-way-editing are aspirational — they are the model-specific methods that would justify the optional third layer, but they don't exist yet. Track these in [[Open Questions]] and [[DSL Gaps & Bugs]].

---

## Decision rationale & links

- The **build-vs-buy verdict** (wrap culori; don't reimplement the conversion math) and its cost argument ("reimplementing is 6–12 months and still has bugs") live in [[Build vs Buy]].
- Where the wrapper sits relative to the DSL evaluator and the (separate, largely-unbuilt) from-scratch `chromatics` engine: [[Architecture Decisions]] and [[Product Architecture]].
- The from-scratch typed-array engine that culori was chosen *over* is documented in [[Color Models]] and [[DSL Implementation Notes]]; the strategic tension between the two is logged in [[Decision Log]].
- Deeper color-science context for *why* OKLCH/P3/Rec.2020 coverage is the deciding axis: [[Color Science & Algorithms]], [[Accessibility]], [[Color Knowledge Hub]].

> [!tip] One-line summary
> culori is the right buy: smallest modern engine with the broadest perceptual coverage; Chromatics' job is the thin typed layer and the DSL on top, not the converters underneath.

---
tags: [decision, build-vs-buy, color-engine, culori, chromatics, dsl, strategy]
status: stable
updated: 2026-06-24
---

# Build vs Buy

> The deepest strategic fork in Chromatics: write a from-scratch color engine, or wrap an existing library and spend the effort on the parts nobody else has built. This note presents both camps with their evidence and records the resolution.

See also: [[Library Landscape]] · [[Architecture Decisions]] · [[Decision Log]] · [[Color Knowledge Hub]] · [[DSL Implementation Notes]] · [[Open Questions]]

> [!decision] Resolution (settled)
> **Wrap culori for ALL conversion / gamut / contrast / interpolation math now.** Build only model-*specific* utility methods (`hct.tonalPalette`, `oklch.gamutMap`, `lab.deltaE`, APCA, CVD) as a thin layer on top, *as the DSL surface demands them*. Treat the from-scratch typed-array engine as an **optional learning track**, not a blocker. This is already what the shipped code does.

---

## The two camps

```mermaid
graph TD
  Q{Color engine<br/>build or buy?}
  Q -->|BUILD| B[From-scratch engine]
  Q -->|BUY/WRAP| W[Wrap culori]

  B --> B1[100+ note color-science<br/>encyclopedia]
  B --> B2[Library Research v2:<br/>typed-array model classes]
  B --> B3[chromatics ConversionRegistry<br/>symbol-ref map on tmp]

  W --> W1[2026 Planning note:<br/>'wrap culori']
  W --> W2[Engine-research:<br/>'wrap Culori']
  W --> W3[SHIPPED: color-testing/test-dsl<br/>runs on culori v4.0.2]

  W3 ==>|decisive| R[RESOLUTION: WRAP]
  B -.->|reference + learning track.-> R
```

### Camp BUILD — "write the engine"

The case for building, drawn from the Obsidian knowledge base and the early library research (see [[Color Knowledge Hub]], [[Library Landscape]], and the archive under [old/chromatics/AI/Library Research/](old/chromatics/AI/Library%20Research/)):

- **The encyclopedia exists.** 100+ color-model/system notes across six families (Hue, perceptual/CIE, RGB/wide-gamut, video, print, niche), plus full ΔE76/94/2000 derivations, transfer functions, chromatic-adaptation matrices, gamut mapping, and harmony algorithms. The knowledge to *write* the math is already on disk.
- **A concrete engine design.** *Library Research v2* specifies a bespoke architecture: every model is a class extending a JS **TypedArray** — `Uint8ClampedArray` for 0–255 integer models, `Float32Array` for fractional/angular models — each with an optional 0–1 alpha channel, organized into three pillars: **Models, Conversions, Parsing**.
  > "Each model extends a typed array for performance and safety… All models include an optional alpha channel (0–1)." — *Library Research v2*
- **Real code already started.** The `chromatics` repo (branch `tmp`) ships a working `ConversionRegistry` — `Map<symbol, Map<symbol, fn>>` keyed by a static `ref = Symbol(name)` per model — at `src/packages/chromatics/conversion-registry.ts`, plus `srgb.model.ts` / `srgb8.model.ts` and a stable matrix/math utility layer.
- **A market-gap thesis.** The build was framed not as a dependency choice but as an opportunity: lightweight libs (TinyColor, color2k) only do RGB/HEX/HSL; comprehensive ones (culori, Color.js) are "complex or heavyweight."
  > "A library that hits a sweet spot – offering modern color spaces… with a simple, ergonomic API… abstracting the math away." — *Existing Products, Gap Analysis*

> [!warning] BUILD's reality check
> The implementation is nowhere near backing the DSL. Per *Model Conversions.md*'s own Mermaid legend, **only HSI/HSL/HSV/HWB/CMY/CMYK/RGB255/Normalized-RGB are implemented; sRGB and YCbCr are partial; every perceptual model (Lab, Oklab/OKLCH, the product's stated centerpiece) is unbuilt.** On `tmp`, the registry wires only sRGB↔sRGB8, and `get()` has a copy-paste bug: the conversion-not-found branch re-tests `if (!fromRegistry)` instead of `if (!conversion)` (conversion-registry.ts ~line 44). There is **no OKLCH model**, no `Color` class, no DSL on any chromatics branch.

### Camp WRAP — "delegate the math"

The case for wrapping, which the evidence makes decisive:

- **The 2026 Planning note chose it explicitly.** The `chromatics` library is re-scoped as a *thin TYPED wrapper over culori*, chosen specifically to avoid reimplementing 30+ model conversions.
- **Independent engine-research reached the same verdict** ("wrap Culori").
- **The shipped product already runs on it.** The only working, end-to-end DSL — `color-testing` @ `test-dsl` — uses **culori v4.0.2** for every conversion, `formatHex`, `clampChroma`, `wcagContrast`, `displayable` (sRGB), and `inGamut('p3')`. The `Color` class (`src/lib/dsl/color.ts`) stores OKLCH canonically and lazily derives HSL/RGB/hex via culori converters. See [[DSL Implementation Notes]].

> [!quote] From the 2026 Planning note (the deciding voice)
> - "The DSL is the novel contribution — the conversion math is not."
> - "Writing the 50th Oklab→XYZ converter isn't novel… Build the interesting layer, delegate the math."
> - Reimplementing would take **"6–12 months and still have bugs."**
> - "This is not 'giving up' — it's the same pattern as your DSL using Acorn for parsing. You don't write your own JS parser; you write the evaluator that makes it special."
> - "Culori gives you `convert(color, 'oklch')`. Chromatics gives you `oklch.gamutMap('srgb')`."
> - Do it **"when you want to, not because you have to."**

---

## Cost / benefit

| Dimension | BUILD from scratch | WRAP culori (+ thin utility layer) |
|---|---|---|
| Time-to-working-DSL | 6–12 months on the engine *before* the DSL is usable | **Zero** — already shipped on `test-dsl` |
| Conversion correctness | Re-derive + debug 30+ models; "still has bugs" | culori: proven, CSS Color 4, ΔE/JzAzBz/ICtCp built in |
| Novelty captured | Low — converters are commodity | **High** — effort goes to the dependency-graph DSL |
| Maintenance surface | Entire color-math engine is yours | culori upstream maintains the math |
| Perceptual models today | OKLCH unbuilt; only basic hue/RGB models work | OKLCH canonical *today*; P3 gamut checks today |
| Differentiator delivered | Deferred behind the engine | `oklch.gamutMap`, `hct.tonalPalette`, `lab.deltaE`, APCA, CVD on top |
| Learning value | Very high (already realized in the notes) | n/a — the learning already happened |
| Risk | Trades a working product for a rewrite | Low; bounded to the utility layer |

The asymmetry is the whole argument: the converter math is **commodity and risky to rebuild**, while the relationship-graph DSL is **novel and already working**. Force-fitting the from-scratch engine under the DSL now would trade a shipped product for the exact 6–12-month trap the user already talked themselves out of.

---

## What we keep / what we shelve

> [!note] Keep (active)
> - **culori** as the conversion/gamut/contrast/interpolation engine, everywhere.
> - The **OKLCH-canonical `Color` class** (`color.ts`) wrapping culori with lazy, cached channel access.
> - A **thin model-specific utility layer** added on demand: `oklch.gamutMap('srgb')`, `hct.tonalPalette()`, `lab.deltaE(other,'CIE2000')`, **APCA** contrast, **CVD** simulation. These are the genuine differentiator the encyclopedia specs — and none requires re-deriving a converter (culori already exposes `clampChroma`, ΔE, CVD filters; CVD/contrast helpers also exist in the old app's `oklch.ts`, see [[Color Science & Algorithms]] and [[Accessibility]]).
> - The **100+ note knowledge base** as the *reference layer* for those utility methods (formulas, ranges, model semantics).

> [!note] Shelve (optional learning track)
> - The from-scratch **typed-array model classes** (`extends Float32Array` / `Uint8ClampedArray`).
> - The `chromatics` **symbol-ref `ConversionRegistry`** and its hub-and-spoke topology — fix or revive only if/when batch/GPU/WASM bulk conversion becomes a real need.
> - The **per-model registration/plugin API** ambition (colord-style extensibility) — a "someday" feature, not a Phase 1 dependency.
> - The TypedArray representation is explicitly being **moved away from** for the DSL API in favor of plain `number` properties; TypedArray export is reserved only for batch/GPU use.

---

## Why this isn't a contradiction

The encyclopedia and the typed-array engine are **not wasted** — they were the *learning*, and they become the **specification source** for the thin utility layer that sits on culori.

> "The knowledge base… is deeper than most color library authors have. The learning has already happened. The DSL is where that knowledge becomes a tool."

So the resolution is a both/and, ordered by leverage: **buy the converters, build the DSL and the model-specific surface, and keep the from-scratch engine on the shelf as an optional track** — to be picked up "when you want to, not because you have to."

---

## Open items

- **When does a utility method get promoted from "culori call" to a real `chromatics` class method?** Only when the DSL surface needs it — no eager build-out. Tracked in [[Roadmap]] / [[Open Questions]].
- **Will the from-scratch engine ever back the DSL?** Undecided. Currently *no* — see [[Open Questions]]. Revisit only if bulk/GPU conversion becomes load-bearing.
- The `chromatics tmp` `get()` bug and the missing OKLCH model are noted in [[DSL Gaps & Bugs]]; they reinforce that the engine is not DSL-ready today.

Related: [[Vision]] · [[Status & Inventory]] · [[Build vs Buy]] is cross-referenced from [[Decision Log]] and [[Architecture Decisions]].

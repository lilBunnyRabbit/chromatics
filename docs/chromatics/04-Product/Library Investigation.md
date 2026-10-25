# Library Investigation — own color package (2026-10-18)

Prior-art sweep before replacing culori with our own npm package. Sources: chromatics branches (`4767521…9745c72` 2024 line, `origin/dev`, `origin/dev-dev`, `origin/research`, `origin/v3-test`, `tmp`), `color-testing` history (`a579a49`, `fb01c5b`, `36a3e63`), this vault, the personal vault note `projects/ideas/Chromatics - Planning.md`, `~/dev/playground/colors`, and the current engine `src/lib/models/`.

Ground rules (owner, 2026-10-18): package on a branch first → monorepo (package + site); **every** non-proprietary model & system; exhaustive tests (boundaries, every conversion, round-trips); **API is decided together, option by option**.

## 1. Iteration timeline

| When | Where | Storage | Conversion API | Fate |
|---|---|---|---|---|
| 2024-02 | `c29fa45` | `RGB extends Uint8ClampedArray` | god-class `RGB.toHSL()/toXYZ()/toLAB()` | N×M methods |
| 2024-02 | `5308f59` | same | target owns `static fromRGB(r,g,b)`; `toX()` delegates | circular imports |
| 2024-03 | `1b6af01`…`9745c72` | `RGB` (Float32 0–1) = hub, `RGB255` = byte encoding | instance `toX()`, chains via RGB | packaged `@lilbunnyrabbit/chromatics@0.0.0`, never published |
| 2025-02 | `origin/dev` | `XBase extends Float32Array` → `XConversions` → `X` | static `ConversionRegistry` keyed by constructor, side-effect `*.conversion.ts`; typed extra args via `DefaultConversions` tuple (never filled) | "Indirect conversions not supported" |
| 2025-03 | `origin/dev-dev` | same + alpha 4th slot | lazy proxy `hsl.to.RGB().to.RGB255().toHex()` over instance registry; `ParserRegistry {priority, canParse, parser}` | stalled, "mostly all AI" |
| 2025-12 | `origin/v3-test` | **composition**: `private channels: Float32Array`, `static ref = Symbol()` | `c.to(Model)` / `Model.from(c)`, `Map<symbol, Map<symbol, fn>>`, direct edges only | 2 models |
| 2026-03 | `tmp` `7e0e72d` "idk" | same, `abstract ColorModelBase` | side-effect `init/` registration | static `from` untypable (`// TODO: types`); `from()` looks up reversed edge |
| 2026-04 | `tmp` `981a84b` | — | `DSL.md`: one immutable OKLCH `Color` over culori | pivot to DSL + culori |
| 2026-06 | color-testing `36a3e63` | model-tagged `ColorValue` (`_native` + `_model`), lazy `project()` cache | `MODEL.from(c)` / `c.to("model")`, BFS edge graph, culori as leaf fallback, binary ops same-model | **current engine** |

## 2. Patterns the owner kept reaching for

- **Array-backed colors** — always *typed* arrays (`Float32Array`, `Uint8ClampedArray`), never plain `Array` (only the unused `Matrix`/`Vector` helpers extended `Array`). Storage type encoded range: no suffix = 0–1 float, `255`/`8` suffix = byte. Moved from `extends` to composition in v3. CD-04 then reversed typed arrays outright: Float32 loses precision over long chains (`// TODO: Not perfect?` on Lab/XYZ), byte arrays round on every construct, `this.map()` calls the subclass ctor with a length. Stated position: plain Float64, `.toFloat32Array()`/`.toUint8ClampedArray()` only for export.
- **`to` / `from` naming** — in every generation since v3: `c.to(Model)`, `Model.from(c)`; the earlier fluent `c.to.HSL()` proxy is the other recurring shape.
- **Registry of conversion edges**, filled by importing model modules. Never got path-finding until the current engine's BFS. Hub plan (research `conversions.md`): sRGB for hue models, XYZ for perceptual, Lab for Munsell/NCS/Hunter.
- **Float vs 8-bit as separate models** (`RGB`/`RGB255`, `Srgb`/`Srgb8`). Note: `dump.md` says "no rgb255" — owner may have dropped this.
- **CSS `toString()` per model**, `toCSS()` added 2025.
- **Parser registry** with priority + `canParse` (idea: return a probability → "paste a string, detect the model").
- **Docs as data** — per-model `index.md` (params, ranges, ops) → became `06-Reference` + `model-docs.ts`.
- **Model-specific operations** on the model's own class (Planning note hierarchy: RGBModel / Cylindrical / Hue / PerceptualCyl / Lab / Appearance / Subtractive / Video / CatalogSystem).
- **Exact inverses over search** — owner called `ensureContrast` "hacky, only for testing"; prefers `.xyy.setLuminance(Y)`.

## 3. Failure modes to not repeat

- Mutable setters + inconsistent op semantics (`RGB.invert` new, `RGB255.invert` mutates). DSL.md + Implementation Plan chose immutability.
- Clamping setters destroy out-of-gamut data; hue clamped instead of wrapped; RGB ctor silently divides by max.
- Global side-effect registration → tree-shaking crash (`sideEffects: ["**/models/**"]` gotcha). Same class of bug in every generation.
- Static `from` on an abstract base defeated TS polymorphic-`this`.
- Zero real tests in every hand-written generation (only the broken template `getHello`). Playgrounds were the real consumer.
- AI-drafted math never verified against references.

## 4. What culori gave us silently (must become explicit decisions)

Achromatic hue = `undefined` (`?? 0` everywhere); missing alpha = opaque; XYZ scaled Y=1; one-hop-through-rgb conversion; `displayable` needs eps 1e-5 for float noise; `gamutMapped` (clampChroma) ≠ `gamutMap()` (toGamut). Pain: 164 `as unknown as` casts; dynamic views off the static TS type; culori object shape leaks through `project()`, `swatch-deco.ts`, `GamutPlane.svelte`, `analysis/*`.

## 5. Replacement surface

- **Built-in culori modes to rebuild (~30):** rgb, lrgb, p3, a98, prophoto, rec2020, hsl, hsv, hwb, hsi, lab, lch, lab65, lch65, luv, lchuv, oklab, oklch, okhsl, okhsv, cubehelix, dlab, dlch, jab, jch, itp, xyb, xyz50, xyz65, yiq.
- **Already hand-written, port only:** cmyk, cmy, hsluv, hpluv, hct, cam16(ucs), ciecam02, lms, xyy, ucs/ucs60/uvw, hlab, ipt, hsp, tsl, ryb, rec2100, ACES family, scRGB, SMPTE-C, video YCC family (`custom-modes.ts`, `modes/*`).
- **Functions:** parse, formatHex, formatCss, clampChroma, toGamut, displayable/inGamut, wcagContrast/Luminance, blend (alpha contrast), ΔE 76/94/CMC/2000/Euclidean, CVD filters (prot/deut/trit) + grayscale/contrast/brightness/saturate.
- **Library-worthy from current engine:** tagged immutable value + projection cache, edge graph + BFS (`registry.ts`), `lerpInMode`/hue strategies, `rotateHueInMode`, `maxChromaFor`, ramps/harmony, APCA/WCAG/ΔE/CVD. **App-only:** `member()` string dispatch, `DSLValue`, MethodDef docs metadata, curated picker lists, stubs.

## 6. Requirements already on record

CSS Color 4 gamut mapping (binary chroma search in OKLCH) + clamp/perceptual strategies; ΔEok default + CIEDE2000; WCAG (alpha-aware) + APCA; CVD with severity (Brettel/LMS preferred); Oklab interpolation, CSS hue strategies incl. `none`, premultiplied alpha; Bradford adaptation (CAT16 for CAM16/HCT); HCT tonal palettes; CSS Color 4 parsing + named + auto-detect; Float64; lazy memoized conversions; bundle size matters (colorjs.io lost on ~30 KB).

## 7. Test assets to carry over

Brand Dark 9 golden hexes (byte-exact); HSLuv / HCT / CAM16 / xyY / Hunter reference values; 4-probe round-trips through every experimental model; achromatic parity seed; conversion-graph rules; ΔE sanity. **Before the swap:** dump culori's output for every channel × probe color (+ gamut, ΔE, CVD) to JSON as a parity baseline. External oracles: colorjs.io (spec-faithful), colour-science (test vectors).

## 8. Prior art to borrow

ColorAide (class-based, model-specific methods — closest to our design), colord (chainable immutable TS + plugins), Rust `palette` / linebender `color` (space in the type; **static + dynamic API pair** — resolves typed-library vs dynamic-DSL), culori (modularity, coverage), Leonardo (contrast as input), chroma.js (scales).

## 9. Open API decisions (decide with owner, one at a time)

1. **Representation:** class per model with typed channels vs one tagged value vs both (static typed + dynamic). Implementation Plan §0 rejected class-per-model because "compile-time safety is irrelevant in a dynamically-typed DSL" — that premise doesn't hold for a TS library.
2. **Storage:** plain Float64 fields vs typed-array backing (composition) vs tuple.
3. **Conversion syntax:** `c.to(Oklch)` / `Oklch.from(c)` vs `c.to.oklch()` vs functional `convert(c, oklch)`; typing static `from` without the polymorphic-`this` wall.
4. **Routing:** hub (XYZ/sRGB) vs edge graph + BFS vs both; precomputed vs lazy paths.
5. **Registration & tree-shaking:** explicit imports / model objects passed in vs global side-effect registry vs instance registry.
6. **Mutability:** immutable everywhere (record on file) — confirm.
7. **Ranges & out-of-gamut:** never clamp in storage? 0–1 vs native ranges (Lab L 0–100), float vs byte models, gamut flag vs throw.
8. **Achromatic hue / missing channels:** NaN, `undefined`, or CSS `none` semantics.
9. **Ops placement:** methods on model classes (family mixins) vs free functions vs both; cross-model binary ops — convert implicitly or throw.
10. **Parsing/formatting:** per-model parsers + auto-detect confidence; CSS output per model.
11. **Equality:** reference vs epsilon vs perceptual ΔE.
12. **Scope per system:** catalogs with licensed data (NCS, RAL, Munsell renotation is public) — rule per system; Pantone out.
13. **Package layout:** subpath exports per model/family, ESM only, monorepo tooling.

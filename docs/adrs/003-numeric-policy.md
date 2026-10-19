# ADR-003: Numeric policy

**Date:** 2026-10-18
**Status:** Accepted

> **Revision 2026-10-19: sourced numbers** (owner delegated the values; [brainstorm](../brainstorm/2026-10-18-own-color-library.md) grill 16)
>
> - **Matrices:** CSS Color 4's 64-bit matrices where published; other RGB spaces derived from primaries + white point by one generator script (`scripts/matrices/`), verified against the CSS-published ones. Reason, measured: Ottosson's 10-decimal blog matrices round-trip sRGB ↔ Oklab at 1.2e-4 relative near black (white = 0.99999999347); the 64-bit ones at 3.7e-12.
> - **Bradford D65 ↔ D50 (2026-10-19, owner: "the most precise and correct, no shortcuts"):** ship the exact rational derivation, correctly rounded, instead of CSS Color 4's published decimals. Both start from the same inputs (CSS's 4-figure whites, the linear Bradford cone matrix), but the CSS decimals were computed in float arithmetic and differ by up to 3.2e-16. `derive.test.ts` keeps the CSS decimals as a check (≤ 4e-16, which still proves the inputs: a wrong cone matrix would differ by ~1e-5). The sRGB and Display P3 matrices equal the CSS Color 4 rationals exactly, both directions.
> - **Achromatic threshold, `≤`:** the chroma reference range / 100 000, per CSS Color 4 (csswg-drafts #11706, resolved 2025; Editor's Draft 2026-10-09 §7–9): Oklch `c ≤ 0.000004`, Lch `c ≤ 0.0015`, Hsl `s ≤ 0.00001`, Hwb `w + b ≥ 0.99999`. Other hue models use the same rule on their chroma range. Measured grey noise is ~1e-15 (Oklch) and ~1e-13 (Lch). Browsers disagree (Chromium 0.02 for both; Stylo lightness range / 1e5), so they're not oracles for this.
> - **`inGamut` tolerance:** 7.5e-5 per channel, in the space's own 0–1 coordinates. Same as colorjs.io (`src/inGamut.js`, 0.7.1) and ColorAide (`DEF_FIT_TOLERANCE`, 8.13.1); neither documents a rationale. It absorbs rounded CSS input (3-decimal strings), and measured 64-bit noise is 3.8e-14.

## Context

The 2024–25 setters clamped hue instead of wrapping it and divided RGB by its max, silently distorting every out-of-gamut conversion. Culori leaves grey hue `undefined` (coerced with `?? 0` in four places) and needs eps 1e-5 for float noise in `displayable()`. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grills 4, 8.

## Decision

- **Out-of-range values are stored raw.** Wide-gamut → sRGB keeps negative channels. `inGamut()`, `clamp()`, `gamutMap()` fix on request (ADR-005).
- **Hue wraps on set into [0, 360).** 345 rotated by 30 is 15. Interpolation strategies work on deltas.
- **Grey hue is 0, never `NaN`.** Hue-sensitive operations (mix, gradients, harmony) treat hue as missing when chroma is below an epsilon and take the other color's hue, so white → blue in OKLCH doesn't pass through magenta. `isAchromatic()` is public.
- **Byte models round and clamp on set** (`new Srgb8(127.6, 300, -4)` → 128, 255, 0).
- **Bad input throws.** `parse` throws `SyntaxError`; constructors and setters throw `TypeError` on `NaN` / `Infinity`.
- **`tryParse` returns `Optional<T>`** from `@lilbunnyrabbit/optional`.

## Alternatives Considered

1. Clamp on set: the 2024–25 bug.
2. Throw on out-of-range: breaks every wide-gamut conversion.
3. Store hue raw (keeps turn counts): rejected for wrap.
4. `NaN` / CSS `none` for grey hue: spec semantics, but the owner judged NaN unsafe for users. Plain 0 without detection: wrong gradients.
5. Byte models storing floats: then `Srgb8` would only be `Srgb` scaled.
6. Storing `NaN` / `Infinity`: spreads silently through every conversion.
7. `T | undefined` from `tryParse`: zero dependencies; the owner chose `Optional`.

## Consequences

- `c.to(Srgb).r * 255` can be outside 0–255; docs must say so.
- A user reading `.h` on a grey gets 0 and must check `isAchromatic()` if it matters.
- Setters can throw, including inside a user's animation loop.
- `@lilbunnyrabbit/optional` must ship its ESM build (1.1.0, unpublished as of 2026-10-18) before this package publishes.

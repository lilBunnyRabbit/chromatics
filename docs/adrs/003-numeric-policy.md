# ADR-003: Numeric policy

**Date:** 2026-10-18
**Status:** Accepted (epsilon values pending sources)

## Context

The 2024–25 setters clamped hue instead of wrapping it and divided RGB by its max, silently distorting every out-of-gamut conversion. Culori leaves grey hue `undefined` (coerced with `?? 0` in four places) and needs eps 1e-5 for float noise in `displayable()`. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grills 4, 8.

## Decision

- **Out-of-range values are stored raw.** Wide-gamut → sRGB keeps negative channels. `inGamut()`, `clamp()`, `gamutMap()` fix on request (ADR-005).
- **Hue wraps on set into [0, 360).** 345 rotated by 30 is 15. Interpolation strategies work on deltas.
- **Grey hue is 0, never `NaN`.** Hue-sensitive operations (mix, gradients, harmony) treat hue as missing when chroma is below an epsilon and take the other color's hue, so white → blue in OKLCH doesn't pass through magenta. `isAchromatic()` is public.
- **Byte models round and clamp on set** (`new Srgb8(127.6, 300, -4)` → 128, 255, 0).
- **Bad input throws.** `parse` throws `SyntaxError`; constructors and setters throw `TypeError` on `NaN` / `Infinity`.
- **`tryParse` returns `Optional<T>`** from `@lilbunnyrabbit/optional`.

## Pending numbers

Each needs a cited source before implementation: the achromatic chroma epsilon per hue model, the `inGamut` epsilon.

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

# ADR-015: More hue models and subtractive models

**Date:** 2026-10-20
**Status:** Accepted (Hsi, Hsp, Cubehelix, Cmy, Cmyk implemented; TSL, RYB and RAL wait on grills 72–74)

## Context

The parity table's hue and subtractive rows: hsi, hsp, tsl, cubehelix, cmy, cmyk, ryb, and the RAL system. None is in colour-science or color.js; culori 4.0.2 has hsi and cubehelix. Sources and the model-specific choices are in the [brainstorm](../brainstorm/2026-10-18-own-color-library.md), grill 72+.

## Decision

- **Every model is over encoded `Srgb`**, as `Hsl` / `Hsv` are, and as every source and implementation does.
- **`Hsi`** (`hsi(h s% i%)`): I = (R + G + B) / 3, S = 1 − min / I, the hexagonal hue. Wikipedia "HSL and HSV" oldid 1378989624 for the formulas, its inverse and its Examples table; coloraide's named colors; the culori grid.
- **`Hsp`** (`hsp(h s% p%)`): Finley 2006, weights .299 / .587 / .114, H and S as HSV, hue in degrees. The inverse never divides by min / max, so s > 1 extrapolates. No independent vector exists for P; tests use Finley's HSV identity, color-space as a cross-check, and identities.
- **`Cubehelix`** (`cubehelix(h s l)`): d3-color's reading of Green 2011 eq. 2 as a space, with the Appendix A constant +1.97294 (eq. 2's +1.97249 is a typo: it breaks eq. 1's constant luma). s reference range 0–4.614386868039719. l(1 − l) below 1e-12 gives s 0.
- **`Cmy`** (`cmy(c m y)`): 1 − RGB (colour-science `RGB_to_CMY`).
- **`Cmyk`** (id `cmyk`, `device-cmyk(c m y k)` with `toCss()`): CSS Color 5 §6.1 naive conversion, without its `min(1, …)` clamp (ADR-003); edges to `Srgb` (CSS) and `Cmy` (colour-science). K = 1 within 1e-12 gives no inks.
- Achromatic thresholds follow ADR-003: the saturation range / 100 000 (cubehelix: 4.614386868039719 / 100 000).

## Alternatives Considered

- **Gonzalez & Woods's arccos hue for HSI:** the literature's original, but not citable here (book not accessed), and it breaks culori parity by up to ~1°.
- **Finley's S = 1 branch for s > 1:** silently lossy, against ADR-003.
- **CSS's clamped CMYK forward:** out-of-range inks would stop round-tripping.

## Consequences

- HSP and cubehelix have no source independent of an implementation lineage; their tests say so.
- `Cmyk` is many-to-one onto sRGB: the harness compares CMYK in its normal form (k takes the shared ink).
- Studio values that change at migration: cubehelix s above 4 is now in range; the studio's TSL g′ = 0 bug isn't carried over.

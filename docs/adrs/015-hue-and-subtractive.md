# ADR-015: More hue models and subtractive models

**Date:** 2026-10-20
**Status:** Implemented

> **Revision 2026-10-20, implemented:** `HueColor` no longer requires a typed `h`: it finds the hue channel by its `hue` flag, so `Tsl` keeps the spec letter `t`. The RYB inverse was prototyped before it was built: Newton from the cube centre solves 99.6% of a 25³ sRGB grid exactly (pure blue is RYB 1, 0, 2); the rest throw (grill 74).

## Context

The parity table's hue and subtractive rows: hsi, hsp, tsl, cubehelix, cmy, cmyk, ryb, and the RAL system. None is in colour-science or color.js; culori 4.0.2 has hsi and cubehelix. Sources and the model-specific choices are in the [brainstorm](../brainstorm/2026-10-18-own-color-library.md), grill 72+.

## Decision

- **Every model is over encoded `Srgb`**, as `Hsl` / `Hsv` are, and as every source and implementation does.
- **`Hsi`** (`hsi(h s% i%)`): I = (R + G + B) / 3, S = 1 − min / I, the hexagonal hue. Wikipedia "HSL and HSV" oldid 1378989624 for the formulas, its inverse and its Examples table; coloraide's named colors; the culori grid.
- **`Hsp`** (`hsp(h s% p%)`): Finley 2006, weights .299 / .587 / .114, H and S as HSV, hue in degrees. The inverse never divides by min / max, so s > 1 extrapolates. No independent vector exists for P; tests use Finley's HSV identity, color-space as a cross-check, and identities.
- **`Cubehelix`** (`cubehelix(h s l)`): d3-color's reading of Green 2011 eq. 2 as a space, with the Appendix A constant +1.97294 (eq. 2's +1.97249 is a typo: it breaks eq. 1's constant luma). s reference range 0–4.614386868039719. l(1 − l) below 1e-12 gives s 0.
- **`Cmy`** (`cmy(c m y)`): 1 − RGB (colour-science `RGB_to_CMY`).
- **`Cmyk`** (id `cmyk`, `device-cmyk(c m y k)` with `toCss()`): CSS Color 5 §6.1 naive conversion, without its `min(1, …)` clamp (ADR-003); edges to `Srgb` (CSS) and `Cmy` (colour-science). K = 1 within 1e-12 gives no inks.
- **`Tsl`** (`tsl(t s l)`, grill 72): Terrillon et al. 2000 via Wikipedia "TSL color space" revid 1364394952. The atan2 tint, in degrees (`t`, flagged `hue`, so it rotates and mixes like `h`), S = √(9/5·(r′² + g′²)), L = Rec. 601 luma. The polar inverse (color-space) is exact. Terrillon's literal "T = 0 at g′ = 0" can't be inverted, and the studio's 0.25 there broke its own round trip. No independent vector exists.
- **`Ryb`** (`ryb(r y b)`, grills 73–74): Gossett & Chen 2004's trilinear cube (Fig. 3 corners, purple read as (0.5, 0, 0.5) per §2.2's worked example), linear form. RGB → RYB is a damped Newton solve from the cube centre with an analytic Jacobian, unclamped. Where it doesn't converge, converting to `Ryb` throws a RangeError ("outside the reach"), rather than returning a different color. The paper gives no inverse; ours is uncited and the docs say so.
- **RAL (grill 74):** not shipped. RAL gGmbH claims rights to the collection; the only open data (Wikipedia, CC BY-SA) is approximate and inconsistent, and the studio's 45 values have no source. Excluded from the parity gate like Pantone.
- Achromatic thresholds follow ADR-003: the saturation range / 100 000 (cubehelix: 4.614386868039719 / 100 000).

## Alternatives Considered

- **Gonzalez & Woods's arccos hue for HSI:** the literature's original, but not citable here (book not accessed), and it breaks culori parity by up to ~1°.
- **Finley's S = 1 branch for s > 1:** silently lossy, against ADR-003.
- **CSS's clamped CMYK forward:** out-of-range inks would stop round-tripping.
- **TSL tint in turns, or renamed `h`:** turns would be the package's only non-degree hue and lose hue-aware mixing; `h` breaks ADR-004's spec letters.
- **RYB:** Sugita & Takahashi 2017 (closed form both ways, lossy to 4.1/255, different colors); a far-preimage search (~13 ms, non-unique); a nearest in-cube fit (silently lossy); forward only.

## Consequences

- HSP and cubehelix have no source independent of an implementation lineage; their tests say so.
- `Cmyk` is many-to-one onto sRGB: the harness compares CMYK in its normal form (k takes the shared ink).
- `Ryb` is the one model a conversion into can fail on realistic input; the harness lists it in `partialTargets`.
- Studio values that change at migration: RYB's clamped Newton becomes unclamped or throws; cubehelix s above 4 is now in range; the studio's TSL g′ = 0 bug isn't carried over.

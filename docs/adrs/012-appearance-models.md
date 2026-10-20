# ADR-012: Appearance models

**Date:** 2026-10-20
**Status:** Implemented

> **Revision 2026-10-20, implemented:**
> - **Equations:** with MCU's own rounded sRGB matrix and white, the CAM16 code reproduces every value in MCU's `hct_test.ts` (3 decimals). With our exact constants the correlates move by up to 0.051. Against colour-science they match to 8 decimals for CAM16 and its UCS family, and Fairchild's 2-decimal values for CIECAM02.
> - **Hue quadrature H** follows colour-science's split form (its blue → red interval is split at 360°, H 385.9). Fairchild's values support it; the textbook single-interval form, which colorjs uses, misses them by about 0.3.
> - **Infinite light:** the inverse compression has a pole at a response of 400, so low J with high M is infinite light even inside the reference ranges. The inverse throws a RangeError there, and these models skip the harness's "never throws" sweep (`realistic: 0`).
> - **Black floor:** J and HCT's Y below 1e-12 (the grill 45 floor) are black. Their hue and chroma are invisible there and can't be solved.
> - **HCT inverse:** Newton from colorjs's seed. If that fails, roots are bracketed on a log grid of J (skipping poles) and bisected. A root is kept only if it converts back to the same hue and chroma: at high chroma, and for imaginary colors, other J reach the tone too. If none fits, a RangeError.
> - **HCT root tolerance (2026-10-20, found by the first CI run):** "converts back" means Y, chroma and hue all within 1e-9 relative. Y was 1e-12, which float64 can't always resolve near Y ≈ 0: on node 22 the imaginary color in `hct.test.ts` misses by 1.6e-12 at the nearest double and threw; node 24 misses by 1.1e-13.

## Context

ADR-010 family 3. The sources and the reasoning are in the [brainstorm](../brainstorm/2026-10-18-own-color-library.md), grills 61–64. The primary papers are paywalled: CIE 159:2004, CIE 248:2022 and Li et al. 2017. The equations are taken from implementations that agree with each other: material-color-utilities (MCU, Apache-2.0), colour-science (BSD-3) and colorjs (MIT).

## Decision

- **Viewing conditions (grill 61):** fixed per class, applied inside the edge to `Xyz65`. The defaults are Material's:
  - white: this package's D65
  - L_A = 200/π · Y(L* 50) / 100
  - Y_b = Y(L* 50)
  - average surround (F 1, c 0.69, N_c 1)
  - no discounting

  `Cam16.viewedIn({ white?, adaptingLuminance?, backgroundLuminance?, surround?, discounting? })` (and the same on `Ciecam02`) returns a distinct model class, with its own id, that converts both ways under those conditions. There is no option on `to()`, because the return trip couldn't carry it.
- **Classes (grill 63):**

  | Class | Channels | Notes |
  | --- | --- | --- |
  | `Cam16` | `J M h` | Read-only correlates `C`, `Q`, `s`, `H` |
  | `Cam16Ucs`, `Cam16Lcd`, `Cam16Scd` | `J a b` (J′ a′ b′) | Luo 2006 coefficients; `deltaE` uses K_L |
  | `Ciecam02` | `J M h` | Same correlates; CAT02 adaptation, HPE compression space, closed-form inverse |
  | `Hct` | `h c t` | Unbounded space (grill 62): CAM16 hue and chroma under Material's conditions, tone = CIE L*; the inverse is a Newton solve on J |

- **Names for the coming families (grill 64):** PascalCase of the common name.
- **Matrices:** M16, CAT02 and HPE as published (decimal-exact), with exact inverses from the generator.
- **References:**
  - MCU's `hct_test.ts` for Cam16 and Hct under Material conditions (3 decimals).
  - colour-science's CAM16 tests (8 decimals, secondary), through `viewedIn`.
  - Fairchild's CIECAM02 values via colour-science (2 decimals).
  - None of the papers can be read for worked examples.

## Alternatives Considered

- **A per-call option on `to()`:** it breaks the reverse trip (grill 61).
- **An instance field:** it breaks plain-channel equality and the JSON form.
- **Material's bounded, 8-bit `Hct`:** quantized; available as `hct.to(Srgb).gamutMap()`.
- **JCh as Cam16's channels:** MCU and the studio use it, but JMh is what colorjs and ColorAide use and what the UCS takes as input.

## Consequences

- Classes from `viewedIn` aren't in `/all`'s `models` and aren't parsed by `/all`'s `parse()`. Their own `parse` reads their own id.
- Cam16 / Hct values are computed with this package's exact matrices and white, not MCU's rounded ones, so parity with Material is at a measured tolerance.

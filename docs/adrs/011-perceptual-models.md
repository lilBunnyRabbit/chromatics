# ADR-011: Perceptual models

**Date:** 2026-10-19
**Status:** Accepted

> **Revision 2026-10-20, Luv group implemented:**
> - Ids are `luv-d65`, `luv-d50`, `lchuv-d65`, `lchuv-d50`. They aren't CSS, so `toString()` writes `luv-d65(l u v)`, as Hsv does, and there is no `toCss()`.
> - Reference ranges cover sRGB as the HSLuv snapshot measures it (u −83…175, v −134…107.4, C 0…179): u [−100, 200], v [−150, 150], C [0, 200].
> - The inverse has no CIE source; it is written so that small L* never overflows or underflows. When the input's v′ was lost below vn's precision (XYZ with Y far below X or Z), it uses the smallest v′ that maps back to the same u*, v*.
> - Luv is left out of the harness's 3× "extended" round trip, since it stores chromaticity times L*. Below L* 1e-12, u* and v* don't count in comparisons (the grill 45 floor).
>
> **Revision 2026-10-20, HSLuv group implemented:**
> - The six gamut lines are derived in closed form from our Luv65 and sRGB matrix, as A·u* + B·v* + K = 0 per channel limit. The reference's Maxima constants are not used. They agree with the snapshot to 5.5e-10 (s on the 0–100 scale).
> - The black and white bands use the reference's cut-offs: |L*| < 1e-8 and |L* − 100| < 1e-7. Outside the bands, out-of-range L* keeps its geometry instead of being forced to black or white as the reference does (ADR-003); inside [0, 100] the results are identical.
> - `isAchromatic()` is true when the Lchuv65 chroma is at most 0.0015, so it matches the hue the conversion drops.
> - Strings are `hsluv(h s% l%)` / `hpluv(h p% l%)`; s / p and l also take 0–100 numbers, like `hsv()`.
>
> **Revision 2026-10-20, Okhsl group implemented:**
> - Ottosson's single Halley steps, in the cusp search and the gamut intersection, are iterated to convergence. ok_color.h itself suggests more steps for accuracy. With our matrices a single step leaves sRGB red's Okhsv s at 0.99952. Iterated, every primary and secondary lands on s = 1 and every hue's (h, 1, 1) is the sRGB cusp.
> - Grill 59 (owner): Oklab L ≥ 1 is white and L ≤ 0 is black, in both directions. Within 1e-12 of either end, chroma is dropped and L kept, because the gamut shape underflows there.
> - Beyond the gamut edge, ok_color.h's s(C) curve has a pole. Okhsl therefore extends linearly past s = 1, at the edge's slope, so every chroma has an s (package-defined). Okhsv's map needs no extension: out-of-gamut colors come out with v > 1 and round-trip.
> - `toe` is evaluated in a rationalised form below k1/k3, avoiding a cancellation that cost 5e-6 relative at L 1e-12.
>
> **Revision 2026-10-20, HDR group implemented:**
> - `Jzazbz`, `Jzczhz` and `Ictcp` have `toCss()`, because CSS Color HDR 1 defines `jzazbz()`, `jzczhz()` and `ictcp()`. `IctcpHlg` (id `ictcp-hlg`) isn't CSS and has no `toCss()`.
> - Grill 60 (owner): negative light into PQ is mirrored around PQ(0), not `sign(x)·f(|x|)`.
> - PQ decoding saturates: values whose LMS′ lies past (c2 / c3)^m2 carry infinite light, so decoding them throws a RangeError. The harness's totality sweep for these models therefore covers their reference ranges (0.4× for Jzazbz and Jzczhz, whose Jz below about −0.5 decodes past the mirrored asymptote), not 1e6×.
> - HLG uses BT.2100-3 Note 5c's 8-digit b and c. Its √ branch is odd, so negatives keep their sign.
> - Added `Ictcp.deltaEItp()` (BT.2124-0). Safdar's ΔEz is deferred: its equation isn't verified against the paper yet.
>
> **Revision 2026-10-20, ΔEz:** `Jzczhz.deltaEz()` added, checked against Safdar et al. 2017 eq. 15 (ΔHz = 2√(Cz1·Cz2)·sin(Δhz / 2)). For Cz ≥ 0 that equals the Euclidean distance in Jzazbz, which is what the code computes, so a stored negative chroma still gives a distance. References: coloraide `test_delta_e_jz` and color.js `test/delta.js` (both secondary; the paper prints no example).

## Context

ADR-010 family 2. Sources, ambiguities and implementation disagreements are logged in the [brainstorm](../brainstorm/2026-10-18-own-color-library.md), grills 47–58 plus the model-specific choices after them. The owner decided names, units and infrastructure. Model internals follow the primary source and common practice (owner, 2026-10-19).

## Decision

| Class | Channels | Units | Edge | Source |
| --- | --- | --- | --- | --- |
| `Luv65`, `Luv50` | `l u v` | L* 0–100 | `Xyz65` / `Xyz50` | CIE 015:2018 §8.2.2.1, eqs. 8.26–8.30; κ = 24389/27, ε = 216/24389 (CSS Color 4 sample code) |
| `Lchuv65`, `Lchuv50` | `l c h` | as Luv, h in degrees | `Luv65` / `Luv50` | polar form, CIE 015:2018 eqs. 8.32–8.33 |
| `Hsluv`, `Hpluv` | `h s l`, `h p l` | s, p, l as fractions (l = L*/100); p can exceed 1 | `Lchuv65` | hsluv/hsluv (MIT), built on our exact Luv65 |
| `Okhsl`, `Okhsv` | `h s l`, `h s v` | fractions | `Oklab` | Ottosson 2021 "colorpicker", `ok_color.h` (MIT) |
| `Jzazbz`, `Jzczhz` | `j a b`, `j c h` | CSS Color HDR 1 | `Xyz65` / `Jzazbz` | Safdar et al. 2017, eqs. 8–15 and Appendix A |
| `Ictcp`, `IctcpHlg` | `i ct cp` | BT.2100-3 | `Xyz65` | BT.2100-3 Tables 4, 5, 7 |

- **Luminance:** Jzazbz and `Ictcp` (PQ) take absolute light at 203 cd/m² for Y = 1, per CSS Color HDR 1, BT.2100-3 Table 10 note 10a and BT.2408-8 §2.1. The factor lives in the edge; there is no absolute XYZ node.
- **HLG:** `IctcpHlg` takes scene light E = Y × 0.264962560 (BT.2408-8 §5.1.4.1, OETF⁻¹(0.75)), so diffuse white is I = 0.75.
- **Negatives:** PQ and the HLG √ branch are sign-preserving (`sign(x)·f(|x|)`). BT.2100 Note 5h says not to clip, and ADR-003 says never to lose data silently.
- **Matrices:** Ictcp's XYZ → LMS is exact: BT.2100's integers/4096 times our exact XYZ → Rec2020. Jzazbz's inverse matrices are derived exactly from the forward ones.
- **Okhsl / Okhsv** sit on our Oklab (the CSS matrices), with Ottosson's fitted coefficients unchanged.
- **HSLuv** uses our exact Luv65, not the reference's truncated κ / ε. Its snapshot is tested at a measured tolerance.
- **Edge cases:**
  - Luv black is u = v = 0.
  - Lchuv grey uses Lch's CSS threshold, c ≤ 0.0015. It is borrowed; no spec gives one.
  - Jzczhz grey uses CSS HDR's c ≤ 0.0000026.
- **References:** primary vectors where they exist: BT.2124 Annex 4 for `Ictcp`, BT.2408-8 Table 1 greys for `IctcpHlg`. Where none exist, cited secondary vectors marked `secondary`: colour-science for Jzazbz, colorjs for Okhsl / Okhsv, the hsluv snapshot for Hsluv / Hpluv and the Luv65 columns. The culori grid is a cross-check where culori agrees on the definition.
- **Licences:** each ported file carries a one-line copyright + MIT header, and `THIRD_PARTY_NOTICES.md` ships in the package.

## Alternatives Considered

- **Paper letters** (`jz az bz`): unambiguous, but they diverge from CSS keywords.
- **An `XyzAbs65` node, or a white-luminance option on `to()`:** more surface for the rare HDR mastering case.
- **D65-only Luv:** loses culori parity and D50 Lab-adjacent work. Owner chose both.
- **HSLuv's truncated constants:** they would give two Luv definitions in one package.
- **HLG scene scale, CSS's ÷3.7743:** that number belongs to CSS's `rec2100-hlg` space, not to ICtCp.
- **HLG via the inverse OOTF:** it assumes a 1000 cd/m² display.
- **HLG with raw E = Y:** white would sit at peak.

## Consequences

- 12 new classes. Hsluv / Hpluv bounds and Okhsl / Okhsv are sRGB-only by definition.
- `Luv50` / `Lchuv50` are on culori's white, so they get the culori grid. `Luv65` doesn't.
- culori clamps PQ negatives, so the Jzazbz parity grid covers in-gamut inputs only.
- The studio's `deltaEitp` (plain Euclidean) and its HPLuv `p` range [0, 100] are wrong. Fix both at migration.

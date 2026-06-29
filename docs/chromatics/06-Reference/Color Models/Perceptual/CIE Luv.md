---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# CIE Luv

> A perceptually uniform color space (1976) optimized for additive color mixing — the basis for HSLuv and correlated color temperature calculations.

## Overview
CIELUV is a 1976 CIE uniform color space, like CIELAB but with a different formulation tuned for consistency in additive color mixtures (lights and displays). Its coordinates are L* (lightness, same concept and 0–100 scale as Lab) and u*, v*, which define chromaticity from the CIE 1976 u',v' uniform chromaticity scale (itself based on the CIE 1960 UCS). Like Lab, it is designed for perceptual uniformity and is useful for color-difference (ΔE) calculations. Its key distinction is linearity with respect to tristimulus addition: mixing two lights mixes their LUV coordinates proportionally to their luminances, which Lab does not preserve. Lines of constant hue pass through the white point. It tends to allocate space to blue hues more uniformly than Lab (which compresses blue). It is the foundation for HSLuv and HPLuv.

LUV is intended to be perceptually uniform; its cylindrical representation is LCHuv. LUV and LCHuv each have multiple color spaces defined relative to a white point; the default white point is D65. Historically it became less commonly used than Lab (which dominates printing and surface colors), but remains important in lighting, display interpolation, and color science. It can be unstable for very saturated colors of certain hues (imaginary colors beyond the gamut, like Lab) and is less widely supported in software.

**Forward transform** (reference white X_n,Y_n,Z_n): L* = 116·f(Y/Y_n) − 16 (same as Lab), u* = 13·L*·(u' − u'_n), v* = 13·L*·(v' − v'_n), where u' = 4X/(X+15Y+3Z) and v' = 9Y/(X+15Y+3Z). The factor 13L* scales for uniformity. For D65: +u* tends toward red/magenta, −u* toward green/cyan; +v* toward yellow, −v* toward blue. The (u*, v*) pair gives polar chroma C_uv = √(u*²+v*²) and hue h_uv = atan2(v*, u*). Roughly: +u*,+v* orange; −u*,+v* greenish-yellow; −u*,−v* greenish-blue/cyan; +u*,−v* purplish/magenta — the axes are rotated relative to Lab's.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `L*` | Lightness | 0-100 | Perceived lightness (0=black, 100=reference white) |
| `u*` | Red-Green axis | ~-100 to +100 (theoretically −∞ to +∞) | Chromatic red/magenta (+) to green/cyan (−) |
| `v*` | Blue-Yellow axis | ~-100 to +100 (theoretically −∞ to +∞) | Chromatic yellow (+) to blue (−) |
| `alpha` | Opacity | 0–1 | Controls transparency |

Note: u* and v* have no fixed bounds; ~±100 (up to ~±130 at L*=100) covers most real colors. Both u* and v* combine to produce the opponent dimensions (unlike Lab's directly separated a*/b*).

## Characteristics
- Better than CIE Lab for additive color mixing (lights, displays) due to linear addition properties
- Foundation for HSLuv and HPLuv
- Lines of constant hue pass through the white point
- More uniform allocation of blue hues than Lab
- Used in display color interpolation/gradients and some chromatic-adaptation calculations
- Used under-the-hood by some color appearance models (e.g. CIECAM02 uses u',v')
- **Typed Array:** Float32Array
- **Best for:** Lighting design, LED specification, additive color mixing, ΔE evaluations
- **CSS / String:** no native CSS format; typically converted to RGB or Lab for display

## Conversions
- **Derived from:** CIE XYZ (via u',v' intermediate; direct formulas both ways)
- **Converts to:** CIE LCh(uv), CIE XYZ, HSLuv
- **Direct conversion targets:** To/from CIE XYZ, LCHuv, and RGB
- Inverse to XYZ: u' = u*/(13L*) + u'_n, v' = v*/(13L*) + v'_n; Y from Lab-style inversion; X = Y·(9u')/(4v'), Z = Y·(12−3u'−20v')/(4v')
- Luv ↔ Lab is not direct (route via XYZ); Luv ↔ sRGB routes via XYZ
- Luv ↔ LCH_uv: L* stays, C_uv = √(u*²+v*²), H_uv = atan2(v*, u*)

## Chromatics API
**Class:** `CieLuv` **extends** `LabModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `L` | `number` | 0-100 | `color.luv_l` |
| `u` | `number` | ~-100 to +100 | `color.luv_u` |
| `v` | `number` | ~-100 to +100 | `color.luv_v` |

**Model-specific methods:**
- `deltaEuv(other)` -> euclidean distance in Luv
- `toHSLuv()` -> direct conversion to HSLuv
- `saturation()` -> CIE 1976 saturation (chroma / lightness)

## Resources
- [Wikipedia: CIELUV color space](https://en.wikipedia.org/wiki/CIELUV_color_space)
- [Colormath: LUV](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-u-v/)
- [Colormath: LUV color spaces](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-u-v-color-spaces/)
- [Getreuer: colorspace conversions](https://getreuer.info/posts/colorspace/)
- [HSLuv reference](https://www.hsluv.org/)
- [Bruce Lindbloom: color math reference](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE Lab]], [[LCHuv]], [[CIE 1976 UCS]], [[CIE XYZ]].

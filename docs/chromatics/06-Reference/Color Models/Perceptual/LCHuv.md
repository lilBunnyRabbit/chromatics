---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# LCHuv

> Cylindrical form of CIE Luv — better suited for additive mixing contexts than LCHab, and the foundation for HSLuv.

## Overview
LCHuv is the cylindrical (hue-based) representation of the CIE Luv color space, expressing colors as Lightness, Chroma, and Hue. It separates chroma and hue for intuitive color editing where perceptual uniformity matters (e.g. professional photo editing), and is better suited to additive-mixing contexts than LCHab. Straight lines of constant hue pass through the white point. It is the foundation for HSLuv and HPLuv. LUV is intended to be perceptually uniform; its cylindrical representation is LCHuv. LUV and LCHuv each have multiple color spaces defined relative to a white point; the default white point is D65.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `L` | Lightness | 0-100 | Perceived lightness |
| `C` | Chroma | 0–∞ | Colorfulness relative to brightness (saturation/vividness) |
| `h` / `H` | Hue angle | 0-360 | Hue family on the color wheel |
| `alpha` | Opacity | 0–1 | Controls transparency |

## Characteristics
- Straight lines of constant hue pass through the white point
- Foundation for HSLuv/HPLuv transformations
- Intuitive hue rotation and chroma/saturation scaling with perceptual uniformity
- **Typed Array:** Float32Array
- **Best for:** Additive color palette design, hue interpolation, lighting applications, professional photo editing
- **CSS / String:** typically converted to RGB for web display

## Conversions
- **Derived from:** CIE Luv (polar transform)
- **Converts to:** CIE Luv, CIE XYZ, HSLuv
- **Direct conversion targets:** To/from LUV, CIE XYZ, and RGB

## Chromatics API
**Class:** `LcHuv` **extends** `PerceptualCylindricalModel`

**Model-specific methods:**
- `toHSLuv()` -> direct conversion
- `adjustChroma(delta)`, `atLightness(L)`, `maxChroma()`

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`

## Resources
- [Wikipedia: CIELCh (uv)](https://en.wikipedia.org/wiki/CIELCh_ab)
- [Colormath: LCHuv](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-huv/)
- [Colormath: LCHuv color spaces](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-huv-color-spaces/)
- [HSLuv reference](https://www.hsluv.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE Luv]], [[LCHab]], [[CIE Lch]], [[CIE XYZ]].

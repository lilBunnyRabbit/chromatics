---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# LCHab

> Cylindrical form of CIE Lab (identical to CIE LCh) — the standard polar representation for perceptually uniform color in Lab space.

## Overview
LCHab is the cylindrical (polar) representation of CIE Lab, expressing color as Lightness, Chroma, and Hue. It separates chroma and hue from lightness for more intuitive manipulation while preserving Lab's perceptual uniformity, making it ideal for graphic design and advanced color editing. It is mathematically identical to CIE LCh(ab) — LCHab IS CIE LCh(ab), just an alternate naming convention. LAB is intended to be perceptually uniform; its cylindrical representation is LCHab. LAB and LCHab each have multiple color spaces defined relative to a white point; the default white point is D65.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `L` | Lightness | 0-100 | Perceived lightness (same as in CIE Lab) |
| `C` | Chroma | 0–∞ | Colorfulness relative to brightness (color vividness/saturation) |
| `h` / `H` | Hue angle | 0-360 | Hue family on the color wheel |
| `alpha` | Opacity | 0–1 | Controls transparency |

## Characteristics
- Intuitive hue and saturation adjustment (hue rotation, chroma adjustment, lightness control)
- Same perceptual uniformity as CIE Lab
- **Typed Array:** Float32Array
- **Best for:** Graphic design, advanced color editing, palette design, perceptual color editing — same use cases as CIE LCh
- **CSS / String:** usually converted to RGB for web display

## Conversions
- **Derived from:** CIE Lab (polar transform)
- **Converts to:** CIE Lab, CIE XYZ, sRGB
- **Direct conversion targets:** To/from CIE Lab, CIE XYZ, and RGB

## Chromatics API
**Note:** Implementation alias for `CieLch`. Same class, same methods. See [[CIE Lch]].

## Resources
- [Wikipedia: CIELCh_ab](https://en.wikipedia.org/wiki/CIELCh_ab)
- [Colormath: LCHab](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab/)
- [Colormath: LCHab color spaces](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab-color-spaces/)
- [W3C CSS Color Module Level 4 (lch())](https://www.w3.org/TR/css-color-4/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE Lch]], [[CIE Lab]], [[LCHuv]], [[HLC]].

---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# Rec. 2020

> The ITU standard for Ultra HD and HDR television (BT.2020), with a significantly wider gamut than Rec. 709/sRGB using monochromatic (laser) primaries.

## Overview
Rec. 2020 (BT.2020 / REC.2020) is an RGB color space standard for Ultra High Definition (UHD) and HDR television, offering a significantly wider gamut than Rec. 709/sRGB and suitable for HDR content. It covers ~75.8% of CIE 1931 xy (vs sRGB's ~35.9%). Its primaries are monochromatic (laser) spectral wavelengths: R=630nm, G=532nm, B=467nm. It is required for 4K/8K UHD and HDR content and is critical for video workflows with extended color ranges.

## Channels

| Channel | Full name | Range | Controls |
| ------- | --------- | ----- | -------- |
| `r` | Red | 0-1 | Increasing `r` intensifies the red component in a wide gamut |
| `g` | Green | 0-1 | Adjusting `g` increases green intensity |
| `b` | Blue | 0-1 | Increasing `b` intensifies the blue component |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- **Key strengths:** Covers ~75.8% of CIE 1931 xy (vs sRGB's ~35.9%); primaries are spectral wavelengths R=630nm, G=532nm, B=467nm; required for 4K/8K UHD and HDR content.
- **Primaries:** R(0.708, 0.292), G(0.170, 0.797), B(0.131, 0.046). **White point:** D65.
- **Typed Array:** Float32Array.
- **Manipulation -- HDR Adjustments / HDR Color Grading:** Fine-tune channel values to optimize for high dynamic range content (adjusting colors and brightness for HDR).
- **CSS / String:** `color(rec2020 r g b)`; typically converted to sRGB for standard web display.
- **Best for:** UHD/4K/8K content, HDR video production.

## Conversions
- **Converts to:** sRGB (gamut mapping), Rec. 709, CIE XYZ, ICtCp.
- **Direct conversion targets:** To/from sRGB and other broadcast standards.

## Chromatics API
**Class:** `Rec2020` **extends** `RGBModel`

**Model-specific methods:**
- `isInSrgb()`, `isInP3()` -> gamut checks
- `toCSS()` -> `color(rec2020 r g b)` string

**Unique value:** UHD/4K/8K/HDR content. Monochromatic primaries cover ~76% of visible colors.

## Resources
- [Rec. 2020 on Wikipedia](https://en.wikipedia.org/wiki/Rec._2020)
- [colormath BT.2020 color space](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-b-t2020.html)
- [W3C CSS Color 4 -- predefined color spaces](https://www.w3.org/TR/css-color-4/#predefined)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[Rec. 709]], [[sRGB]], [[Display P3]], [[CIE XYZ]].

---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# Adobe RGB

> A wide-gamut RGB color space by Adobe (1998) covering ~50% of CIE Lab visible colors vs sRGB's ~35%, designed for professional photography and print.

## Overview
Adobe RGB is a wide-gamut RGB color space developed by Adobe Systems (1998), offering a broader range of colors than sRGB — covering roughly 50% of CIE Lab visible colors compared to sRGB's ~35%. The wider gamut is especially pronounced in the cyan-green region. It is the standard for professional photography workflows and high-quality print graphics, providing better CMYK conversion coverage than sRGB, and is well suited to projects printed on high-quality printers or that need to match colors across different media. Channels use a gamma of 2.2.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `r` | Red | 0–255 | Red intensity (gamma 2.2), wider gamut |
| `g` | Green | 0–255 | Green intensity, wider gamut |
| `b` | Blue | 0–255 | Blue intensity, wider gamut |
| `alpha` | Opacity | 0–1 | Controls transparency |

## Characteristics
- **Key strengths:** significantly wider gamut than sRGB, especially in cyan-green; standard for professional photography workflows; better CMYK conversion coverage than sRGB.
- **Gamut:** ~50% of CIE Lab visible colors (vs sRGB's ~35%).
- **Primaries:** R(0.64, 0.33), G(0.21, 0.71), B(0.15, 0.06) | **White point:** D65 | **Gamma:** 2.2.
- **Typed array:** `Uint8ClampedArray`.
- **CSS representations:** typically converted to sRGB for web display.
- **Common manipulations:** gamut adjustment / tuning (adjust channels to maintain color fidelity across devices for print and digital art requiring a wide gamut).
- **Best for:** professional photography, print preparation, wide-gamut editing.

## Conversions
**Direct conversion targets:** sRGB (gamut mapping needed), RGB255, CIE XYZ, and through color profiles / ICC to CIE Lab.

## Chromatics API
**Class:** `AdobeRgb` **extends** `RGBModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `r` | `number` | 0–255 | `color.argb_r` |
| `g` | `number` | 0–255 | `color.argb_g` |
| `b` | `number` | 0–255 | `color.argb_b` |

**Model-specific methods:**
- `isInSrgb()` -> can this be displayed in sRGB without clipping?
- `gamutMapToSrgb()` -> perceptual gamut mapping to sRGB

**Unique value:** Wider gamut than sRGB, especially cyan-green. Import from professional camera RAW workflows.

## Resources
- [Wikipedia: Adobe RGB color space](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)
- [Colormath: Adobe RGB API](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-adobe-r-g-b.html)
- [Bruce Lindbloom — RGB working space data](http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[sRGB]], [[ProPhoto RGB]], [[Display P3]], [[CIE XYZ]].

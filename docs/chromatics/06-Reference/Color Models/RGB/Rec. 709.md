---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# Rec. 709

> The ITU standard RGB color space for HDTV (BT.709) -- shares the same primaries as sRGB but with a slightly different transfer function optimized for broadcast.

## Overview
Rec. 709 (BT.709 / REC.709) is the standard RGB color space for HDTV, defining the primaries, transfer functions, and color gamut used for most broadcast and streaming content. It has been the universal HDTV standard since 1990. It shares the same primaries and white point (D65) as sRGB, differing only in a slightly different gamma/transfer curve optimized for broadcast.

## Channels

| Channel | Full name | Range | Controls |
| ------- | --------- | ----- | -------- |
| `r` | Red | 0-255 | Alters red intensity in a standard HDTV range |
| `g` | Green | 0-255 | Adjusts green intensity |
| `b` | Blue | 0-255 | Alters blue intensity |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- **Key strengths:** Universal HDTV standard since 1990; same primaries and white point as sRGB (D65).
- **vs sRGB:** Same primaries but slightly different gamma curve (transfer-function difference is ~0.04%).
- **Typed Array:** Uint8ClampedArray.
- **Manipulation:** Brightness/Contrast adjustments (uniform changes to all channels affect overall luminance and contrast); Broadcast Standard Correction (adjusting colors to comply with standard HDTV broadcast specifications).
- **CSS / String:** `rgb(r, g, b)` and `rgba(r, g, b, a)`.
- **Best for:** HDTV broadcast, streaming content, professional video production.

## Conversions
- **Converts to:** sRGB (near-identical), CIE XYZ, YCbCr.
- **Direct conversion targets:** To/from sRGB, RGB255, and through conversion to perceptual models.

## Chromatics API
**Class:** `Rec709` **extends** `RGBModel`

**Note:** Shares primaries with sRGB. Transfer function difference is ~0.04%. Implementation can alias to `Srgb` with a flag for strict mode.

## Resources
- [Rec. 709 on Wikipedia](https://en.wikipedia.org/wiki/Rec._709)
- [colormath BT.709 color space](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-b-t709.html)
- [Bruce Lindbloom -- RGB working space information](http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[sRGB]], [[Rec. 2020]], [[SMPTE-C]], [[CIE XYZ]].

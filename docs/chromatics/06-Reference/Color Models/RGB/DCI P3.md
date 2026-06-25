---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# DCI P3

> The digital cinema RGB color space (DCI standard), with ~25% wider gamut than sRGB, originally designed for theatrical projection.

## Overview
DCI P3 is the digital cinema RGB color space, created by Digital Cinema Initiatives (DCI), offering a gamut roughly 25% wider than sRGB. It was originally designed for theatrical projection and digital cinema mastering, and has since been adopted in high-end mobile devices, laptops, and monitors. It is a theater projection space using a 2.6 gamma and a white point near 6300K; for consumer displays, the D65-based Display P3 variant is used instead.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `r` | Red | 0–255 or 0–1 | Red intensity, used in digital cinema |
| `g` | Green | 0–255 or 0–1 | Green intensity, used in digital cinema |
| `b` | Blue | 0–255 or 0–1 | Blue intensity, used in digital cinema |
| `alpha` | Opacity | 0–1 | Controls transparency |

## Characteristics
- **Key strengths:** ~25% wider gamut than sRGB; the digital cinema standard, adopted in high-end mobile devices, laptops, and monitors.
- **Primaries:** R(0.680, 0.320), G(0.265, 0.690), B(0.150, 0.060) | **White point:** ~6300K | **Gamma:** 2.6.
- **Typed array:** `Uint8ClampedArray`.
- **CSS representations:** typically converted to sRGB for standard web display.
- **Common manipulations:** cinema color grading (adjust colors for digital cinema within the DCI P3 space); wide-gamut display adjustment (tailor colors for P3-capable displays).
- **Best for:** digital cinema mastering, theatrical color grading.

## Conversions
**Converts to:** Display P3 (different white point), sRGB, RGB255, CIE XYZ.

## Chromatics API
**Class:** `DciP3` **extends** `RGBModel`

**Model-specific methods:**
- `toDisplayP3()` -> convert to Display P3 (D65 white point)
- `isInSrgb()` -> gamut check

**Note:** Theater projection space (2.6 gamma, ~6300K white). For consumer displays, use `DisplayP3` instead.

## Resources
- [Wikipedia: DCI-P3](https://en.wikipedia.org/wiki/DCI-P3)
- [Colormath: DCI P3 API](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-d-c-i_-p3.html)
- [Bruce Lindbloom — RGB working space data](http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[Display P3]], [[sRGB]], [[Adobe RGB]], [[CIE XYZ]].

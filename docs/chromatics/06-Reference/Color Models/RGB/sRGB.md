---
tags: [color-model, rgb, critical]
status: reference
updated: 2026-06-24
---

# sRGB

> The standard RGB color space for the web and consumer displays (IEC 61966-2-1), defining specific primaries, a D65 white point, and a ~2.2 gamma curve.

## Overview
sRGB is the standard RGB color space for the web and consumer devices, defined by IEC 61966-2-1 with a gamma curve (~2.2) that approximates human vision. It was created cooperatively by HP and Microsoft (1996) for use on monitors, printers, and the Internet, designed to match typical home and office viewing conditions. It is a specific implementation of the RGB model with standardized primaries, a D65 white point, and defined gamma characteristics. CSS `rgb()` and hex (`#RRGGBB`) colors are sRGB by default, making it the universal interchange format for digital color. Channels are gamma-corrected.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `r` | Red | 0–255 (or 0–1 normalized) | Red intensity, gamma-corrected |
| `g` | Green | 0–255 (or 0–1 normalized) | Green intensity, gamma-corrected |
| `b` | Blue | 0–255 (or 0–1 normalized) | Blue intensity, gamma-corrected |
| `alpha` | Opacity | 0–1 | Controls transparency |

## Characteristics
- **Key strengths:** universal web standard — CSS `rgb()` and hex (`#RRGGBB`) are sRGB; co-developed by HP and Microsoft (1996).
- **Primaries:** R(0.64, 0.33), G(0.30, 0.60), B(0.15, 0.06) | **White point:** D65 | **Gamma:** ~2.2.
- **Typed array:** `Uint8ClampedArray` (consistent with web color specifications).
- **CSS representations:** `rgb(r, g, b)` and `rgba(r, g, b, a)`.
- **Common manipulations:** gamma correction (modify luminance/brightness while preserving the curve); color correction (apply color profiles for consistent cross-device display); brightness and contrast adjustments (modify channels uniformly).
- **Best for:** web, consumer displays, image interchange, general digital color.

## Conversions
**Direct conversion targets:** Linear sRGB, RGB255, Normalized RGB, HSL, HSV, CIE XYZ, and any model via XYZ (and to perceptual models like CIE Lab through intermediate conversions).

## Chromatics API
**Class:** `Srgb` **extends** `RGBModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `r` | `number` | 0–255 (or 0–1 normalized) | `color.r` |
| `g` | `number` | 0–255 (or 0–1 normalized) | `color.g` |
| `b` | `number` | 0–255 (or 0–1 normalized) | `color.b` |

**DSL Constructor:** `RGB(r, g, b)` -> `Color` | `hex('#ff8000')` -> `Color`

**Model-specific methods:**
- `toHex()` -> `#rrggbb` or `#rrggbbaa`
- `toCSS()` -> `rgb(r, g, b)` string
- `linearize()` -> `LinearSrgb` (remove gamma for math)
- `blend(other, ratio)` -> blend in linear space
- `contrastWCAG(other)` -> WCAG 2.x contrast ratio
- `contrastAPCA(other)` -> APCA Lc value
- `meetsAA(other)`, `meetsAAA(other)` -> boolean

**Inherited (RGBModel):** `invert()`, `grayscale()`, `luminance`, `simulateCVD()`

**Priority:** Critical -- primary input/output format for web.

## Resources
- [Wikipedia: sRGB](https://en.wikipedia.org/wiki/SRGB)
- [Colormath: sRGB API](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-s-r-g-b.html)
- [W3C CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) — sRGB as the default web color space
- [Bruce Lindbloom — color math & RGB/XYZ matrices](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[RGB]], [[Linear sRGB]], [[scRGB]], [[Display P3]].

---
tags: [color-model, rgb, standard]
status: reference
updated: 2026-06-24
---

# Display P3

> Apple's adaptation of DCI P3 for consumer displays -- same wide primaries but with sRGB's D65 white point and ~2.2 gamma, now the standard for modern Apple devices.

## Overview
Display P3 is Apple's adaptation of DCI P3 for consumer displays: it shares DCI P3's wide primaries but pairs them with sRGB's D65 white point and a ~2.2 gamma curve (the sRGB transfer function). This gives a gamut roughly 25% wider than sRGB while remaining D65-compatible, making it well suited to richer color reproduction on modern monitors and mobile screens. It has been the default color space on iPhone, iPad, and Mac since around 2016, and is supported in CSS via `color(display-p3 r g b)`.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `r` | Red | 0–255 or 0–1 | Red intensity |
| `g` | Green | 0–255 or 0–1 | Green intensity |
| `b` | Blue | 0–255 or 0–1 | Blue intensity |
| `alpha` | Opacity | 0–1 | Controls transparency |

## Characteristics
- **Key strengths:** ~25% wider gamut than sRGB with D65 compatibility; default on iPhone, iPad, and Mac since ~2016; CSS support via `color(display-p3 r g b)`.
- **White point:** D65 | **Gamma:** ~2.2 (sRGB transfer function); same wide primaries as DCI P3.
- **Typed array:** `Uint8ClampedArray`.
- **CSS representations:** `color(display-p3 r g b)`; otherwise typically converted to sRGB for web usage.
- **Common manipulations:** color calibration (adjust channels to match display characteristics); wide-gamut display adjustment (tailor colors for P3-capable displays).
- **Best for:** modern web/app design targeting Apple devices, wide-gamut consumer content.

## Conversions
**Direct conversion targets:** sRGB (gamut clamp), DCI P3, RGB255, CIE XYZ.

## Chromatics API
**Class:** `DisplayP3` **extends** `RGBModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `r` | `number` | 0–1 | `color.p3_r` |
| `g` | `number` | 0–1 | `color.p3_g` |
| `b` | `number` | 0–1 | `color.p3_b` |

**DSL Constructor:** `P3(r, g, b)` -> `Color`

**Model-specific methods:**
- `isInSrgb()` -> can this be displayed in sRGB?
- `toCSS()` -> `color(display-p3 r g b)` string
- `gamutMapToSrgb()` -> perceptual mapping to sRGB
- `srgbDelta()` -> how far outside sRGB gamut this color is

**Priority:** High -- growing web standard, Apple default, CSS Color 4 supported.

## Resources
- [Wikipedia: Display P3 / DCI-P3](https://en.wikipedia.org/wiki/DCI-P3#Display_P3)
- [Colormath: Display P3 API](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-display-p3.html)
- [W3C CSS Color Module Level 4 — display-p3](https://www.w3.org/TR/css-color-4/#predefined-display-p3)
- [WebKit — Wide Gamut Color in CSS](https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[DCI P3]], [[sRGB]], [[Adobe RGB]], [[CIE XYZ]].

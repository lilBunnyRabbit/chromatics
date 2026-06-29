---
tags: [color-model, hue]
status: reference
updated: 2026-06-24
---

# HPLuv

> A constrained variant of HSLuv that only produces pastel colors, guaranteeing every combination maps to a valid sRGB color while remaining perceptually uniform.

## Overview
HPLuv (Hue–Pastel–Luv) is a variant of HSLuv that produces softer, pastel colors while preserving perceptual uniformity. It adjusts the saturation curve so that every H,P,L combination maps to a valid sRGB color (no gamut clipping), at the cost of being limited to softer/pastel colors only. HSLuv and HPLuv are color spaces designed as a human-friendly alternative to HSL.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `H` | Hue | 0-360 | Position on the color wheel; rotating shifts all colors around the wheel |
| `P` | Pastel saturation | 0-100 | Saturation reduced to the pastel range in Luv space; lower = softer/more pastel, higher = more intense |
| `L` | Lightness | 0-100 | Perceptually uniform lightness in CIE Luv color space |

## Characteristics
- Fully perceptually uniform in all three dimensions
- Every H,P,L combination maps to a valid sRGB color (no gamut clipping)
- Trade-off: limited to softer/pastel colors only
- **Typed Array:** Float32Array
- **CSS / string:** Converted to HSL or RGB for CSS output
- **Best for:** Soft UI palettes, pastel design themes, guaranteed gamut safety; modern UI themes

## Conversions
- **Derived from:** CIE LCh(uv) via HSLuv
- **Converts to:** HSLuv, CIE Luv, sRGB
- **Direct conversion targets:** To/from HSL, HSLuv, and RGB

## Chromatics API
**Class:** `HPLuv` **extends** `HueModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `h` | `number` | 0-360 | `color.hpluv_h` |
| `p` | `number` | 0-100 | `color.hpluv_p` |
| `l` | `number` | 0-100 | `color.hpluv_l` |

**DSL Constructor:** `HPLUV(h, p, l)` -> `Color`

**Model-specific methods:**
- `tint(amount)` -> raise lightness
- `shade(amount)` -> lower lightness

**Note:** Every HPLuv value is guaranteed in-gamut (sRGB). No gamut mapping needed. Pastel-only constraint.

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`

## Resources
- [HPLuv - colormath API docs](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-p-luv/)
- [HSLuv / HPLuv reference site](https://www.hsluv.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].* Related: [[HSLuv]], [[CIE Luv]], [[HSL]], [[HCL]].

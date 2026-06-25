---
tags: [color-model, hue]
status: reference
updated: 2026-06-24
---

# HSLuv

> A perceptually uniform alternative to HSL that maps CIE LCh(uv) to a human-friendly 0-100 saturation scale, ensuring equal numeric steps produce visually equal differences.

## Overview
HSLuv is a reparameterization of HSL designed for perceptual uniformity, ensuring that changes in saturation and lightness are consistent across all hues so that equal numeric steps yield similar visual differences. It maps CIE LCh(uv) to a human-friendly 0-100 saturation scale with sRGB gamut mapping. HSLuv and HPLuv are color spaces designed as a human-friendly alternative to HSL.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `H` | Hue | 0-360 | Position on the color wheel; rotating changes the base color |
| `S` | Saturation | 0-100 | Color intensity stretched to fill the sRGB gamut per hue; perceptually uniform colorfulness in Luv space |
| `L` | Lightness | 0-100 | Perceived lightness (CIE Luv-based), perceptually uniform |

## Characteristics
- Perceptually uniform -- unlike HSL, equal L values actually look equally bright
- S=100 always gives the most saturated sRGB color for that hue at that lightness
- Drop-in replacement for HSL with much better perceptual behavior
- **Typed Array:** Float32Array
- **CSS / string:** Typically converted to HSL or RGB for CSS, as CSS does not natively support HSLuv
- **Best for:** Programmatic palette generation, accessible design, data visualization, UI theming

## Conversions
- **Derived from:** CIE LCh(uv) with sRGB gamut mapping
- **Converts to:** CIE Luv, sRGB, HPLuv
- **Direct conversion targets:** To/from HSL and RGB

## Chromatics API
**Class:** `HSLuv` **extends** `HueModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `h` | `number` | 0-360 | `color.hsluv_h` |
| `s` | `number` | 0-100 | `color.hsluv_s` |
| `l` | `number` | 0-100 | `color.hsluv_l` |

**DSL Constructor:** `HSLUV(h, s, l)` -> `Color`

**Model-specific methods:**
- `tint(amount)` -> raise L (perceptually uniform)
- `shade(amount)` -> lower L (perceptually uniform)
- `saturate(amount)` -> raise S
- `desaturate(amount)` -> lower S

**Unique value:** Unlike HSL, S=100 ALWAYS gives the most saturated sRGB color at that hue/lightness. No gamut surprises. Drop-in perceptual replacement for HSL.

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`

## Resources
- [HSLuv reference site](https://www.hsluv.org/)
- [HSLuv - colormath API docs](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-luv/)
- [HSLuv source & spec (GitHub)](https://github.com/hsluv/hsluv)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].* Related: [[HSL]], [[HPLuv]], [[CIE Luv]], [[HCL]].

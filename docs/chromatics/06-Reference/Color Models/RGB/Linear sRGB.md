---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# Linear sRGB

> sRGB with the gamma curve removed -- values are proportional to physical light intensity, making it correct for color math like blending, interpolation, and compositing.

## Overview
Linear sRGB is the gamma-linearized form of sRGB: the sRGB transfer function (gamma) is removed so that channel values are proportional to physical light intensity. This makes it the physically correct space for color arithmetic — blending, interpolation, alpha compositing, and shader math — before re-applying the gamma curve for display. It shares the same primaries and white point as sRGB, differing only in the absence of gamma. It also serves as the required intermediate for sRGB ↔ CIE XYZ conversions.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `r` | Red | 0–1 | Linear red light intensity (no gamma) |
| `g` | Green | 0–1 | Linear green light intensity (no gamma) |
| `b` | Blue | 0–1 | Linear blue light intensity (no gamma) |
| `alpha` | Opacity | 0–1 | Controls transparency |

## Characteristics
- **Key strengths:** physically correct for color arithmetic (blending, alpha compositing); required intermediate for sRGB ↔ CIE XYZ conversions; same primaries and white point as sRGB, just without gamma.
- **Typed array:** `Float32Array` (precise linear calculations).
- **CSS representations:** typically converted back to sRGB for CSS output.
- **Common manipulations:** linear blending (straightforward arithmetic for mixing and scaling); linear contrast adjustment (adjust contrast in linear space before applying gamma for display).
- **Best for:** color blending, compositing, shader math, any color computation.

## Conversions
**Derived from:** sRGB (inverse gamma). **Converts to:** sRGB (apply gamma), CIE XYZ (3×3 matrix), Normalized RGB, and other spaces through linear transformations.

## Chromatics API
**Class:** `LinearSrgb` **extends** `RGBModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `r` | `number` | 0–1 | `color.lr` |
| `g` | `number` | 0–1 | `color.lg` |
| `b` | `number` | 0–1 | `color.lb` |

**Model-specific methods:**
- `blend(other, ratio)` -> physically correct linear blend
- `toSrgb()` -> apply sRGB gamma curve
- `toXyz()` -> multiply by sRGB-to-XYZ matrix (3×3)
- `premultiply(alpha)` -> premultiplied alpha for compositing

**Unique value:** The CORRECT space for blending, compositing, and shader math. Never blend in gamma sRGB.

**Internal role:** Bridge between sRGB (display) and CIE XYZ (conversions).

## Resources
- [Wikipedia: sRGB transfer function](https://en.wikipedia.org/wiki/SRGB#The_sRGB_transfer_function)
- [Colormath: Linear sRGB API](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-linear-s-r-g-b.html)
- [Bruce Lindbloom — RGB working space math](http://www.brucelindbloom.com/index.html?Eqn_RGB_to_XYZ.html)
- [W3C CSS Color Module Level 4 — linear-sRGB](https://www.w3.org/TR/css-color-4/#predefined-sRGB-linear)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[sRGB]], [[RGB]], [[scRGB]], [[CIE XYZ]].

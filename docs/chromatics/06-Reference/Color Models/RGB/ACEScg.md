---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# ACEScg

> The ACES working space for CGI and compositing -- linear encoding with AP1 primaries that are wide but more practical than AP0 for rendering.

## Overview
ACEScg is a linear variant of ACES designed for computer graphics and visual effects, optimized for compositing and CGI workflows. Its linear encoding is correct for CG lighting, shading, and compositing math, and its AP1 primaries are wide enough for cinema while avoiding the imaginary colors of AP0. It is the standard working space for VFX in ACES pipelines, widely used for its linear behavior that facilitates realistic compositing.

## Channels

| Channel | Full name | Range | Controls |
| ------- | --------- | ----- | -------- |
| `r` | Red | 0-1 | Increasing `r` intensifies red in a linear space |
| `g` | Green | 0-1 | Modifies green intensity linearly |
| `b` | Blue | 0-1 | Modifies blue intensity linearly |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- **Key strengths:** Linear encoding correct for CG lighting, shading, compositing math; AP1 primaries wide enough for cinema but with no imaginary colors (unlike AP0); standard working space for VFX in ACES pipelines.
- **Typed Array:** Float32Array.
- **Manipulation -- Linear Adjustments:** Straightforward arithmetic for color blending and corrections.
- **CSS / String:** Converted to ACES or sRGB for display on standard monitors.
- **Best for:** VFX compositing, 3D rendering, CG lighting, shader calculations.

## Conversions
- **Derived from:** ACES (AP0 -> AP1 matrix).
- **Converts to:** ACES, ACEScc, ACEScct, sRGB.
- **Direct conversion targets:** To/from ACES, sRGB, and other linear color spaces.

## Chromatics API
**Class:** `Acescg` **extends** `RGBModel`

**Model-specific methods:**
- `toAces()` -> convert to ACES (AP1 -> AP0)
- `blend(other, ratio)` -> linear blend (correct in linear space)

**Unique value:** Linear AP1 primaries for VFX compositing and CG rendering.

## Resources
- [ACEScg Documentation -- ACES Central](https://acescentral.com)
- [ACES on Wikipedia](https://en.wikipedia.org/wiki/Academy_Color_Encoding_System)
- [colormath ACEScg color space](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-scg.html)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[ACES]], [[ACEScc]], [[ACEScct]].

---
tags: [color-model, hue]
status: reference
updated: 2026-06-24
---

# HCL

> Cylindrical reparameterization of CIE Lab that puts Hue first -- essentially CIE LCh(ab) reordered as H, C, L for more intuitive use in design tools.

## Overview
HCL (Hue–Chroma–Luminance) is a model derived from CIELCh that organizes color by hue, chroma (saturation), and luminance. It is mathematically identical to CIE LCh(ab), just reordered so that Hue comes first, which is more intuitive for design tools. It provides perceptually uniform color selections based on hue, chroma, and luminance, making it well suited for creating perceptually uniform palettes.

## Channels
| Channel | Full name | Range  | Controls                                          |
| ------- | --------- | ------ | ------------------------------------------------- |
| `H`     | Hue       | 0-360  | Position on the perceptual color wheel            |
| `C`     | Chroma    | 0-~130 | Color intensity/saturation (perceptually uniform) |
| `L`     | Luminance | 0-100  | Perceived lightness                               |

## Characteristics
- Perceptually uniform -- equal steps in C or L look equally different
- Hue rotation preserves perceived brightness (unlike HSL)
- Better than HSL for generating accessible color palettes
- Mathematically identical to CIE LCh(ab), just reordered (shares implementation)
- **Best for:** Data visualization palettes, accessible design, programmatic color generation

## Conversions
- **Derived from:** CIE Lab / CIE LCh(ab)
- **Converts to:** CIE Lab, CIE XYZ, sRGB

## Chromatics API
**Class:** `HCL` **extends** `PerceptualCylindricalModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `h` | `number` | 0-360 | `color.hcl_h` |
| `c` | `number` | 0-~130 | `color.hcl_c` |
| `l` | `number` | 0-100 | `color.hcl_l` |

**DSL Constructor:** `HCL(h, c, l)` -> `Color`

**Model-specific methods:**
- `adjustChroma(delta)` -> new color with C +/- delta (perceptually meaningful)
- `atLightness(l)` -> same hue/chroma at target lightness
- `maxChroma(gamut?)` -> max achievable chroma at this h,l in target gamut
- `isInGamut(space?)` -> boolean
- `gamutMap(space?)` -> chroma-reduced color within gamut

**Inherited (CylindricalModel):**
- `rotateHue(deg)`, `complementary()`, `analogous()`, `triadic()`, `tetradic()`, `splitComplementary()`

**Note:** Mathematically identical to CIE LCh(ab), just reordered. Share implementation.

## Resources
- [CIELCh(ab) - Wikipedia](https://en.wikipedia.org/wiki/CIELCh_ab)
- [HCL color space - Wikipedia](https://en.wikipedia.org/wiki/HCL_color_space)
- [Bruce Lindbloom - color math (Lab/LCh)](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].* Related: [[CIE Lab]], [[CIE XYZ]], [[HSLuv]], [[HCT]].

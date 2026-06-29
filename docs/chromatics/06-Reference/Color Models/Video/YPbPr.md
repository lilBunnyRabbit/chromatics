---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# YPbPr

> The analog component video version of YCbCr -- used in component video cables for high-quality analog signals.

## Overview
YPbPr is an analog component video format that separates the video signal into a luminance component and two color-difference signals (Pb and Pr), used in component video connections and both analog and digital broadcast systems. Its relationship to YCbCr: YPbPr (analog) maps to YCbCr (digital, scaled and offset).

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `Y` | Luminance | Varies | Brightness |
| `Pb` | Blue-difference signal | Varies | Difference between the blue component and `Y` |
| `Pr` | Red-difference signal | Varies | Difference between the red component and `Y` |
| `alpha` | Opacity | 0-1 | Transparency |

## Characteristics
- Analog counterpart of YCbCr (scale + offset relationship).
- Typed array: Float32Array.
- Signal/component adjustment: alter `Pb` and `Pr` to correct color balance while controlling brightness with `Y`.
- CSS/string: typically converted to RGB for web usage.
- Best for: analog component video connections, legacy AV equipment.

## Conversions
- **Derived from:** RGB.
- **Converts to:** YCbCr (scale+offset), RGB.
- **Direct conversion targets:** to/from RGB and YCbCr.

## Chromatics API
**Class:** `YPbPr` **extends** `VideoModel`

**Note:** Analog counterpart of YCbCr. Minimal unique API -- primary value is conversion to/from YCbCr (scale+offset).

## Resources
- [YPbPr - Wikipedia](https://en.wikipedia.org/wiki/YPbPr)
- [Multiplexed Analogue Components (MAC) - Wikipedia](https://en.wikipedia.org/wiki/Multiplexed_Analogue_Components)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YCbCr]], [[YUV]]

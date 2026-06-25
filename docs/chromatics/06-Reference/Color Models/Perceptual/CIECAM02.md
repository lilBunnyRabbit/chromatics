---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# CIECAM02

> The predecessor to CAM16 -- a comprehensive color appearance model (2002) accounting for viewing conditions, widely used in ICC color management.

## Overview
CIECAM02 is a comprehensive color appearance model that factors in viewing conditions -- ambient light, surround, and adaptation effects -- offering a holistic approach to predicting how colors appear. It is the predecessor to CAM16 and remains widely deployed, particularly in ICC v4 profiles for the perceptual rendering intent. CAM16 improves hue uniformity and computational stability, but CIECAM02 is still in broad use.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `J` | Lightness (brightness) | 0-100 | Higher `J` increases perceived brightness |
| `C` | Colorfulness (chroma) | 0-inf | Increasing `C` results in more intense colors |
| `h` | Hue angle | 0-360 | Changing `h` alters the perceived hue |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- Accounts for illumination, surround, and adaptation effects
- Used in ICC v4 profiles for perceptual rendering intent
- Typed array: Float32Array
- **vs CAM16:** CAM16 improves hue uniformity and computational stability; CIECAM02 remains widely deployed. CAM16 is preferred for new work.
- **Best for:** ICC color management, cross-media reproduction, advanced imaging and color correction
- Adjust `J` and `C` for appearance adjustments; modify `h` to shift the color tone

## Conversions
- **Derived from:** CIE XYZ + viewing conditions
- **Converts to:** CAM16, CIE XYZ
- **Direct conversion targets:** to/from CAM16; indirectly to/from CIE Lab
- String output: typically converted to CIE Lab or RGB for display

## Chromatics API
**Class:** `Ciecam02` **extends** `AppearanceModel`

**Model-specific methods:**
- `withViewingConditions(conditions)` -> re-evaluate appearance
- `toUCS()` -> convert to CIECAM02 UCS for deltaE

**Note:** Predecessor to CAM16. Include for ICC v4 profile compatibility. CAM16 is preferred for new work.

## Resources
- [CIECAM02 — Wikipedia](https://en.wikipedia.org/wiki/CIECAM02)
- [colour-science.org — color appearance models](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CAM16]], [[CAM16-UCS]], [[CIE XYZ]]

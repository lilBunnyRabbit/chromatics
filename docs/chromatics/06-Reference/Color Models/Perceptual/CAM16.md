---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# CAM16

> A comprehensive color appearance model (2016) that predicts how colors look under specific viewing conditions -- accounts for illumination, background, and surround.

## Overview
CAM16 is an updated color appearance model derived from CIECAM02, designed for improved performance and better predictions under modern viewing conditions. It factors in illumination, background, and surround to predict how colors actually appear to a human observer, rather than just their stimulus values. It is the most accurate model of human color perception available and is used in advanced imaging where accurate color appearance is critical.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `J` | Lightness | 0-100 | Perceived lightness relative to white / overall brightness |
| `C` | Chroma | 0-inf | Colorfulness relative to white; higher `C` yields more vivid colors |
| `h` | Hue | 0-360 | Perceived hue; modifying `h` changes the base hue |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- Most accurate model of human color perception available
- Accounts for viewing conditions (illumination, background, surround)
- Successor to CIECAM02 with better hue uniformity and computational stability
- Powers Google's HCT model (Material Design 3)
- Typed array: Float32Array
- **Best for:** Cross-media color matching, HDR rendering, design systems, HDR imaging, digital photography
- Adjust `J` and `C` for appearance tuning; change `h` to alter perceived hue

## Conversions
- **Derived from:** CIE XYZ + viewing conditions
- **Converts to:** CAM16-UCS, CIE XYZ, HCT
- **Direct conversion targets:** to/from CIECAM02; indirectly to/from CIE Lab
- String output: typically converted to more common color spaces (e.g., CIE Lab or RGB) for display

## Chromatics API
**Class:** `Cam16` **extends** `AppearanceModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `J` | `number` | 0-100 | `color.cam16_J` |
| `C` | `number` | 0-inf | `color.cam16_C` |
| `h` | `number` | 0-360 | `color.cam16_h` |

**Model-specific methods:**
- `withViewingConditions(conditions)` -> re-evaluate appearance under different lighting
- `toHCT()` -> extract HCT (H from CAM16, T from Lab L*)
- `brightness()` -> absolute brightness Q
- `colorfulness()` -> absolute colorfulness M
- `saturation()` -> CAM16 saturation s

**Unique value:** Full color appearance prediction. If you need to know how a color LOOKS in a specific room/lighting.

## Resources
- [CAM16 color appearance model — Wikipedia](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)
- [CAM16 Research (ResearchGate)](https://www.researchgate.net/publication/319139749_CAM16_Color_Appearance_Model)
- [colour-science.org — color appearance models](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CAM16-UCS]], [[CIECAM02]], [[CIE XYZ]]

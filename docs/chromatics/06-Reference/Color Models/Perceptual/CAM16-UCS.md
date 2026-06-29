---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# CAM16-UCS

> A uniform color space derived from CAM16 -- applies compression to make Euclidean distances proportional to perceived color differences.

## Overview
CAM16-UCS is a uniform color space derived from the CAM16 color appearance model that offers improved perceptual uniformity. It applies a compression to CAM16 output so that Euclidean distances correspond to perceived color differences. It is especially useful for computing color differences and making precise color adjustments in advanced imaging workflows.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `J'` | Uniform lightness | 0-100 | Compressed, perceptually uniform lightness |
| `a'` | Red-Green | ~-100 to +100 | Uniform red-green opponent dimension |
| `b'` | Blue-Yellow | ~-100 to +100 | Uniform blue-yellow opponent dimension |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- Improved perceptual uniformity over CAM16 (Euclidean distance ≈ perceived difference)
- Especially useful for computing color differences across viewing conditions
- Typed array: Float32Array
- **Best for:** Color difference evaluation across viewing conditions, professional imaging, color grading
- Adjust `J'` for consistent brightness changes; modify `a'` and `b'` for perceptually uniform color corrections

## Conversions
- **Derived from:** CAM16 (with uniformity compression)
- **Converts to:** CAM16, CIE XYZ
- **Direct conversion targets:** to/from CAM16, CIE Lab, and RGB via appropriate transformation formulas
- String output: typically converted to more common spaces (such as CIE Lab or RGB) for display; direct CSS representation is not available

## Chromatics API
**Class:** `Cam16Ucs` **extends** `LabModel`

**Model-specific methods:**
- `deltaEcam16(other)` -> color difference that accounts for viewing conditions

**Unique value:** Better deltaE than Lab when viewing conditions vary (e.g., comparing screen color to print color under different lighting).

## Resources
- [CAM16 color appearance model — Wikipedia](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)
- [CAM16-UCS Research Article (ResearchGate)](https://www.researchgate.net/publication/317268979_CAM16-UCS)
- [colour-science.org — color appearance models](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CAM16]], [[CIECAM02]], [[CIE XYZ]]

---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# JzCzHz

> The cylindrical form of JzAzBz -- combines HDR-capable perceptual uniformity with intuitive hue/chroma manipulation.

## Overview
JzCzHz is the cylindrical representation of JzAzBz, expressing color with lightness, chroma, and hue components to allow intuitive hue manipulation within a perceptually uniform space. It combines HDR-capable perceptual uniformity with intuitive hue/chroma adjustment, making it well suited to high-luminance palette design and HDR grading.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `Jz` | Lightness | 0-1 | Perceived brightness (HDR-capable) |
| `Cz` | Chroma | 0-inf | Increasing `Cz` enhances color saturation |
| `hz` | Hue angle | 0-360 | Rotating `hz` changes the perceived hue |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- Perceptually uniform cylindrical space with HDR capability inherited from JzAzBz
- Typed array: Float32Array
- **Best for:** HDR color manipulation, high-luminance palette design, HDR grading tools, intuitive hue-based adjustment in a highly uniform space
- Modify `hz` to change the color tone; adjust `Cz` and `Jz` to control vividness and brightness
- String output: converted to RGB for CSS display

## Conversions
- **Derived from:** JzAzBz (polar transform)
- **Converts to:** JzAzBz, CIE XYZ
- **Direct conversion targets:** to/from JzAzBz; indirectly to/from RGB

## Chromatics API
**Class:** `JzCzHz` **extends** `PerceptualCylindricalModel`

**Model-specific methods:**
- `adjustChroma(delta)`, `atLightness(Jz)`
- HDR-capable versions of all cylindrical methods

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`

**Unique value:** HDR palette generation in a perceptually uniform cylindrical space.

## Resources
- [JzAzBz — Wikipedia](https://en.wikipedia.org/wiki/JzAzBz)
- [JzCzHz on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-cz-hz/)
- [colour-science.org — JzAzBz/JzCzHz model](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[JzAzBz]], [[Oklch]], [[CIE XYZ]]

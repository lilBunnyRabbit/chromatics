---
tags: [color-model, perceptual, critical]
status: reference
updated: 2026-06-24
---

# Oklch

> The cylindrical form of Oklab -- the best modern choice for perceptually uniform color manipulation, with CSS native support and excellent hue uniformity.

## Overview
Oklch is the cylindrical representation of Oklab, expressing color in terms of Lightness, Chroma, and Hue for intuitive manipulation within a perceptually uniform space. It is the best modern choice for perceptually uniform color manipulation: it has CSS-native support, excellent hue uniformity, and -- unlike HSL -- preserves chroma during lightness adjustments.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `L` | Lightness | 0-1 | Perceptual lightness; higher `L` yields a brighter color |
| `C` | Chroma | 0-~0.37 | Color intensity/saturation; increasing `C` intensifies the color |
| `h` | Hue angle | 0-360 | Perceptual hue angle; changing `h` rotates within the perceptual spectrum |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- Best perceptual uniformity of any widely-supported cylindrical model
- CSS Color Level 4 support via `oklch()` function
- Preserves chroma during lightness adjustments (unlike HSL)
- Typed array: Float32Array
- **Best for:** Modern CSS colors, design system palettes, accessible color schemes, dynamic theming, advanced photo editing
- Adjust `h` to change the color tone; modify `C` and `L` for vividness and lightness control
- String output: usually converted to RGB for CSS output

## Conversions
- **Derived from:** Oklab (polar transform)
- **Converts to:** Oklab, LMS, CIE XYZ, sRGB
- **Direct conversion targets:** to/from Oklab, CIE XYZ, and RGB

## Chromatics API
**Class:** `Oklch` **extends** `PerceptualCylindricalModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `L` | `number` | 0-1 | `color.ok_l` |
| `C` | `number` | 0-~0.37 | `color.ok_c` |
| `h` | `number` | 0-360 | `color.ok_h` |

**DSL Constructor:** `OKLCH(l, c, h)` -> `Color`

**Model-specific methods:**
- `adjustChroma(delta)` -> perceptually meaningful chroma adjustment
- `gamutMap(space?)` -> CSS Color 4 binary search algorithm (reduce C until in gamut)
- `gamutMapCSS()` -> alias, strictly follows CSS spec
- `isInGamut(space?)` -> boolean
- `isInP3()` -> shortcut for isInGamut('display-p3')
- `maxChroma(space?)` -> max achievable chroma at this L,h in target gamut
- `atLightness(L)` -> same hue/chroma at different lightness
- `atChroma(C)` -> same hue/lightness at different chroma
- `toCSS()` -> `oklch(L C h)` string
- `tintScale(steps)` -> array of lighter variants with even perceptual spacing
- `shadeScale(steps)` -> array of darker variants

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`, `tetradic()`, `splitComplementary()`

**Priority:** Critical -- best modern perceptual cylindrical model, CSS native, default for gamut mapping and palette generation.

## Resources
- [Oklab — Wikipedia](https://en.wikipedia.org/wiki/Oklab)
- [oklch.com — interactive Oklch color picker](https://oklch.com)
- [Oklch on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-oklch/)
- [W3C CSS Color Module Level 4 — oklch()](https://www.w3.org/TR/css-color-4/)
- [Björn Ottosson — Oklab post](https://bottosson.github.io/posts/oklab/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[Oklab]], [[JzCzHz]], [[CIE Lch]], [[CIE XYZ]]

---
tags: [color-model, perceptual, critical]
status: reference
updated: 2026-06-24
---

# Oklab

> A modern perceptual color space (Bjorn Ottosson, 2020) designed to fix CIE Lab's problems -- better uniformity in blues, improved lightness prediction, simpler math.

## Overview
Oklab is a modern perceptual color model proposed by Björn Ottosson in 2020 ("Ottosson's Lab"), designed to be a more accurate perceptual space than CIE Lab specifically for sRGB and similar display environments using modern color-vision data. It has components L (luminance-like lightness), a (green-red axis), and b (blue-yellow axis), named like CIELAB but computed differently for better perceptual uniformity in both color and lightness.

Mathematically, Oklab is derived by converting sRGB to linear XYZ (D65), applying a linear transform to an LMS space (using the XYZ→LMS matrix from the CAT16 chromatic adaptation), applying cube-root-like nonlinearities to each L, M, S channel (yielding L_c, M_c, S_c), then forming:
- L = 0.2103 L_c + 0.7152 M_c + 0.0722 S_c
- a = 0.6613 L_c - 0.5583 M_c - 0.1330 S_c
- b = 0.2123 L_c + 0.0270 M_c - 0.9307 S_c

These coefficients align axes with opponent hues and fit uniformity data (hue linearity and constant-chroma lightness) from CAM16. The result correlates L differences with perceived lightness (better than CIELAB for dark colors) and a,b differences with perceived chroma/hue consistently across hues. It uses D65 (sRGB white) as reference and notably fixes CIELAB's problems with blues. It is essentially an easily implementable approximation of the complex CAM16.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `L` | Lightness | 0-1 (often scaled to 0-100) | Perceptual lightness; 0 = black, 1 = white |
| `a` | Green-Red | ~-0.5 to +0.5 (sRGB gamut approx -0.233 to +0.276) | Green (neg) to red (pos) |
| `b` | Blue-Yellow | ~-0.5 to +0.5 (sRGB gamut approx -0.311 to +0.198) | Blue (neg) to yellow (pos) |
| `alpha` | Opacity | 0-1 | Controls transparency |

Polar form: C (chroma) = √(a²+b²), h (hue) = atan2(b, a), giving Oklch; typical mid-gamut colors have a,b in ±0.1-0.3.

## Characteristics
- More uniform than CIE Lab, especially for blues and dark colors
- More consistent lightness scaling and more constant hue perception than CIELAB
- CSS Color Level 4 support via `oklab()` function
- Default interpolation space for CSS `color-mix()`
- Better gradient interpolation than any older perceptual space (e.g. red→green passes through neutrals without weird shifts)
- Simple math (matrix + nonlinearity); validated by multiple independent implementations
- Device-dependent insofar as it assumes sRGB primaries/D65 (adaptable to other RGB spaces)
- Typed array: Float32Array
- **Best for:** CSS colors, gradient interpolation, gamut mapping, modern color processing, UI theming, palette generation
- Adjust `L` for brightness; modify `a` and `b` for chromaticity

## Conversions
- **Derived from:** LMS (cube root + linear transform)
- **Converts to:** Oklch, LMS, CIE XYZ, sRGB
- **Oklab ↔ sRGB/XYZ (D65):** explicit pipeline — linear transform (matrix) then nonlinearity; inverse cubes the nonlinearity and applies the inverse matrix
- **Oklab ↔ Oklch:** trivial polar coordinate conversion
- **Oklab ↔ CIELAB:** no direct formula; route through XYZ

## Chromatics API
**Class:** `Oklab` **extends** `LabModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `L` | `number` | 0-1 | `color.ok_l` |
| `a` | `number` | ~-0.5 to +0.5 | `color.ok_a` |
| `b` | `number` | ~-0.5 to +0.5 | `color.ok_b` |

**DSL Constructor:** `OKLAB(L, a, b)` -> `Color`

**Model-specific methods:**
- `deltaEok(other)` -> euclidean distance in Oklab (fast, competitive with deltaE2000)
- `mix(other, ratio)` -> perceptually correct blend (the DEFAULT blend space)
- `toCSS()` -> `oklab(L a b)` string

**Internal role:** Default interpolation space (matches CSS `color-mix()` behavior). All `.mix()` calls should blend in Oklab unless overridden.

**Priority:** Critical -- foundation for Oklch, interpolation, CSS compatibility.

## Resources
- [Oklab — Wikipedia](https://en.wikipedia.org/wiki/Oklab)
- [Björn Ottosson — "A perceptual color space for image processing" (2020)](https://bottosson.github.io/posts/oklab/)
- [W3C CSS Color Module Level 4 — oklab()/oklch()](https://www.w3.org/TR/css-color-4/)
- [Oklab on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-oklab/)
- [colour-science.org — Oklab model](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[Oklch]], [[LMS]], [[CIE Lab]], [[CIE XYZ]]

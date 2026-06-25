---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# RG Chromaticity

> A 2D representation that isolates chromaticity from intensity by normalizing RGB: r = R/(R+G+B), g = G/(R+G+B). Blue is implicit.

## Overview
RG chromaticity is a representation of RGB that isolates chromaticity (color information) by normalizing out intensity: r = R/(R+G+B), g = G/(R+G+B), with blue implicit (b = 1 - r - g). By removing intensity it isolates pure color and is invariant to illumination intensity changes, which makes it useful for skin detection and tracking in computer vision.

## Channels

| Channel | Full name | Range | Controls |
| ------- | --------- | ----- | -------- |
| `r` | Red chromaticity | 0-1 | Proportion of red |
| `g` | Green chromaticity | 0-1 | Proportion of green |

## Characteristics
- **Key strengths:** Removes intensity, isolating pure color; invariant to illumination intensity changes; useful for skin detection and tracking in computer vision.
- **Note:** 2D only (no intensity). Cannot reconstruct full color without a known intensity.
- **Best for:** Computer vision, shadow removal, illumination-invariant analysis.

## Conversions
- **Derived from:** RGB normalization.
- **Converts to:** RGB (with known intensity).

## Chromatics API
**Class:** `RGChromaticity` **extends** `ColorModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `r` | `number` | 0-1 | `color.rg_r` |
| `g` | `number` | 0-1 | `color.rg_g` |

**Model-specific methods:**
- `distance(other)` -> euclidean distance in rg space (illumination-invariant color comparison)
- `isSkinLike()` -> heuristic check if chromaticity falls in typical skin region

**Note:** 2D only (no intensity). Cannot reconstruct full color without a known intensity.

## Resources
- [rg chromaticity on Wikipedia](https://en.wikipedia.org/wiki/Rg_chromaticity)
- [Chromaticity on Wikipedia](https://en.wikipedia.org/wiki/Chromaticity)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[RGB]], [[CIE XYZ]].

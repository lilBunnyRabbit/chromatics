---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# JzAzBz

> A perceptually uniform color space (2017) specifically designed for HDR -- handles the full range from starlight to sunlight (0-10,000 cd/m2).

## Overview
JzAzBz is a perceptually uniform color space designed so that Euclidean distances correlate with perceived color differences, making it ideal for precise color difference (ΔE) calculations. It is specifically designed for HDR, handling the full luminance range from starlight to sunlight (0-10,000 cd/m2), and uses the Perceptual Quantizer (PQ) from Rec. 2100. It outperforms CIE Lab for HDR content.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `Jz` | Lightness | 0-1 (or scaled appropriately) | Perceptual lightness (HDR-capable) |
| `Az` | Red-Green | ~-0.5 to +0.5 | Red-green opponent |
| `Bz` | Blue-Yellow | ~-0.5 to +0.5 | Blue-yellow opponent |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- Uses Perceptual Quantizer (PQ) from Rec. 2100
- Euclidean distances correlate with perceived differences across the full luminance range
- Better than CIE Lab for HDR content
- Typed array: Float32Array
- **Best for:** HDR video/imaging, high-luminance color difference, display calibration, advanced image analysis
- Adjust `Jz` to affect lightness; modify `Az` and `Bz` for fine-tuning color nuances
- String output: not directly representable in CSS; conversion to RGB is common

## Conversions
- **Derived from:** CIE XYZ (via PQ + LMS)
- **Converts to:** JzCzHz, CIE XYZ
- **Direct conversion targets:** to/from JzCzHz; indirectly to/from RGB

## Chromatics API
**Class:** `JzAzBz` **extends** `LabModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `Jz` | `number` | 0-1 | `color.jz` |
| `Az` | `number` | ~-0.5 to +0.5 | `color.az` |
| `Bz` | `number` | ~-0.5 to +0.5 | `color.bz` |

**Model-specific methods:**
- `deltaEz(other)` -> HDR-aware color difference
- `mix(other, ratio)` -> HDR-correct perceptual blend

**Unique value:** The only perceptual space designed for HDR (0-10,000 cd/m2). Use for HDR content evaluation.

## Resources
- [JzAzBz — Wikipedia](https://en.wikipedia.org/wiki/JzAzBz)
- [JzAzBz on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-az-bz/)
- [colour-science.org — JzAzBz model](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[JzCzHz]], [[LMS]], [[CIE XYZ]]

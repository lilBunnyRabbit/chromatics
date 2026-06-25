---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# YUV

> The foundational luma + chroma model for analog video -- separates brightness (Y) from color (U, V), enabling backward-compatible color TV over B&W infrastructure.

## Overview
YUV is a traditional color model used in both analog and digital video that separates luminance (Y) from chrominance (U and V). Used in analog television and some digital video formats, it was historically important for backward compatibility with black-and-white TV: a B&W set reads only the Y signal while color sets add the U and V chroma. It is commonly used in European color television broadcasting and remains relevant in some digital video processing contexts. Like YCbCr, it is used in video systems to separate luminance from chrominance.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `Y` | Luma (luminance) | 0-1 | Brightness |
| `U` | Blue-difference chrominance | ~-0.436 to +0.436 | Blue chroma |
| `V` | Red-difference chrominance | ~-0.615 to +0.615 | Red chroma |
| `alpha` | Opacity | 0-1 | Transparency |

## Characteristics
- Separates brightness from color information; basis of all luma-chroma models.
- Backward-compatible with black-and-white TV infrastructure.
- Typed array: Float32Array.
- Color tuning: adjust `U` and `V` for fine chroma adjustments while `Y` controls brightness.
- CSS/string: typically converted to RGB for web display.
- Best for: analog video processing, understanding the basis of all luma-chroma models.

## Conversions
- **Derived from:** RGB (via BT.601 or BT.709 weights).
- **Converts to:** RGB, YCbCr, YIQ.
- **Direct conversion targets:** to/from RGB and similar YCbCr systems.

## Chromatics API
**Class:** `YUV` **extends** `VideoModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `y` | `number` | 0-1 | `color.yuv_y` |
| `u` | `number` | ~-0.436 to +0.436 | `color.yuv_u` |
| `v` | `number` | ~-0.615 to +0.615 | `color.yuv_v` |

**VideoModel shared methods:**
- `toLumaOnly()` -> drop chroma, grayscale based on luma weights
- `chromaScale(factor)` -> scale U,V by factor (0 = grayscale, 2 = oversaturated)

## Resources
- [YUV - Wikipedia](https://en.wikipedia.org/wiki/YUV)
- [BlackIce: YUV Colorspace](https://www.blackice.com/colorspaceYUV.htm)
- [Bruce Lindbloom - color math reference](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YCbCr]], [[YIQ]], [[YDbDr]]

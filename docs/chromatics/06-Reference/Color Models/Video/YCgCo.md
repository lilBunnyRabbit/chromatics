---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# YCgCo

> A video color model optimized for efficient integer computation -- only additions and bit-shifts needed, better decorrelation than YCbCr for natural images.

## Overview
YCgCo is a color model used in video compression and computer graphics that decomposes color into luminance (Y) and two chrominance components representing green-difference (Cg) and an orange-blue difference (Co). It provides an efficient transform for color compression, useful in scenarios involving video compression or GPU-based graphics where efficient separation of luminance and chroma is beneficial.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `Y` | Luminance | 0-1 (normalized) | Overall brightness |
| `Cg` | Green-difference chroma | ~-0.5 to 0.5 | Green-magenta balance |
| `Co` | Orange-blue chroma | ~-0.5 to 0.5 | Red-blue balance |
| `alpha` | Opacity | 0-1 | Transparency |

## Characteristics
- No multiplications needed (only add/subtract/shift).
- Better decorrelation than YCbCr.
- Used in H.264/AVC and H.265/HEVC.
- Typed array: Float32Array (to handle fractional and negative values).
- Chroma adjustments: modify `Cg` and `Co` to fine-tune color balance; adjust `Y` for overall brightness.
- CSS/string: typically converted to RGB for final display.
- Best for: low-latency video codecs, lossless compression, embedded systems.

## Conversions
- **Derived from:** RGB (add/subtract transform).
- **Converts to:** RGB, YCoCg-R.
- **Direct conversion targets:** to/from RGB and other chroma-luminance formats.

## Chromatics API
**Class:** `YCgCo` **extends** `VideoModel`

**Model-specific methods:**
- `toReversible()` -> convert to YCoCg-R (lossless variant)

**Unique value:** Integer-only transform (add/subtract/shift). Good for embedded/low-latency paths.

## Resources
- [YCgCo - Wikipedia](https://en.wikipedia.org/wiki/YCgCo)
- [YCoCg - Wikipedia](https://en.wikipedia.org/wiki/YCoCg)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YCoCg-R]], [[YCbCr]]

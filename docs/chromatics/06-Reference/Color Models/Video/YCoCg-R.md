---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# YCoCg-R

> A bit-exact reversible variant of YCgCo -- enables lossless integer color transforms with no rounding error, used in H.264/H.265 lossless modes and screen content coding.

## Overview
YCoCg-R is a reversible/lossless variant of YCgCo used in video codecs for bit-exact integer color transforms. Standard YCgCo is lossy due to rounding; YCoCg-R adds lifting steps that make it perfectly reversible, guaranteeing a perfect RGB -> YCoCg-R -> RGB round-trip with zero loss.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `Y` | Luma | varies | Brightness |
| `Co` | Chrominance orange | varies | Orange vs blue difference |
| `Cg` | Chrominance green | varies | Green vs magenta difference |

## Characteristics
- Bit-exact reversible: perfect round-trip RGB -> YCoCg-R -> RGB with zero loss.
- Only additions, subtractions, and bit-shifts (no multiplications).
- Used in H.264/AVC and H.265/HEVC for lossless and near-lossless modes.
- Better energy compaction than reversible YCbCr (RCT) from JPEG 2000.
- vs YCgCo: standard YCgCo is lossy due to rounding; YCoCg-R adds lifting steps that make it perfectly reversible.
- Best for: lossless video compression, screen content coding, lossless image formats.

## Conversions
- **Derived from:** YCgCo (made reversible via lifting steps).
- **Converts to:** RGB (lossless), YCgCo.

## Chromatics API
**Class:** `YCoCgR` **extends** `VideoModel`

**Model-specific methods:**
- `toLosslessRgb()` -> bit-exact round-trip back to integer RGB

**Unique value:** ONLY video model that guarantees perfect lossless round-trip for integer RGB.

## Resources
- [YCoCg - Wikipedia](https://en.wikipedia.org/wiki/YCoCg)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YCgCo]], [[YCbCr]]

---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# YIQ

> The NTSC television color model -- separates luma (Y) from in-phase (I) and quadrature (Q) chrominance, optimized for North American analog broadcast.

## Overview
YIQ is the color model used in the NTSC television system, separating luminance (Y) from two chrominance components (I and Q) to efficiently encode color information for analog broadcasting. It is primarily used in NTSC broadcasting for analog TV systems and is backward compatible with black-and-white TV.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `Y` | Luma (luminance) | Varies | Brightness |
| `I` | In-phase (orange-cyan) | Varies | Shifts color balance toward orange/cyan |
| `Q` | Quadrature (purple-green) | Varies | Shifts color balance toward purple/green |
| `alpha` | Opacity | 0-1 | Transparency |

## Characteristics
- I axis aligned with the eye's highest chroma sensitivity.
- Backward compatible with B&W TV.
- Typed array: Float32Array.
- Color balancing: adjust `I` and `Q` to fine-tune chrominance while `Y` sets brightness.
- CSS/string: not directly used in CSS; conversion to RGB is required for display.
- Best for: legacy NTSC compatibility, historical video processing.

## Conversions
- **Derived from:** YUV (33-degree rotation).
- **Converts to:** RGB, YUV.
- **Direct conversion targets:** to/from RGB and indirectly to other broadcast standards.

## Chromatics API
**Class:** `YIQ` **extends** `VideoModel`

**Note:** NTSC legacy. I axis aligned with eye's highest chroma sensitivity. Include for NTSC archival conversion.

## Resources
- [YIQ - Wikipedia](https://en.wikipedia.org/wiki/YIQ)
- [BlackIce: YIQ Colorspace](https://www.blackice.com/colorspaceYIQ.htm)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YUV]], [[YCbCr]]

---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# YCbCr

> The digital version of YUV -- the dominant color encoding for digital video compression (JPEG, MPEG, H.264/265), separating luma from chroma for efficient compression.

## Overview
YCbCr is a widely used color model in digital video that separates luminance (Y) from chrominance (Cb and Cr), facilitating efficient compression and transmission. It is essential for digital video compression, broadcasting, and camera imaging systems. By separating image luminance from color information, it suits television standards and video compression algorithms, and is useful for tasks like color keying (green screen effects), noise reduction, and color grading where maintaining brightness while adjusting color is crucial.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `Y` | Luma (luminance) | 16-235 (8-bit) | Brightness |
| `Cb` | Chroma blue (blue-difference) | 16-240 | Blue chrominance (difference from reference) |
| `Cr` | Chroma red (red-difference) | 16-240 | Red chrominance (difference from reference) |
| `alpha` | Opacity | 0-1 | Transparency |

## Characteristics
- Enables chroma subsampling (4:2:0, 4:2:2) for massive compression.
- Used by JPEG, H.264, H.265, VP9, AV1, and virtually all codecs.
- Typed array: Float32Array (provides flexibility for various scaling conventions).
- Chroma correction: tweak `Cb` and `Cr` to balance colors while using `Y` for brightness control.
- CSS/string: generally converted to RGB for display.
- Best for: video compression, JPEG, digital broadcast.

## Conversions
- **Derived from:** RGB (via Rec. 601 or 709 matrices).
- **Converts to:** RGB, YPbPr, YUV.
- **Direct conversion targets:** to/from RGB, YPbPr, and component video formats.

## Chromatics API
**Class:** `YCbCr` **extends** `VideoModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `y` | `number` | 16-235 (8-bit) | `color.ycbcr_y` |
| `cb` | `number` | 16-240 | `color.ycbcr_cb` |
| `cr` | `number` | 16-240 | `color.ycbcr_cr` |

**Model-specific methods:**
- `chromaSubsample(mode)` -> simulate 4:2:0, 4:2:2, 4:4:4 subsampling
- `toLumaOnly()` -> drop chroma
- `withWeights(standard)` -> Rec.601 or Rec.709 luma weights

## Resources
- [YCbCr - Wikipedia](https://en.wikipedia.org/wiki/YCbCr)
- [PAL - Wikipedia](https://en.wikipedia.org/wiki/PAL)
- [Microsemi UG0639: Color Space Conversion User Guide](https://www.microsemi.com/document-portal/doc_view/135317-ug0639-color-space-conversion-user-guide)
- [Microsoft MS-RDPRFX: RGB to YCbCr conversion](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdprfx/2e1618ed-60d6-4a64-aa5d-0608884861bb)
- [Microsoft MS-RDPRFX: YCbCr to RGB conversion](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdprfx/b550d1b5-f7d9-4a0c-9141-b3dca9d7f525)
- [Bruce Lindbloom - color math reference](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YUV]], [[YPbPr]], [[ICtCp]]

---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# sYCC

> An extended YCbCr encoding (IEC 61966-2-1 Amd.1) that allows sRGB values outside 0–1, capturing colors beyond the sRGB gamut.

## Overview
sYCC is an extended YCbCr encoding defined in IEC 61966-2-1 Amendment 1. It permits sRGB values outside the 0–1 range (negative and greater than 1), capturing colors beyond the standard sRGB gamut. Used in digital camera systems, it balances strict sRGB reproduction against extended color representation, offering additional flexibility in color saturation and reproduction during video/image capture.

## Channels
| Channel | Full name | Range | Controls |
| --- | --- | --- | --- |
| `Y` | Luminance component | Varies | Overall brightness |
| `Cb` | Chrominance (blue-difference) | Varies | Blue color deviation |
| `Cr` | Chrominance (red-difference) | Varies | Red color deviation |
| `alpha` | Opacity | 0–1 | Transparency |

## Characteristics
- Extends sRGB in YCbCr form; allows negative and >1 sRGB values.
- **Typed Array:** Float32Array.
- **Usage:** Digital imaging pipelines balancing strict sRGB reproduction against the need for more flexible color saturation.
- **Modifications:** Color fine-tuning — adjust `Cb` and `Cr` for chroma correction while controlling brightness with `Y`.
- **CSS / String:** Typically converted to RGB for web display.
- **Best for:** Extended-gamut image capture, JPEG 2000, digital cameras.

## Conversions
- **Derived from:** sRGB (extended) + YCbCr encoding.
- **Converts to:** sRGB, YCbCr.
- **Direct conversion targets:** To/from RGB and other YCbCr-based models.

## Chromatics API
**Class:** `SYCC` **extends** `VideoModel`

**Note:** Extended sRGB in YCbCr form. Allows negative and >1 sRGB values. Niche — include for JPEG 2000 compatibility.

## Resources
- [sYCC — Wikipedia](https://en.wikipedia.org/wiki/SYCC)
- [IEC 61966-2-1 (sRGB / sYCC) — IEC Webstore](https://webstore.iec.ch/publication/6169)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YCbCr]], [[xvYCC]], [[sRGB]].

---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# YJK

> A color model used by the MSX2+ computer (1988) — 4 pixels share J,K chrominance with individual Y luma for efficient 8-bit hardware color.

## Overview
YJK is a color model/standard introduced with the MSX2+ computer (1988) and used in certain older analog video systems, particularly Japanese computers. It belongs to the broader YUV family. To fit 8-bit hardware constraints, four adjacent pixels share a common pair of chrominance values (J, K) while each pixel keeps its own luma (Y), giving efficient color at low memory cost.

## Characteristics
- Hardware-specific to the MSX2+ (1988).
- Member of the YUV family of luma + chroma color models.
- Bandwidth optimization: 4 pixels share J,K chrominance; individual Y luma per pixel.
- **Best for:** Retro computing, MSX2+ development, historical reference.

## Conversions
- **Derived from:** RGB (hardware-specific).
- **Converts to:** RGB.

## Chromatics API
**Note:** MSX2+ hardware-specific. Include as conversion target only. No unique API methods.

## Resources
- [YJK — Wikipedia](https://en.wikipedia.org/wiki/YJK)
- [MSX video display processor — Wikipedia](https://en.wikipedia.org/wiki/Yamaha_V9958)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YUV]], [[RGB]], [[SECAM]].

---
tags: [color-model, other]
status: reference
updated: 2026-06-24
---

# XYB

> JPEG XL's perceptual color transform -- a modified LMS space with an asymmetric blue channel (X=L-M, Y=(L+M)/2, B=S-Y) optimized for image compression.

## Overview
XYB is JPEG XL's internal perceptual color transform, based on LMS cone responses with optimizations for image compression. It is a modified LMS space defined by X = L-M, Y = (L+M)/2, and B = S-Y, with an asymmetric blue channel.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `X`     | X (L-M difference) | varies | Red-green opponent signal |
| `Y`     | Y (L+M average) | varies | Luma / brightness |
| `B`     | B (S-Y difference) | varies | Blue-yellow opponent signal (asymmetric) |

## Characteristics
- **Key strengths:**
  - Designed specifically for efficient lossy image compression.
  - Better decorrelation of natural images than YCbCr.
  - Asymmetric blue channel exploits lower human sensitivity to blue noise.
  - Used in JPEG XL (the next-generation image format).
  - Perceptual quantization built into the transform.
- **Best for:** Image compression (JPEG XL), perceptual coding, next-generation image formats.

## Conversions
- **Derived from:** LMS cone responses (modified).
- **Converts to:** LMS, CIE XYZ, sRGB.

## Chromatics API
**Note:** JPEG XL internal transform. Not useful as a user-facing color model. Include as conversion target only for JPEG XL integration.

## Resources
- [Wikipedia: JPEG XL](https://en.wikipedia.org/wiki/JPEG_XL)
- [JPEG XL white paper (jpeg.org)](https://jpeg.org/jpegxl/)
- [libjxl -- reference implementation](https://github.com/libjxl/libjxl)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[LMS]], [[CIE XYZ]], [[YCbCr]].

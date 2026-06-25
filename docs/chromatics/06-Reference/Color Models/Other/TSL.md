---
tags: [color-model, other]
status: reference
updated: 2026-06-24
---

# TSL

> Tint-Saturation-Lightness -- a modified cylindrical model designed for skin color detection, where the tint angle is computed from normalized chromaticity.

## Overview
TSL (Tint-Saturation-Lightness) is a modified cylindrical color model designed for skin color detection, where the tint angle is computed from normalized chromaticity. It is similar to HSL but emphasizes a "tint" parameter as an alternative to traditional hue, offering a different approach to color representation. It is used in some niche applications, particularly face detection and skin segmentation.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `t`     | Tint (a variant of hue) | 0-360 | Changing `t` rotates the perceived color tone / hue. |
| `s`     | Saturation (color intensity / purity) | 0-1 | 0 yields gray; 1 gives full saturation. |
| `l`     | Lightness (brightness) | 0-1 | 0 is black, 1 is white; intermediate values mix the tone. |
| `alpha` | Opacity | 0-1 | Controls transparency. |

## Characteristics
- **Key strengths:**
  - Tint component clusters skin colors more tightly than HSL/HSV hue.
  - Designed specifically for face detection and skin segmentation.
- **Typed array:** Float32Array.
- **Best for:** Skin color detection, face tracking, computer vision.
- **Usage:** Niche applications where a tint-based model is preferred over traditional hue-based models.
- **Modifications:** Tint rotation (adjust `t` to change the base color tone); saturation & lightness (modify `s` and `l` to affect color intensity and brightness).
- **CSS / string:** Not directly supported in CSS; typically converted to HSL or RGB for display.

## Conversions
- **Derived from:** Normalized rg chromaticity.
- **Converts to:** RGB.
- **Direct conversion targets:** To/from HSL and RGB.

## Chromatics API
**Class:** `TSL` **extends** `ColorModel`

**Model-specific methods:**
- `isSkinLike()` -> heuristic skin detection based on T value clustering

**Unique value:** Tint component clusters skin tones tighter than HSL hue. Niche but useful for face detection.

## Resources
- [Wikipedia: TSL color space](https://en.wikipedia.org/wiki/TSL_color_space)
- [Terrillon & Akamatsu -- Comparative Performance of Skin Chrominance Models (TSL)](https://ieeexplore.ieee.org/document/840620)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[HSL]], [[HSV]], [[RG Chromaticity]].

---
tags: [color-model, other]
status: reference
updated: 2026-06-24
---

# iCAM

> An image-based Color Appearance Model that processes entire images rather than individual colors -- accounts for spatial context, local adaptation, and surround effects.

## Overview
iCAM is a color appearance model designed for advanced imaging applications, incorporating complex adaptations to viewing conditions. Unlike pixel-by-pixel CAMs, it processes entire images, accounting for spatial context, local adaptation, and surround effects.

## Characteristics
- **Key strengths:**
  - Models spatial effects (simultaneous contrast, local adaptation).
  - Better predictions for complex images than pixel-by-pixel CAMs.
- **vs CAM16/CIECAM02:** Those process individual colors; iCAM processes entire image context.
- **Best for:** HDR rendering, tone mapping, image quality assessment.

## Conversions
- **Derived from:** CIE XYZ + spatial analysis.
- **Converts to:** CIE XYZ (per-pixel).

## Chromatics API
**Note:** Image-level model (processes entire images, not single colors). Out of scope for the per-color API. Could be a separate utility: `iCAM.process(imageData, viewingConditions)`.

## Resources
- [Wikipedia: iCAM (color appearance model)](https://en.wikipedia.org/wiki/ICAM_(color_appearance_model))
- [Fairchild & Johnson -- The iCAM framework for image appearance](https://www.rit-mcsl.org/fairchild/PDFs/PRO19.pdf)
- [Mark Fairchild, Color Appearance Models (book)](https://onlinelibrary.wiley.com/doi/book/10.1002/9781118653128)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE XYZ]], [[CIECAM02]], [[CAM16]].

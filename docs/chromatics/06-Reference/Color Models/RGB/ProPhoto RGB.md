---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# ProPhoto RGB

> An extremely wide-gamut RGB space (also called ROMM RGB) covering ~90% of CIE Lab visible colors, designed for archival photography -- includes colors outside human vision.

## Overview
ProPhoto RGB (also known as ROMM RGB) is an extremely wide-gamut RGB color space developed by Kodak, covering roughly 90% of CIE Lab visible colors — a larger gamut than Adobe RGB. It is designed for archival photography and advanced image editing, preserving maximum color information from RAW camera sensor data. It is especially suited to editing RAW images from cameras before converting them to a more standard color space for distribution. A notable caution: about 13% of the ProPhoto RGB gamut is imaginary — i.e., outside human vision.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `r` | Red | 0–255 or 0–1 | Red intensity, very wide gamut |
| `g` | Green | 0–255 or 0–1 | Green intensity, very wide gamut |
| `b` | Blue | 0–255 or 0–1 | Blue intensity, very wide gamut |
| `alpha` | Opacity | 0–1 | Controls transparency |

## Characteristics
- **Key strengths:** widest practical RGB gamut (~90% of visible colors); preserves maximum color information from RAW camera sensors; developed by Kodak for archival workflows.
- **Caution:** ~13% of ProPhoto RGB is imaginary (outside human vision).
- **Primaries:** R(0.7347, 0.2653), G(0.1596, 0.8404), B(0.0366, 0.0001) | **White point:** D50.
- **Typed array:** `Uint8ClampedArray`.
- **CSS representations:** converted to sRGB for standard display (CSS does not support ProPhoto RGB directly).
- **Common manipulations:** high-fidelity color editing (fine control over channel values to preserve detail in extreme highlights and shadows across an extremely wide gamut).
- **Best for:** RAW photo editing, archival storage, maximum color preservation.

## Conversions
**Direct conversion targets:** sRGB, RGB255, and through ICC profiles to perceptual spaces like CIE Lab.

## Chromatics API
**Class:** `ProPhotoRgb` **extends** `RGBModel`

**Model-specific methods:**
- `isInSrgb()`, `isInP3()` -> gamut checks
- `hasImaginaryColors()` -> true if color is outside human vision
- `gamutMapTo(space)` -> safe conversion to narrower gamut

**Unique value:** Widest practical gamut. Import from Lightroom/Capture One RAW editing. Warning: ~13% of gamut is imaginary.

## Resources
- [Wikipedia: ProPhoto RGB](https://en.wikipedia.org/wiki/ProPhoto_RGB)
- [Colormath: ROMM RGB / ProPhoto RGB API](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-r-o-m-m_-r-g-b.html)
- [Bruce Lindbloom — RGB working space data](http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[Adobe RGB]], [[sRGB]], [[CIE XYZ]], [[CIE Lab]].

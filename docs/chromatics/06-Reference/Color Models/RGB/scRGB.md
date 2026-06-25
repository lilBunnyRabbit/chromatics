---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# scRGB

> Extended sRGB (IEC 61966-2-2) -- allows values below 0 and above 1 to represent colors outside the sRGB gamut, used in Windows HDR and DirectX rendering pipelines.

## Overview
scRGB is an extended version of sRGB defined by IEC 61966-2-2. It uses the same primaries and white point as sRGB but allows values outside the 0–1 range to represent a much wider gamut and dynamic range. Negative values represent out-of-sRGB-gamut colors, while values greater than 1 represent HDR brightness levels. It is native to Windows color management (WCS) and DirectX, and uses a linear encoding (no gamma) so that color arithmetic remains correct.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `r` | Red | −0.5 to +7.5 (or wider) | Red intensity (linear, extended range) |
| `g` | Green | −0.5 to +7.5 | Green intensity (linear, extended range) |
| `b` | Blue | −0.5 to +7.5 | Blue intensity (linear, extended range) |

## Characteristics
- **Key strengths:** same primaries and white point as sRGB, just with extended range; negative values represent out-of-sRGB-gamut colors; values > 1 represent HDR brightness levels; native in Windows color management (WCS) and DirectX; linear encoding (no gamma) for correct arithmetic.
- **Primaries:** same as sRGB | **White point:** D65 | **Encoding:** linear (no gamma).
- **Common manipulations:** HDR compositing (color operations in an extended range covering HDR luminance levels); wide-gamut work (use negative values to represent colors outside the sRGB gamut).
- **Best for:** HDR rendering on Windows, wide-gamut compositing, GPU pipelines, scene-referred color.

## Conversions
**Converts to:** sRGB (clamp to 0–1 + apply gamma), CIE XYZ (same matrix as Linear sRGB).

## Chromatics API
**Class:** `ScRgb` **extends** `RGBModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `r` | `number` | −0.5 to 7.5+ | `color.scrgb_r` |
| `g` | `number` | −0.5 to 7.5+ | `color.scrgb_g` |
| `b` | `number` | −0.5 to 7.5+ | `color.scrgb_b` |

**Model-specific methods:**
- `isInSrgb()` -> all channels in [0,1]?
- `clampToSrgb()` -> clamp channels to [0,1]
- `toSrgb()` -> gamut map to sRGB (apply gamma)
- `hdrLevel()` -> max channel value (indicates HDR brightness)

**Unique value:** HDR and wide-gamut in sRGB's primary framework. Negative values = out-of-sRGB-gamut colors.

## Resources
- [Wikipedia: scRGB](https://en.wikipedia.org/wiki/ScRGB)
- [Microsoft — scRGB / advanced color on Windows](https://learn.microsoft.com/en-us/windows/win32/direct3darticles/high-dynamic-range)
- [Bruce Lindbloom — RGB working space math](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[sRGB]], [[Linear sRGB]], [[RGB]], [[CIE XYZ]].

---
tags: [color-model, perceptual, critical]
status: reference
updated: 2026-06-24
---

# CIE XYZ

> The foundational color space of modern colorimetry (CIE 1931) — derived from human color matching experiments, it serves as the universal interchange hub between all other color spaces.

## Overview
CIE XYZ is a fundamental, device-independent color model developed by the CIE in 1931, the first quantitative, linkable model of human color perception based on experimental color-matching functions. It is a linear color space with three parameters X, Y, Z — fictitious primaries (they do not correspond to real colors) constructed to simplify calculations and to keep all visible colors at positive coordinates. The values come from integrating spectral power distributions against the three color-matching functions x̄(λ), ȳ(λ), z̄(λ) derived from human observer experiments. By design Y is proportional to luminance (it matches the photopic luminous-efficiency function), so X and Z together with Y define chromaticity. XYZ is more a reference space than a practical color-picking model: it is the root from which Lab, Luv, and many others are derived, and the hub through which virtually all color space conversions pass. It is not perceptually uniform (distances do not equal perceived differences) but it is linear in color mixing (adding/scaling XYZ corresponds to physically adding lights). Scaling varies — Y is often normalized to 1.0 (or 100) for reference white.

The XYZ model has multiple color spaces defined relative to a white point; the default white point is D65 (though ICC PCS uses D50-normalized XYZ or Lab). It is commonly used as a profile connection space when converting between other models.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `X` | X tristimulus | 0-~0.95 (0–∞ / normalized) | Mix of cone responses, roughly red; influences red-green balance |
| `Y` | Y tristimulus | 0-1 (0–∞; 0–100 if percentage) | Luminance (perceived brightness) |
| `Z` | Z tristimulus | 0-~1.09 (0–∞) | Roughly correlates with blue (S-cone response); influences blue-yellow balance |
| `alpha` | Opacity | 0–1 | Controls transparency |

Notes: X is a weighted sum roughly mixing L (red) and M (green) cone responses (not any single cone); Z is weighted toward the S (blue) cone range; Y is the luminance. For D65 white in one normalization: X ≈ 0.950, Y = 1.000, Z ≈ 1.089. Because the axes are not independent perceptual dimensions, adjustments interact; chromaticity is x = X/(X+Y+Z), y = Y/(X+Y+Z), z = 1−x−y.

## Characteristics
- Y channel IS luminance
- Device-independent absolute reference; comprehensive gamut (can describe any visible color)
- Hub for virtually all color space conversions
- Linear and additive (useful for computational mixing of spectra)
- Used to specify standard illuminants/reference whites and to define other spaces (sRGB, Lab, etc.)
- Foundation/start for color appearance models (e.g. CIECAM02)
- **Typed Array:** Float32Array
- **Best for:** Color space conversions, colorimetric calculations, illuminant specification, device-independent color management
- **CSS / String:** no native CSS representation; typically converted to RGB

## Conversions
- **Converts to:** Every color space via defined transforms
- **XYZ ↔ RGB:** each RGB space (sRGB, Adobe RGB…) has a defined 3×3 linear matrix (after gamma linearization) both ways
- **XYZ ↔ xyY:** x=X/(X+Y+Z), y=Y/(X+Y+Z), Y carried; inverse X=(x/y)·Y, Z=(1−x−y)/y·Y
- **XYZ ↔ CIELAB / CIELUV:** one-step nonlinear analytic formulas (with conditionals)
- **XYZ ↔ LMS:** direct linear transform (e.g. Hunt-Pointer-Estevez matrix)
- **XYZ ↔ IPT / Oklab:** defined matrix + nonlinear transforms from XYZ (or linear RGB)
- **Direct conversion targets (legacy note):** To/from CIE Lab, LCHab, and RGB

## Chromatics API
**Class:** `CieXyz` **extends** `ColorModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `x` | `number` | 0-~0.95 | `color.xyz_x` |
| `y` | `number` | 0-1 | `color.xyz_y` |
| `z` | `number` | 0-~1.09 | `color.xyz_z` |

**Model-specific methods:**
- `adaptTo(illuminant, method?)` -> chromatic adaptation (Bradford/CAT16)
- `chromaticity()` -> returns CIE xyY
- `luminance` -> Y channel (physical luminance)
- `dominantWavelength()` -> approximate dominant wavelength in nm
- `isInVisibleGamut()` -> is this a real color?

**Internal role:** Universal conversion hub. All models convert through XYZ.

**Priority:** Critical — architectural backbone of the conversion pipeline.

## Resources
- [Wikipedia: CIE 1931 color space](https://en.wikipedia.org/wiki/CIE_1931_color_space)
- [Colormath: XYZ color spaces](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-x-y-z-color-spaces/)
- [EasyRGB: color math](https://www.easyrgb.com/en/math.php#text2)
- [Bruce Lindbloom: XYZ ↔ RGB matrices](http://www.brucelindbloom.com/)
- [Observable: Lab and RGB (Mike Bostock)](https://observablehq.com/@mbostock/lab-and-rgb)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE xyY]], [[CIE Lab]], [[CIE Luv]], [[CIE 1960 UCS]].

---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# CIE Lch

> The cylindrical form of CIE Lab — same perceptual uniformity but expressed as Lightness, Chroma, and Hue for more intuitive manipulation.

## Overview
CIE LCh is not a new color space but a cylindrical (polar) representation of CIELAB (or, less commonly, CIELUV), expressing color as L* (lightness), C* (chroma), and h° (hue angle). It is derived by converting the (a*, b*) coordinates to polar form: C* = √(a*² + b*²) and h° = arctan2(b*, a*), commonly denoted L*C*_ab h_ab (or L*C*_uv h_uv when based on Luv). Most often "LCH" refers to the Lab-based form, widely used in design and CSS Color 4 (`lch()`). It retains the perceptual uniformity of Lab while making manipulation more intuitive, explicitly separating hue, chroma, and lightness (like HSL but on a perceptually uniform base). It is therefore better for palette design than rectangular Lab. A given change in C* or h corresponds more closely to a uniform perceptual change than the same change in S would in HSL. Because Lab itself is not perfectly uniform, some high-chroma hue rotations remain non-uniform, and not all LCH coordinates map to real colors (if C* is too large for a given L* the color is out of gamut — common for blues beyond sRGB). One must specify whether LCH_ab or LCH_uv is meant; in design contexts LCH_ab is the default. LCHab and LCHuv share conceptually similar parameters but differ numerically for the same color.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `L*` | Lightness | 0-100 | Perceived lightness (0=black, 100=reference white) |
| `C*` | Chroma | 0-~130 (theoretically 0–∞) | Color intensity / colorfulness relative to brightness |
| `h` | Hue angle | 0-360 | Hue family on the color wheel |
| `alpha` | Opacity | 0–1 | Controls transparency |

Hue reference (LCH_ab): 0° = red (+a*), 90° = yellow (+b*), 180° = green (−a*), 270° = blue (−b*); ~210° toward cyan. At C* near 0 the hue h becomes meaningless (like hue of a gray in HSV). C*=0 is gray at that L*.

## Characteristics
- CSS Color Level 4 support via the `lch()` function
- Better for palette design than rectangular Lab
- Hue/chroma/lightness separation aids accessibility (chroma contrast) and harmonious schemes
- Smooth gradients via LCH interpolation (avoids muddy mid colors of RGB interpolation)
- Different hues reach different maximum chroma for real colors (green can be very high chroma; blue ~270° is more limited)
- HSLuv is essentially LCH_uv reparameterized to 0–100 scales
- **Typed Array:** Float32Array
- **Best for:** CSS `lch()`, perceptually uniform color manipulation, palette and gradient design

## Conversions
- **Derived from:** CIE Lab (C=√(a²+b²), h=atan2(b,a)) — direct and lossless
- **Converts to:** CIE Lab (a*=C·cos(h), b*=C·sin(h)), CIE XYZ, RGB
- **Direct conversion targets:** To/from CIE Lab, CIE XYZ, and RGB
- LCH ↔ RGB routes through Lab and XYZ (LCH→Lab→XYZ→RGB); LCH ↔ HSL/HSV is not direct

## Chromatics API
**Class:** `CieLch` **extends** `PerceptualCylindricalModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `L` | `number` | 0-100 | `color.lch_l` |
| `C` | `number` | 0-~130 | `color.lch_c` |
| `h` | `number` | 0-360 | `color.lch_h` |

**DSL Constructor:** `LCH(L, C, h)` -> `Color`

**Model-specific methods:**
- `adjustChroma(delta)`, `atLightness(L)`, `maxChroma()`, `isInGamut()`, `gamutMap()`
- `toCSS()` -> `lch(L C h)` string

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`

**Note:** Shares implementation with HCL (same math, different argument order).

## Resources
- [Wikipedia: CIELCh_ab](https://en.wikipedia.org/wiki/CIELCh_ab)
- [Colormath: LCHab](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab/)
- [Smashing Magazine: A Guide To Modern CSS Colors (RGB, HSL, HWB, Lab, LCH)](https://www.smashingmagazine.com/2021/11/guide-modern-css-colors/)
- [W3C CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/)
- [MDN: hsl() / CSS color values](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE Lab]], [[LCHab]], [[LCHuv]], [[CIE Luv]].

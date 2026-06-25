---
tags: [color-model, hue, critical]
status: reference
updated: 2026-06-24
---

# HCT

> Google's color model for Material Design 3, combining CAM16's hue and chroma with CIE Lab's lightness (called "Tone") for perceptually accurate dynamic theming.

## Overview
HCT (Hue–Chroma–Tone) represents colors using Hue, Chroma, and Tone. Developed for modern design (e.g., Material You), it combines CAM16's hue and chroma with CIE Lab's lightness (called "Tone"). It is designed for dynamic theming and modern design systems by emphasizing perceptual uniformity with an intuitive focus on tone (brightness) alongside hue and chroma (intensity). It powers Material You's automatic theme generation from a seed color.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `H` | Hue | 0-360 | Base color from CAM16's hue circle; rotating `h` changes the base color and base tone |
| `C` | Chroma | 0-~120 (variable) | Color intensity (CAM16-based); higher = vivid, lower = muted |
| `T` | Tone | 0-100 | Perceived lightness (equivalent to CIE Lab L*); lower = darker, higher = brighter |

## Characteristics
- Designed specifically for design systems and dynamic theming
- Tone is truly perceptually uniform across all hues
- Powers Material You's automatic theme generation from a seed color
- **Typed Array:** Float32Array (chosen for handling fractional values and non-integer ranges)
- **CSS / string:** Generally converted to HSL or RGB for CSS output; a custom `hct()` string format may be provided for debugging
- **Best for:** Design systems, dynamic theming, Material You, accessible contrast ratios

## Conversions
- **Derived from:** CAM16 (hue, chroma) + CIE Lab (L* as Tone)
- **Converts to:** sRGB, CAM16, CIE Lab
- **Direct conversion targets:** To/from HSL, RGB, and other perceptual models

## Chromatics API
**Class:** `HCT` **extends** `PerceptualCylindricalModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `h` | `number` | 0-360 | `color.hct_h` |
| `c` | `number` | 0-~120 | `color.hct_c` |
| `t` | `number` | 0-100 | `color.hct_t` |

**DSL Constructor:** `HCT(h, c, t)` -> `Color`

**Model-specific methods (unique to HCT):**
- `tonalPalette(tones?)` -> array of Colors at tones [0,10,20,...,95,99,100]
- `atTone(t)` -> same hue, max chroma at target tone
- `maxChromaAtTone(t)` -> maximum achievable chroma in sRGB at this hue and tone
- `materialRoles()` -> { primary, onPrimary, primaryContainer, onPrimaryContainer, ... }

**Inherited (PerceptualCylindricalModel):**
- `adjustChroma(delta)`, `atLightness(l)`, `isInGamut()`, `gamutMap()`
- `rotateHue(deg)`, `complementary()`, `analogous()`, `triadic()`

**Priority:** High -- powers Material Design 3 theme generation.

## Resources
- [Introducing Material You (Material.io)](https://material.io/blog/introducing-material-you)
- [Material You: what it's all about (Medium)](https://medium.com/android-news/material-you-what-its-all-about-f8e8b42331f)
- [HCT - Material Color Utilities (GitHub)](https://github.com/material-foundation/material-color-utilities)
- [Science of color and design (Material blog)](https://material.io/blog/science-of-color-design)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].* Related: [[CIE Lab]], [[HCL]], [[HSLuv]], [[CAM16]].

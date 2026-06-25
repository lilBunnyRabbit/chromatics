---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# IPT

> A perceptual color space based on LMS cone responses with I (Intensity) and two opponent channels P (protan) and T (tritan) -- excels at predicting hue linearity.

## Overview
IPT is a perceptual color model based on LMS cone responses, representing colors in terms of Intensity (I), Protan (P, red-green), and Tritan (T, blue-yellow) components. It is designed for high-fidelity color difference evaluations and image quality assessment. Its standout property is excellent hue linearity -- constant-hue lines are actually straight in IPT, which influenced the design of Oklab.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `I` | Intensity (overall brightness) | 0-1 | Increasing `I` increases brightness |
| `P` | Protan (red-green opponent) | ~-0.5 to 0.5 | Adjusting `P` shifts toward red or green |
| `T` | Tritan (blue-yellow opponent) | ~-0.5 to 0.5 | Modifying `T` alters the blue-yellow balance |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- Excellent hue linearity -- constant hue lines are actually straight
- Better hue prediction than CIE Lab
- Influenced the design of Oklab
- Typed array: Float32Array
- **Best for:** Hue-preserving gamut mapping, image quality metrics, precise color difference assessment
- Change `I` for overall luminance control; adjust `P` and `T` for fine-tuning color balance
- String output: typically converted to RGB for display, as no direct CSS representation exists

## Conversions
- **Derived from:** LMS (power function + matrix)
- **Converts to:** LMS, CIE XYZ
- **Direct conversion targets:** to/from CIE Lab, LCHuv, and other perceptual models

## Chromatics API
**Class:** `IPT` **extends** `ColorModel`

**Model-specific methods:**
- `hueAngle()` -> compute hue from P,T (constant hue lines are straight in IPT)

**Unique value:** Best hue linearity. Used in gamut mapping algorithms where preserving hue is critical.

## Resources
- [IPT color space — Wikipedia](https://en.wikipedia.org/wiki/IPT_color_space)
- [IPT: A Perceptual Color Space for Image Quality Assessment (ResearchGate)](https://www.researchgate.net/publication/228652837_IPT_A_Perceptual_Color_Space_for_Image_Quality_Assessment)
- [colour-science.org — IPT model](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[LMS]], [[Oklab]], [[CIE XYZ]]

---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# ACEScc

> Logarithmic encoding of ACES optimized for color grading -- maps scene-linear ACES data to a log curve that gives colorists fine control over midtones.

## Overview
ACEScc is a logarithmic encoding of the ACES color space optimized for grading, providing finer control over midtones. Its log curve allocates more precision to midtones, making it useful in post-production workflows where logarithmic grading offers more precise control over image tonal ranges. It uses AP1 primaries (the same as ACEScg). Compared to ACEScct, ACEScc has a pure log curve, whereas ACEScct adds a toe for better shadow handling.

## Channels

| Channel | Full name | Range | Controls |
| ------- | --------- | ----- | -------- |
| `r` | Red (logarithmic encoding) | 0-1 | Increases the logarithmic red value |
| `g` | Green (logarithmic encoding) | 0-1 | Modifies the logarithmic green value |
| `b` | Blue (logarithmic encoding) | 0-1 | Modifies the logarithmic blue value |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- **Key strengths:** Log curve allocates more precision to midtones; designed for color grading tools (DaVinci Resolve, Baselight, etc.); uses AP1 primaries (same as ACEScg).
- **vs ACEScct:** ACEScc has a pure log curve; ACEScct adds a toe for better shadow handling.
- **Typed Array:** Float32Array.
- **Manipulation -- Logarithmic Grading:** Apply color grading on a logarithmic curve to fine-tune channel values for nuanced grading and fine control over midtones.
- **CSS / String:** Typically converted to ACES or sRGB for display purposes.
- **Best for:** Color grading, post-production, film finishing.

## Conversions
- **Derived from:** ACES (via AP1 + log encoding).
- **Converts to:** ACES, ACEScg, ACEScct.
- **Direct conversion targets:** ACES, ACEScct, and via additional transforms to RGB.

## Chromatics API
**Class:** `Acescc` **extends** `RGBModel`

**Model-specific methods:**
- `toLinear()` -> decode log to ACEScg
- `stops()` -> exposure value in stops

**Unique value:** Log encoding for grading. Fine midtone control.

## Resources
- [ACES on Wikipedia](https://en.wikipedia.org/wiki/Academy_Color_Encoding_System)
- [ACEScc on ACES Central](https://acescentral.com)
- [colormath ACEScc color space](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-scc.html)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[ACES]], [[ACEScct]], [[ACEScg]].

---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# ACEScct

> A variant of ACEScc with a toe region that better preserves shadow detail -- the preferred ACES grading space for most colorists.

## Overview
ACEScct is similar to ACEScc but with a slightly different toe region that better preserves shadow detail, making it more forgiving in low-light areas. The toe region prevents the "milky blacks" problem of the pure-log ACEScc, giving better shadow detail preservation. It is the most widely adopted ACES grading space in practice and is favoured in digital grading pipelines where preserving detail in darker regions is crucial.

## Channels

| Channel | Full name | Range | Controls |
| ------- | --------- | ----- | -------- |
| `r` | Red (logarithmic with toe) | 0-1 | Increases red intensity while preserving shadow detail |
| `g` | Green | 0-1 | Affects green tone with a toe function |
| `b` | Blue | 0-1 | Changes blue intensity with enhanced low-light detail |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- **Key strengths:** Toe region prevents "milky blacks" problem of pure-log ACEScc; better shadow detail preservation; most widely adopted ACES grading space in practice.
- **Typed Array:** Float32Array.
- **Manipulation -- Logarithmic Grading (log + toe):** Apply color grading on a logarithmic curve for fine control over midtones and shadows.
- **CSS / String:** Typically converted to ACES or sRGB for display.
- **Best for:** Digital color grading, particularly scenes with important shadow detail.

## Conversions
- **Derived from:** ACES (via AP1 + log+toe).
- **Converts to:** ACES, ACEScc, ACEScg.
- **Direct conversion targets:** ACES, ACEScc, and further to standard RGB spaces.

## Chromatics API
**Class:** `Acescct` **extends** `RGBModel`

**Model-specific methods:**
- `toLinear()` -> decode log+toe to ACEScg
- `stops()` -> exposure value in stops

**Unique value:** Log+toe for grading. Better shadows than ACEScc.

## Resources
- [ACEScct Overview -- ACES Central](https://acescentral.com)
- [colormath ACEScct color space](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-scct.html)
- [ACES on Wikipedia](https://en.wikipedia.org/wiki/Academy_Color_Encoding_System)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[ACEScc]], [[ACES]], [[ACEScg]].

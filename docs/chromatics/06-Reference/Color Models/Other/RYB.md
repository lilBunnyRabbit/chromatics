---
tags: [color-model, other]
status: reference
updated: 2026-06-24
---

# RYB

> The traditional artist's color model -- Red, Yellow, Blue as primary colors for subtractive pigment mixing, predating modern CMY(K) by centuries.

## Overview
RYB (Red-Yellow-Blue) is the traditional pigment-mixing model used by artists, distinct from the additive RGB model. It uses Red, Yellow, and Blue as primary colors for subtractive pigment mixing and predates modern CMY(K) by centuries.

## Characteristics
- **Key strengths:**
  - Intuitive for traditional artists and art education.
  - Historical basis for color theory (complementary colors, color wheels).
- **Limitations:** Not scientifically accurate -- CMY is the correct subtractive system.
- **Best for:** Art education, traditional painting, intuitive color theory.

## Conversions
- Conversion to RGB is approximate and non-standardized. Multiple algorithms exist (Gossett & Chen 2004, Sugita 2016). Pick one and document it.

## Chromatics API
**Class:** `RYB` **extends** `ColorModel`

**Model-specific methods:**
- `toRgb()` -> approximate mapping (non-standard, multiple algorithms exist)
- `complementary()` -> RYB complement (different from RGB complement)
- `mix(other, ratio)` -> subtractive-style mixing

**Note:** Conversion to RGB is approximate and non-standardized. Multiple algorithms exist (Gossett & Chen 2004, Sugita 2016). Pick one and document it.

## Resources
- [Wikipedia: RYB color model](https://en.wikipedia.org/wiki/RYB_color_model)
- [Gossett & Chen 2004 -- Paint Inspired Color Mixing and Compositing for Visualization](https://bahamas10.github.io/ryb/assets/ryb.pdf)
- [Bjorn Ottosson -- color mixing notes](https://bottosson.github.io/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[RGB]], [[CMY]], [[CMYK]].

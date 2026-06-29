---
tags: [color-model, perceptual, niche]
status: reference
updated: 2026-06-24
---

# HLC

> Hue-Lightness-Chroma — a reordering of CIE LCh(ab) that puts Hue first, used by the freiefarbe.de HLC Colour Atlas project.

## Overview
HLC (Hue–Lightness–Chroma) is a reordering of CIE LCh(ab) that places Hue first. It is mathematically identical to CIE LCh(ab) — HLC is CIE LCh(ab) with components reordered. It organizes color by hue, lightness, and chroma (similar to HCL) and is used by the freiefarbe.de HLC Colour Atlas project, a free and open-source color space and color list based on CIELab.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `H` | Hue angle | 0-360 | Hue family on the color wheel |
| `L` | Lightness | 0-100 | Perceived lightness |
| `C` | Chroma | 0–∞ | Colorfulness relative to brightness |

## Characteristics
- Mathematically identical to CIE LCh(ab); only the component order differs (Hue first)
- Based on CIELab; backs the open-source HLC Colour Atlas (freiefarbe.de)
- **Best for:** Physical color specification (HLC Colour Atlas), open-source color matching

## Conversions
- **Derived from:** CIE Lab / LCh(ab) (reordered)
- **Converts to:** CIE LCh, CIE Lab

## Chromatics API
**Note:** Implementation alias for `CieLch` (reordered arguments). `HLC(h, l, c)` maps to `CieLch(l, c, h)`.

## Resources
- [Wikipedia: CIELCh_ab](https://en.wikipedia.org/wiki/CIELCh_ab)
- [HLC Colour Atlas (freiefarbe.de)](https://www.freiefarbe.de/en/colour-atlas/)
- [W3C CSS Color Module Level 4 (lch())](https://www.w3.org/TR/css-color-4/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE Lch]], [[LCHab]], [[CIE Lab]].

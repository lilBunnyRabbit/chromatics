---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# CIE 1976 UCS

> The improved uniform chromaticity scale (1976) — transforms XYZ into (u', v') coordinates that are ~4x more uniform than CIE xy, and the direct basis for CIELUV.

## Overview
The CIE 1976 UCS is the improved uniform chromaticity scale, a projective transform of CIE XYZ into (u', v') coordinates that are ~4x more uniform than CIE xy. It is the most uniform 2D chromaticity diagram in standard use and the direct basis for CIELUV (u* and v* are scaled from u', v'). It is the standard for LED and display industry color specification, including ANSI/NEMA binning standards for LED manufacturing.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `u'` | u' chromaticity | 0-~0.62 | Horizontal position on uniform chromaticity diagram |
| `v'` | v' chromaticity | 0-~0.59 | Vertical position on uniform chromaticity diagram |

## Characteristics
- Most uniform 2D chromaticity diagram in standard use
- Direct basis for CIELUV (u* and v* are scaled from u', v')
- Standard for LED and display industry color specification
- Used in ANSI/NEMA binning standards for LED manufacturing
- **Formulas:** u' = 4X/(X+15Y+3Z), v' = 9Y/(X+15Y+3Z)
- **Relationship to CIE 1960:** u' = u (same), v' = 1.5v (scaled for better uniformity)
- **Best for:** LED specification and binning, display color gamut visualization, CIE Luv calculations

## Conversions
- **Derived from:** CIE XYZ (projective transform)
- **Converts to:** CIE Luv (add L*), CIE 1960 UCS

## Chromatics API
**Class:** `Cie1976` **extends** `ColorModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `u_prime` | `number` | 0-~0.62 | `color.ucs76_u` |
| `v_prime` | `number` | 0-~0.59 | `color.ucs76_v` |

**Model-specific methods:**
- `cct()` -> correlated color temperature
- `toCieLuv(L)` -> extend to full CIE Luv with lightness
- `ledBin(target, tolerance)` -> check if within LED binning tolerance

**Unique value:** Standard for LED industry color specification and ANSI binning.

## Resources
- [Wikipedia: CIELUV (forward transformation)](https://en.wikipedia.org/wiki/CIELUV#The_forward_transformation)
- [Wikipedia: CIELUV](https://en.wikipedia.org/wiki/CIELUV)
- [Bruce Lindbloom: color math reference](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE 1960 UCS]], [[CIE Luv]], [[CIE XYZ]], [[CIE xyY]].

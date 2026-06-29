---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# CIE 1960 UCS

> The first CIE uniform chromaticity scale (MacAdam, 1960) — transforms XYZ into (u, v) coordinates where equal distances better correspond to equal perceived differences.

## Overview
MacAdam's 1960 uniform chromaticity scale (UCS) is a projective transform of CIE XYZ into (u, v) chromaticity coordinates, designed so that equal distances correspond more closely to equal perceived color differences. It is roughly 4x more uniform than CIE xy for small color differences, and it is the foundation for correlated color temperature (CCT) calculations and the basis for the improved CIE 1976 u',v' diagram. It has since been superseded by the CIE 1976 UCS.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `u` | u chromaticity | 0-~0.62 | Horizontal position on uniform chromaticity diagram |
| `v` | v chromaticity | 0-~0.60 | Vertical position on uniform chromaticity diagram |

## Characteristics
- ~4x more uniform than CIE xy for small color differences
- Foundation for correlated color temperature (CCT) calculations
- Basis for the improved CIE 1976 u',v' diagram
- MacAdam ellipses are more circular in (u,v) than in (x,y)
- **Formulas:** u = 4X/(X+15Y+3Z), v = 6Y/(X+15Y+3Z)
- **Best for:** Correlated color temperature (CCT) calculations, LED binning, light source specification

## Conversions
- **Derived from:** CIE XYZ (projective transform)
- **Superseded by:** CIE 1976 UCS (u',v')
- Relationship to CIE 1976: u' = u (same), v' = 1.5v (scaled for better uniformity)

## Chromatics API
**Class:** `Cie1960` **extends** `ColorModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `u` | `number` | 0-~0.62 | `color.ucs_u` |
| `v` | `number` | 0-~0.60 | `color.ucs_v` |

**Model-specific methods:**
- `cct()` -> correlated color temperature (this is THE space for CCT calculation)
- `distanceFromPlanckian()` -> Duv
- `macAdamEllipse(steps?)` -> approximate MacAdam ellipse boundary at this point

## Resources
- [Wikipedia: CIE 1960 color space](https://en.wikipedia.org/wiki/CIE_1960_color_space)
- [Wikipedia: Correlated color temperature](https://en.wikipedia.org/wiki/Color_temperature)
- [Bruce Lindbloom: color math reference](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE 1976 UCS]], [[CIE Luv]], [[CIE XYZ]], [[CIE xyY]].

---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# CIE xyY

> Separates CIE XYZ into chromaticity (x, y) and luminance (Y) — the basis for the famous CIE 1931 chromaticity diagram.

## Overview
CIE xyY is not a separate color space per se but a repacking of XYZ into chromaticity coordinates x, y plus luminance Y. By computing x = X/(X+Y+Z) and y = Y/(X+Y+Z), it isolates the color's hue and saturation (chromaticity) independent of brightness, while Y carries luminance unchanged. The (x, y) pair plots on the famous CIE 1931 chromaticity diagram — the horseshoe-shaped spectrum locus with white near the center — making it THE standard visualization of visible color and the means to define color space primaries and white points. It covers all colors (with Y for brightness), but it is not perceptually uniform: equal distances on the xy plane are a poor indicator of perceived difference, especially in blues and greens, which motivated the later u,v (1960) and u',v' (1976) uniform chromaticity scales. For black (X=Y=Z=0) chromaticity is undefined.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `x` | x chromaticity | 0-~0.74 (theoretically 0–1) | Horizontal position on chromaticity diagram |
| `y` | y chromaticity | 0-~0.83 (theoretically 0–1) | Vertical position on chromaticity diagram |
| `Y` | Luminance | 0-1 (or 0–100 / absolute units) | Brightness (independent of chromaticity) |

Notes: x = X/(X+Y+Z), y = Y/(X+Y+Z). Spectral red (700 nm) ≈ x 0.7347, y 0.2653; spectral green ≈ x 0.17, y 0.78; saturated blue ≈ x 0.15, y 0.06. Increasing Y brightens the color without moving its (x,y) point.

## Characteristics
- Chromaticity is independent of brightness (clean separation of color from intensity)
- THE standard visualization of visible color (horseshoe diagram)
- Used to define color space primaries and white points (e.g. D65 white ≈ x 0.3127, y 0.3290; Rec.709/sRGB red ≈ (0.64, 0.33))
- Directly tied to the physics of XYZ; useful for gamut comparison and light/lamp tint specification
- Not perceptually uniform (green area stretched) — superseded for uniformity by u,v and u',v'
- **Best for:** Defining gamuts, lighting design, white point specification, device characterization

## Conversions
- **Derived from:** CIE XYZ (x=X/(X+Y+Z), y=Y/(X+Y+Z), Y carried over)
- **Converts to:** CIE XYZ — inverse: X = (x/y)·Y, Z = (1−x−y)/y · Y
- Other models route through XYZ; u'v' (1976 UCS) can be obtained directly from xy (e.g. u' = 4x/(−2x+12y+3))

## Chromatics API
**Class:** `CieXyy` **extends** `ColorModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `x` | `number` | 0-~0.74 | `color.xyy_x` |
| `y` | `number` | 0-~0.83 | `color.xyy_y` |
| `Y` | `number` | 0-1 | `color.xyy_Y` |

**Model-specific methods:**
- `cct()` -> correlated color temperature in Kelvin (via CIE 1960 UCS)
- `isOnPlanckianLocus()` -> is this a blackbody radiator color?
- `distanceFromPlanckian()` -> Duv (distance from Planckian locus)
- `atLuminance(Y)` -> same chromaticity at different brightness

**Unique value:** Chromaticity diagram coordinates. Essential for specifying gamut boundaries and white points.

## Resources
- [Wikipedia: CIE 1931 chromaticity diagram](https://en.wikipedia.org/wiki/CIE_1931_color_space#Chromaticity_diagram)
- [lightcolourvision.org: chromaticity / xyY](https://lightcolourvision.org/)
- [Bruce Lindbloom: color math reference](http://www.brucelindbloom.com/)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE XYZ]], [[CIE 1960 UCS]], [[CIE 1976 UCS]], [[CIE Lab]].

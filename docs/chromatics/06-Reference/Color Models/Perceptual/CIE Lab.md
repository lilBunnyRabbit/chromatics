---
tags: [color-model, perceptual, critical]
status: reference
updated: 2026-06-24
---

# CIE Lab

> The workhorse of industrial color measurement (CIELAB, 1976) — applies cube-root compression to XYZ to approximate perceptual uniformity, making delta-E distances meaningful.

## Overview
CIELAB (often just "Lab"), defined by the CIE in 1976, is a perceptually uniform color model designed to approximate human vision. It is derived from CIE XYZ through nonlinear (cube-root) transformations that mimic the nonlinear response of the eye and spread colors so that Euclidean distances correspond more closely to perceived differences. Its coordinates are L* (lightness), a* (green–red opponent axis), and b* (blue–yellow opponent axis). It is device-independent and spans the entire visible range (it can represent colors outside typical RGB gamuts). Approximately perceptually uniform — a ΔE of about 1 corresponds to a just-noticeable difference — it is the standard color space in the paint, textile, and printing industries, and the foundation for the delta-E76, delta-E94, and delta-E2000 difference formulas.

LAB is intended to be perceptually uniform; its cylindrical representation is LCHab. LAB and LCHab each have multiple color spaces defined relative to a white point; the default white point is D65. Its quasi-uniformity (a change of 1 in L*, a*, or b* is of similar perceptual magnitude anywhere, though not perfectly, especially in very saturated blues) makes it excellent for color correction, grading, and maintaining color fidelity across devices. Weaknesses: it is not intuitive for picking colors by a*/b*, it is not bounded to [0,1], many coordinate combinations fall outside real colors, and it assumes a reference white (cross-illuminant use requires chromatic adaptation).

**Mathematical basis:** XYZ of the sample is scaled relative to the reference white (X_n, Y_n, Z_n), then:
- L* = 116·f(Y/Y_n) − 16
- a* = 500·[f(X/X_n) − f(Y/Y_n)]
- b* = 200·[f(Y/Y_n) − f(Z/Z_n)]

where f(t) = t^(1/3) for t > 0.008856, and f(t) = 7.787·t + 16/116 for lower values (the piecewise form ensures smoothness and a linear segment near black). These formulas descend from the earlier Hunter Lab.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `L*` | Lightness | 0-100 | Perceived lightness (0=black, 100=white / reference-white luminance) |
| `a*` | Green-Red | ~-128 to +127 | Negative=green, positive=red |
| `b*` | Blue-Yellow | ~-128 to +127 | Negative=blue, positive=yellow |
| `alpha` | Opacity | 0–1 | 0 = fully transparent, 1 = fully opaque |

Notes: L* is roughly proportional to the cube root of relative luminance Y; a difference of ~1–2 in L* is near the noticeable-lightness threshold mid-range. (a*=0, b*=0) is on the neutral gray axis. Together (a*, b*) convert to polar chroma/hue: C = √(a*² + b*²), h = atan2(b*, a*). The ~-128 to +127 limits come from older 8-bit encodings; Lab is theoretically unbounded but the reference white limits real colors.

## Characteristics
- Approximately perceptually uniform: ΔE=1 ≈ just-noticeable difference
- Foundation for ΔE76, ΔE94, ΔE2000 color difference formulas
- Standard in paint, textile, printing industries
- Device-independent; spans the entire visible range
- Profile Connection Space in ICC color management (Lab or XYZ, usually D50)
- Axes correspond to opponent-process vision channels (more perceptually meaningful than HSV)
- **Typed Array:** Float32Array (high precision, handles fractional values)
- **Best for:** Color difference (ΔE), industrial QC, ICC profiles, print color management, color correction/grading, image editing (e.g. sharpening luminance without affecting chroma)
- **CSS / String:** modern CSS has `lab(L a b)`; legacy notes mention converting to RGB/hex for display

## Conversions
- **Derived from:** CIE XYZ (cube-root transform; one-step analytic conversion both ways)
- **Converts to:** CIE LCh / LCHab (polar: C=√(a²+b²), h=atan2(b,a) — lossless), CIE XYZ, sRGB
- **Direct conversion targets:** To/from CIE XYZ, LCHab, and RGB
- Lab ↔ Luv is not a one-step formula (route via XYZ); Lab ↔ sRGB also routes through XYZ

## Chromatics API
**Class:** `CieLab` **extends** `LabModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `L` | `number` | 0-100 | `color.lab_l` |
| `a` | `number` | ~-128 to +127 | `color.lab_a` |
| `b` | `number` | ~-128 to +127 | `color.lab_b` |

**DSL Constructor:** `LAB(L, a, b)` -> `Color`

**Model-specific methods:**
- `deltaE76(other)` -> CIE 1976 color difference (euclidean)
- `deltaE94(other, weights?)` -> CIE 1994 color difference
- `deltaE2000(other)` -> CIEDE2000 color difference (gold standard)
- `deltaECMC(other, lc?)` -> CMC l:c color difference (textiles)
- `isPerceptiblyDifferent(other, threshold?)` -> deltaE2000 > threshold
- `toCSS()` -> `lab(L a b)` string

**Priority:** High — industrial color difference is a core feature.

## Resources
- [Wikipedia: CIELAB color space](https://en.wikipedia.org/wiki/CIELAB_color_space)
- [Colormath: LAB](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-a-b/)
- [Colormath: LAB color spaces](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-a-b-color-spaces/)
- [EasyRGB: color math](https://www.easyrgb.com/en/math.php#text2)
- [Bruce Lindbloom: XYZ ↔ Lab math](http://www.brucelindbloom.com/)
- [W3C CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE Lch]], [[LCHab]], [[CIE XYZ]], [[CIE Luv]].

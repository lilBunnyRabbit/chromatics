---
tags: [color-system, hue-system]
status: reference
updated: 2026-06-24
---

# NCS (Natural Color System)

> A perceptual color system based on Hering's opponent-color theory that describes how colors appear rather than how they are produced.

## Overview

The Natural Color System (NCS) is a perceptual color system developed in Sweden in 1964, based on Hering's opponent-color theory. Rather than describing how a color is physically produced, it describes how colors appear to human vision, using perceptual attributes instead of strict numerical values.

**Key strengths:**
- Based on human perception, not physics
- National standard in Sweden, Norway, Spain, and South Africa
- ~1,950 standardized colors
- Widely used in European architecture and design

**Best for:** Architecture, interior design, product design, and European building specification.

## Notation & Structure

NCS describes a color by its blackness, chromaticness, and hue.

**Notation example:** `NCS S 2060-Y90R` = 20% blackness, 60% chromaticness, yellow with 90% red.

Perceptual attribute parameters:

| Parameter | Name | Range | Description / Effect |
|-----------|------|-------|----------------------|
| `H` | Hue (perceived color) | N/A | Basic perceived hue (e.g. red, yellow); more categorical than numerical |
| `S` | Saturation / Chromaticness | N/A | Colorfulness, intensity, or purity of the hue |
| `L` | Lightness | N/A | Perceived brightness — how light or dark the color appears |
| `alpha` | Opacity | 0–1 | Controls transparency |

**Typed Array:** Float32Array (when numerical representations are standardized; otherwise values may be treated categorically).

**Direct conversion targets:** To/from CIE Lab and RGB, using specialized conversion formulas. NCS is not directly representable in CSS and requires conversion to a standard model such as RGB.

## Usage

Widely used in interior design, architecture, and product design, where a perceptual description of color is preferred. It is the national standard in Sweden, Norway, Spain, and South Africa, and is heavily used in European building specification.

**Perceptual adjustments / color specification:** Altering the values (once numerically mapped) changes the perceived hue, saturation, and brightness, defining colors based on human perception for accurate color communication and design.

## Chromatics API

**Type:** `CatalogSystem`

**Static methods:**
- `NCS.fromNotation('S 2060-Y90R')` -> `Color` (requires lookup table)
- `NCS.nearest(color)` -> closest NCS notation

**Note:** Proprietary system. Conversion requires licensed lookup data or approximation formulas.

## Resources

- [Natural Color System — Wikipedia](https://en.wikipedia.org/wiki/Natural_Color_System)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

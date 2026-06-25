---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# Coloroid

> A Hungarian color order system (1962) designed specifically for architecture — uses aesthetically optimized spacing rather than purely perceptual spacing.

## Overview
Coloroid is a Hungarian color order system from 1962, designed specifically for architecture, interior, and environmental design. It organizes colors based on aesthetic principles with an emphasis on aesthetics and human perception, using aesthetically optimized spacing rather than purely perceptual spacing. It represents colors in terms of hue, saturation, and brightness.

**Best for:** Architectural design, urban planning, environmental and interior color design.

## Notation & Structure
Coloroid colors are specified by **A** (hue), **T** (saturation), and **V** (lightness/brightness), used in the API as `Coloroid.lookup(A, T, V)`.

The system is also described with the following continuous parameters:

| Parameter | Description | Range | Effect |
|-----------|-------------|-------|--------|
| `h` | Hue angle | 0–360 | Adjusting `h` changes the base color tone. |
| `s` | Saturation (color intensity) | 0–1 | Increasing `s` makes the color more vivid. |
| `b` | Brightness (lightness) | 0–1 | Higher `b` yields a brighter color. |
| `alpha` | Opacity | 0–1 | Controls transparency. |

- **Typed Array:** Float32Array
- **CSS / String representation:** Typically converted to HSL or RGB for digital display.
- **Direct conversion targets:** To/from RGB and HSL.
- **Modifications:** Adjust hue, saturation, and brightness (`h`, `s`, `b`) to achieve the desired aesthetic effect.

## Usage
Primarily used in architectural and interior design for generating and communicating aesthetic color palettes; also urban planning and environmental color design. The system covers aspects of color vision and aesthetics — hue, saturation, and brightness — tailored for architectural use.

## Chromatics API
**Type:** `CatalogSystem`

**Static methods:**
- `Coloroid.lookup(A, T, V)` -> `Color`

## Resources
- [Coloroid (Wikipedia)](https://en.wikipedia.org/wiki/Coloroid)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

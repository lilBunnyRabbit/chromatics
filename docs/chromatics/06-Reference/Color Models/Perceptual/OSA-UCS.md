---
tags: [color-model, perceptual, niche]
status: reference
updated: 2026-06-24
---

# OSA-UCS

> A uniform color space by the Optical Society of America (1974) using a rhombohedral lattice where 12 nearest neighbors are equidistant.

## Overview
OSA-UCS is a uniform color space developed by the Optical Society of America to provide a uniform scale for color differences, useful for precise color comparisons and matching in industrial applications and across devices. It uses a distinctive rhombohedral lattice geometry in which the 12 nearest neighbors of any point are equidistant, giving maximum local uniformity.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `L` | Lightness | 0-100 | Higher `L` yields a lighter color |
| `a` | Red-green axis | Typically -100 to +100 | Adjusting `a` shifts along the red-green spectrum |
| `b` | Blue-yellow axis | Typically -100 to +100 | Changing `b` adjusts along the blue-yellow axis |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- Maximum local uniformity (small delta-E)
- Unique rhombohedral lattice geometry (12 equidistant nearest neighbors)
- **Limitation:** Cannot be analytically inverted to XYZ (requires iteration)
- Typed array: Float32Array
- **Best for:** Research on color uniformity, industrial color difference evaluation, quality control, precise color matching
- Modify `L`, `a`, and `b` to fine-tune color appearance
- String output: generally converted to RGB or Lab for display

## Conversions
- **Derived from:** CIE XYZ (non-invertible transform)
- **Converts to:** CIE XYZ (iterative only)
- **Direct conversion targets:** to/from CIE Lab and other uniform color spaces

## Chromatics API
**Class:** `OsaUcs` **extends** `ColorModel`

**Note:** Cannot be analytically inverted to XYZ (requires iteration). Low priority for implementation. Include as reference/conversion target only.

## Resources
- [OSA-UCS — Wikipedia](https://en.wikipedia.org/wiki/OSA-UCS)
- [OSA-UCS original paper (JOSA A)](https://www.osapublishing.org/abstract.cfm?uri=JOSAA-3-12-2050)
- [colour-science.org — OSA-UCS model](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE Lab]], [[CIE XYZ]]

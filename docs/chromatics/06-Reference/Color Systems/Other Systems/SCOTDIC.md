---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# SCOTDIC

> A textile color communication system providing physical fabric swatches for accurate dye matching, with 2,300+ colors.

## Overview
SCOTDIC is a color system used primarily in the textile industry for standardized dye matching, color communication, and quality control. It provides physical fabric swatches (cotton, polyester) covering 2,300+ colors for accurate dye matching, giving a systematic method to represent and communicate colors in industrial processes.

**Best for:** Textile/fashion color specification, fabric dye matching, garment QC.

## Notation & Structure
Each color is identified by a categorical SCOTDIC color code that selects a specific predefined color.

| Parameter | Description | Range | Effect |
| --------- | ------------------ | ----- | --------------------------------------------------- |
| `code` | SCOTDIC color code | N/A | Changing `code` selects a specific predefined color. |
| `alpha` | Opacity | 0–1 | Controls transparency. |

- **Typed Array:** Not applicable (color codes are categorical identifiers).
- **CSS / String Representation:** Custom representations can be defined; often mapped to RGB for digital display.
- **Direct Conversion Targets:** Typically mapped to RGB via lookup tables.
- **Color Selection:** Typically the model is selected rather than modified, based on industry standards.

## Usage
Useful in textile manufacturing and quality control where standardized color references are essential, particularly for dyeing and color matching in textile/fashion specification and garment QC. Distributed as physical fabric swatches rather than as a purely computational space.

## Chromatics API
**Note:** Textile swatch system. Include as catalog lookup if data is available. Low priority.

## Resources
- [SCOTDIC — Wikipedia](https://en.wikipedia.org/wiki/SCOTDIC)
- Industry-specific documentation (no universal public link available).

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

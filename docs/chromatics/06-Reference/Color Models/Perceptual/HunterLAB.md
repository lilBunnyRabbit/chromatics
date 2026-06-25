---
tags: [color-model, perceptual]
status: reference
updated: 2026-06-24
---

# HunterLAB

> The predecessor to CIE Lab (1948) -- uses square-root compression (not cube-root) of XYZ, still used in some industrial instruments.

## Overview
HunterLAB is a color model developed for industrial color measurement. It offers an alternative to CIE Lab with parameters based on reflectance data, and is used for quality control and precise color difference calculations. It applies a square-root compression of XYZ (rather than CIE Lab's cube-root), and is still found in some older industrial instruments.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `L` | Lightness (reflectance-based) | 0-100 | Reflectance/lightness of color; higher `L` appears lighter |
| `a` | Red/Green | Varies | Red vs. green coordinate; adjusting `a` shifts along the red-green axis |
| `b` | Yellow/Blue | Varies | Yellow vs. blue coordinate; changing `b` adjusts blue-yellow balance |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- Based on reflectance data; designed for industrial color measurement and quality control
- Typed array: Float32Array
- **vs CIE Lab:** CIE Lab (1976) uses cube-root and is more uniform; Hunter Lab uses square-root
- **Best for:** Legacy industrial color measurement, older instrument compatibility, color quality control where precise matching is critical
- Adjust `a` and `b` to correct color casts and ensure consistency; modify `L` for lighter/darker appearance
- String output: not directly used in CSS; typically converted to a more common model for display

## Conversions
- **Derived from:** CIE XYZ (square-root transform)
- **Converts to:** CIE XYZ, CIE Lab
- **Direct conversion targets:** to/from CIE Lab and other perceptual models

## Chromatics API
**Class:** `HunterLab` **extends** `LabModel`

**Model-specific methods:**
- `deltaEhunter(other)` -> euclidean distance in Hunter Lab

**Note:** Legacy. Include for compatibility with older instruments. CIE Lab is preferred for new work.

## Resources
- [Hunter Lab — Wikipedia](https://en.wikipedia.org/wiki/Hunter_Lab)
- [Bruce Lindbloom — color math & conversions](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE Lab]], [[CIE XYZ]]

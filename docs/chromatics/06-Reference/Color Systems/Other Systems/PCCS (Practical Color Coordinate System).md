---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# PCCS (Practical Color Coordinate System)

> A Japanese color system (1964) with named "tone" categories for practical design communication and manufacturing.

## Overview
The Practical Color Coordinate System (PCCS) is a Japanese color system introduced in 1964. It represents and communicates color coordinates for practical design and manufacturing applications, organizing colors using named "tone" categories.

**Best for:** Japanese design education, color coordination, tone-based palette design.

## Notation & Structure
Colors are organized into named tone categories: vivid, bright, strong, deep, light, soft, dull, dark, pale, and others. Each tone groups colors of comparable lightness and saturation, supporting practical design communication.

## Usage
Widely used in Japanese design education and for color coordination and tone-based palette design in practical design and manufacturing contexts.

## Chromatics API
**Type:** `CatalogSystem`

**Static methods:**
- `PCCS.byTone(tone)` -> all colors in a tone category (vivid, bright, deep, light, soft, dull, dark, pale, etc.)
- `PCCS.lookup(code)` -> `Color`

**Unique value:** Tone-based organization is useful for the DSL's palette generation: `PCCS.byTone('vivid')` returns a ready-made harmonious set.

## Resources
- [Practical Color Coordinate System — Wikipedia](https://en.wikipedia.org/wiki/Practical_Color_Coordinate_System)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

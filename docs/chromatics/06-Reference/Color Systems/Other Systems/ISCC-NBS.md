---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# ISCC-NBS

> A systematic color naming system (1955) that divides color space into 267 named regions using Munsell coordinates for standardized English color names.

## Overview
The ISCC-NBS system is a color naming and classification system developed by the Inter-Society Color Council (ISCC) and the National Bureau of Standards (NBS). It divides color space into 267 named regions, mapped onto Munsell coordinates, to provide standardized English color names.

**Best for:** Scientific color description (biology, geology), forensic analysis, standardized naming.

## Notation & Structure
Colors are described with systematic English names built from hue terms plus modifiers (e.g., "vivid red", "dark grayish yellow", "strong yellowish green"). Each named region corresponds to a centroid color and a range of Munsell coordinates.

## Usage
Used for scientific color description in fields such as biology and geology, forensic analysis, and any context requiring standardized, communicable color naming.

## Chromatics API
**Type:** `CatalogSystem`

**Static methods:**
- `ISCCNBS.name(color)` -> descriptive name (e.g., "vivid red", "dark grayish yellow")
- `ISCCNBS.byName('vivid red')` -> centroid `Color` + Munsell range

**Unique value:** Color NAMING. Essential for the DSL: `primary.name()` -> "strong yellowish green".

## Resources
- [ISCC–NBS system — Wikipedia](https://en.wikipedia.org/wiki/ISCC%E2%80%93NBS_system)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

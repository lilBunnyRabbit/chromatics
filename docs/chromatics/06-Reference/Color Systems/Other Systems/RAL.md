---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# RAL

> The dominant European color standard for paints, coatings, and plastics (Germany, 1927).

## Overview
RAL is a standardized color matching system, originating in Germany in 1927, used primarily across Europe to specify colors for paints, coatings, and plastics. It assigns unique codes to predefined colors for industrial consistency and quality control.

**Collections:**
- **RAL Classic:** ~215 colors, 4-digit codes (e.g., RAL 9010 = Pure White).
- **RAL Design:** ~1,825 colors organized by HLC derived from CIE Lab.
- **RAL Effect:** 490 colors, including metallics.

**Best for:** European architecture, industrial coatings, automotive, safety signage.

**Converts to:** CIE Lab (official values), approximate sRGB (RAL codes are typically mapped to RGB for digital display).

## Notation & Structure
Each color is identified by a categorical RAL code (e.g., RAL 9010). RAL Classic uses 4-digit codes; RAL Design is organized by Hue-Lightness-Chroma (HLC) from CIE Lab.

| Parameter | Name / Description | Range | Effect |
| --------- | ------------------ | ----- | ------------------------------------------------------ |
| `RAL` | RAL color code / identifier | N/A | Changing the code selects a predefined color standard. |
| `alpha` | Opacity | 0–1 | Controls transparency (if applicable). |

- **Typed Array:** Not applicable (RAL codes are categorical identifiers).
- **CSS / String Representation:** Custom string representations may be provided; conversion to RGB is necessary for web display.
- **Direct Conversion Targets:** CIE Lab (official); typically mapped to RGB for digital representation.
- **Color Selection:** The system is predefined; modifications involve selecting a different RAL code rather than adjusting parameters.

## Usage
Essential for industries where precise, standardized color references are required for quality control and manufacturing — choosing specific RAL colors for painting, coatings, and plastics ensures consistent color usage across European architecture, industrial coatings, automotive, and safety signage.

## Chromatics API
**Type:** `CatalogSystem`

**Static methods:**
- `RAL.lookup('9010')` -> `Color` (Pure White)
- `RAL.nearest(color)` -> `{ code, name, color, deltaE }`
- `RAL.search('white')` -> search by name
- `RAL.byCollection(collection)` -> Classic, Design, Effect

**DSL:** `RAL(9010)` -> `Color`

## Resources
- [RAL (color space) — Wikipedia](https://en.wikipedia.org/wiki/RAL)
- [RAL Color Standard — official site](https://www.ral-farben.de)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

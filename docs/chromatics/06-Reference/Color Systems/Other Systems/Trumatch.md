---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# Trumatch

> A digital CMYK color matching system with over 2,000 achievable process colors — organized by hue with systematic variations in saturation and brightness.

## Overview
Trumatch is a digital-first CMYK color matching system offering over 2,000 process colors achievable with standard CMYK. Colors are organized by hue with systematic variations in saturation and brightness, designed for predictable print output in desktop publishing workflows.

**Key strengths:**
- Over 2,000 process colors achievable with standard CMYK.
- Organized by 50 hues, each with up to 40 tints/shades.
- All colors designed to be printable (no out-of-gamut surprises).
- Digital-first: designed for desktop publishing workflows.
- Supported in Adobe Creative Suite.

**Best for:** Desktop publishing, CMYK process color selection, predictable print color.

**Converts to:** CMYK (native), approximate sRGB.

## Notation & Structure
Colors are organized by 50 hues, each with up to 40 tints/shades, varying systematically in saturation and brightness. Each entry is identified by a Trumatch code carrying native CMYK values.

## Usage
Used for desktop publishing and CMYK process color selection where predictable, printable color is required. Designed digital-first for desktop publishing and supported in Adobe Creative Suite.

## Chromatics API
**Type:** `CatalogSystem`

**Static methods:**
- `Trumatch.lookup(code)` -> `Color` (with CMYK values)
- `Trumatch.nearest(color)` -> closest match
- `Trumatch.byHue(hueNumber)` -> all tints/shades in that hue family

## Resources
- [Trumatch — Wikipedia](https://en.wikipedia.org/wiki/Trumatch)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

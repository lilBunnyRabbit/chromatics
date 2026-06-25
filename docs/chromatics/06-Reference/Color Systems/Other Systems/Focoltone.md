---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# Focoltone

> A British color system designed to eliminate trapping problems in CMYK process printing — all 763 colors are defined as specific CMYK builds with known overprint behavior.

## Overview
Focoltone is a British color system designed to eliminate trapping problems in CMYK process printing. All 763 colors are defined as specific CMYK builds with known overprint behavior, requiring no spot inks. It is designed to minimize trapping and registration issues in process printing and is supported in Adobe Illustrator, CorelDRAW, and other design software.

**Best for:** Process color (CMYK) printing; designs where registration/trapping is a concern.

**Converts to:** CMYK (native definition), approximate sRGB.

## Notation & Structure
763 colors, each defined as specific CMYK percentages and organized by common CMYK components. Colors sharing ink components overprint cleanly, minimizing trapping/registration issues.

## Usage
Process color (CMYK) printing where registration/trapping is a concern. Supported in Adobe Illustrator, CorelDRAW, and other design software.

## Chromatics API
**Type:** `CatalogSystem`

**Static methods:**
- `Focoltone.lookup(code)` -> `Color` (with CMYK breakdown)
- `Focoltone.nearest(color)` -> closest match
- `Focoltone.trappingSafe(color1, color2)` -> boolean (share ink components?)

**Unique value:** Trapping safety check — no other system does this.

## Resources
- [Focoltone (Wikipedia)](https://en.wikipedia.org/wiki/Focoltone)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

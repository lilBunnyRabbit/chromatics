---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# ColorADD

> A universal color identification system for color-blind people (Portugal, 2010) — uses geometric symbols to encode colors without needing to see them.

## Overview
ColorADD is a universal color identification system designed to assist people with color blindness, created in Portugal in 2010. It assigns simple, intuitive geometric symbols to encode colors, allowing colors to be identified without being seen.

**Best for:** Accessibility design, inclusive packaging, wayfinding, educational materials.

## Notation & Structure
A graphic symbol code:
- **Triangle** — red
- **Diagonal bar** — blue
- **Horizontal bar** — yellow
- **Combinations** of these primaries encode secondary colors.

## Usage
Accessibility design, inclusive packaging, wayfinding, and educational materials for color-vision-deficient (CVD) users.

## Chromatics API
**Type:** `AccessibilitySystem`

**Static methods:**
- `ColorADD.symbol(color)` -> SVG or unicode symbol for the color
- `ColorADD.describe(color)` -> "primary red" / "secondary orange" etc.

**Unique value:** Accessibility feature for the webapp. Show ColorADD symbols next to swatches for CVD users.

## Resources
- [ColorADD (Wikipedia)](https://en.wikipedia.org/wiki/ColorADD)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

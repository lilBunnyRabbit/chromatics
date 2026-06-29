---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# COPIC

> The world's most widely used professional marker color system (Japan, Too Corporation) — 358 colors organized by hue family, saturation, and brightness for illustration and design.

## Overview
COPIC is the world's leading professional marker color system, made by Too Corporation in Japan. It organizes 358 colors (Classic) — or 396 colors in the Sketch/Ciao lines — by hue family, saturation, and brightness for illustration and design. The markers are refillable, alcohol-based, with replaceable nibs, and the numbering system makes color relationships intuitive (e.g., B23 is lighter than B26). It is the de facto standard for manga, illustration, industrial design, and architecture rendering.

**Best for:** Illustration, manga, industrial design rendering, architectural sketching.

**Converts to:** Approximate sRGB (varies by paper and technique).

## Notation & Structure
Colors are coded by hue family followed by saturation and brightness digits.

- **Hue families:** BV, V, RV, R, YR, Y, YG, G, BG, B, E (Earth), 0 (Colorless Blender).
- **First digit:** Saturation (0 = most vivid, 9 = grayest).
- **Last digits:** Brightness (00 = lightest, 99 = darkest).

Example: B23 is lighter than B26.

## Usage
Manga, illustration, industrial design rendering, architectural sketching. Physical alcohol-based markers; refillable with replaceable nibs. Seamless blending between colors in the same family. 358 colors (Classic) or 396 colors (Sketch/Ciao).

## Chromatics API
**Type:** `CatalogSystem`

**Static methods:**
- `Copic.lookup('BV23')` -> `Color`
- `Copic.nearest(color)` -> closest COPIC marker code
- `Copic.blendable(code)` -> adjacent codes that blend smoothly
- `Copic.byFamily(family)` -> all colors in a hue family

**DSL:** `COPIC('BV23')` -> `Color`

## Resources
- [Copic (Wikipedia)](https://en.wikipedia.org/wiki/Copic)
- Too Corporation — official manufacturer.

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

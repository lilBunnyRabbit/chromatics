---
tags: [color-system, hue-system]
status: reference
updated: 2026-06-24
---

# Munsell Color System

> The first scientifically-based color order system, specifying colors by perceptually equal steps in Hue, Value, and Chroma.

## Overview

Created by Albert Munsell in 1905, the Munsell Color System was the first scientifically-based color order system. It defines colors along three perceptual dimensions — Hue, Value, and Chroma — arranged in perceptually equal steps, creating a systematic, perceptually based method for color communication. It is widely used for standardized color communication across many industries including design, geology, and manufacturing.

**Best for:** Soil science, geology, archaeology, dental shades, art education.

## Notation & Structure

A Munsell color is specified by three components:

| Component | Full Name | Range | What it controls |
|-----------|-----------|-------|-----------------|
| `H` | Hue | 10 families, 100 steps (0–100) | Color family — cycles through families (R, YR, Y, GY, G, BG, B, PB, P, RP) |
| `V` | Value | 0–10 | Lightness (0 = black, 10 = white); higher `V` is brighter |
| `C` | Chroma | 0–~26 (varies; conceptually 0–∞) | Color intensity; higher `C` is more saturated and vivid |
| `alpha` | Opacity | 0–1 | Controls transparency |

**Notation example:** `5R 4/14` = Hue 5 Red, Value 4, Chroma 14.

**Typed Array:** Float32Array.

**Converts to:** CIE Lab (via renotation data) and sRGB. Munsell renotation data provides precise CIE xyY values for each chip, so conversion is lookup + interpolation, not a closed-form formula.

## Usage

Used wherever standardized color communication and quality control matter — soil science, geology, archaeology, dental shade matching, art education, design, and manufacturing.

**Color Matching:** Adjust `H`, `V`, and `C` to fine-tune color specifications and accurately match and communicate colors using Munsell's standardized notations.

**Standards:** JIS Z8102 — a Japanese standard for color specification ensuring consistent color reproduction across industries.

For web/CSS display, Munsell values are typically converted to RGB or CIE Lab.

## Chromatics API

**Type:** `CatalogSystem` with computational support.

**Static methods:**
- `Munsell.fromNotation('5R 4/14')` -> `Color`
- `Munsell.nearest(color)` -> `{ notation, color, deltaE }` (find closest Munsell chip)
- `Munsell.hueFamily(color)` -> `'R'`, `'YR'`, `'Y'`, etc.
- `Munsell.all()` -> all renotation data entries

**DSL:** `MUNSELL('5R 4/14')` -> `Color`

**Note:** Munsell renotation data provides precise CIE xyY values for each chip. Conversion is lookup + interpolation, not a formula.

## Resources

- [Munsell color system — Wikipedia](https://en.wikipedia.org/wiki/Munsell_color_system)
- [JIS Z8102 — Wikipedia](https://en.wikipedia.org/wiki/JIS_Z8102)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

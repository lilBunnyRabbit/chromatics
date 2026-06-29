---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# Toyo Color Finder

> A major Japanese spot color matching system by Toyo Ink — one of the two dominant print color systems in Asia alongside DIC, with over 1,050 colors.

## Overview
The Toyo Color Finder is a major Japanese spot color matching system from Toyo Ink, comparable to Pantone in Asian markets. Alongside DIC, it is one of the two dominant print color systems in Asia, offering over 1,050 colors.

**Key strengths:**
- Over 1,050 process and spot colors.
- Widely used in Japanese printing and packaging.
- Physical swatch guides available on coated and uncoated paper.
- Supported in Adobe Creative Suite and other design software.

**Best for:** Japanese printing, Asian packaging design, spot color specification.

**Converts to:** Approximate CMYK, sRGB (via software libraries).

## Notation & Structure
Colors are identified by Toyo catalog codes referencing process and spot colors, matched against physical swatch guides printed on coated and uncoated paper.

## Usage
Widely used in Japanese printing and packaging, and in Asian packaging design for spot color specification. Supported in Adobe Creative Suite and other design software; physical swatch guides accompany the digital catalog.

## Chromatics API
**Type:** `CatalogSystem`

**Static methods:**
- `Toyo.lookup(code)` -> `Color`
- `Toyo.nearest(color)` -> closest Toyo match

## Resources
- [Toyo Ink — Wikipedia](https://en.wikipedia.org/wiki/Toyo_Ink)
- [Toyo Ink — official site](https://www.toyoink.com)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

---
tags: [color-system, hue-system]
status: reference
updated: 2026-06-24
---

# Pantone Matching System (PMS)

> The world's most recognized color matching system for print and product design, assigning unique codes to spot colors for consistent reproduction.

## Overview

Introduced in 1963, the Pantone Matching System (PMS) is the world's most recognized color matching system for print and product design. It is a proprietary system that standardizes colors for printing and product design, assigning unique codes to ~1,867+ spot colors to ensure consistent reproduction.

**Key strengths:**
- Industry standard for brand colors
- Physical swatch books (coated / uncoated / matte)
- Cross-industry: graphic design, fashion, textiles, plastics, paint

**Limitations:** Proprietary — Pantone charges for color data and libraries.

**Best for:** Brand identity, spot color printing, and cross-industry color specification.

## Notation & Structure

Colors are referenced by a unique Pantone code, often with a suffix indicating the paper/collection finish, e.g. `185 C` (coated). Codes map to standardized spot colors reproduced via physical swatch books.

## Usage

Used across graphic design, brand identity, fashion, textiles, plastics, and paint. Physical swatch books are produced for coated, uncoated, and matte finishes. As a proprietary system, Pantone charges for its color data and libraries.

## Chromatics API

**Type:** `CatalogSystem`

**Static methods:**
- `Pantone.lookup('185 C')` -> `Color` (approximate sRGB)
- `Pantone.nearest(color)` -> `{ code, name, color, deltaE }`
- `Pantone.search('red')` -> search by name
- `Pantone.all(collection?)` -> list by collection (coated, uncoated, textile)

**DSL:** `PANTONE('185 C')` -> `Color`

**Note:** Pantone values are proprietary. Library can ship approximate sRGB mappings (community-sourced) with a disclaimer, or require users to provide their own data file.

## Resources

- [Pantone — Wikipedia](https://en.wikipedia.org/wiki/Pantone)
- [Pantone official site](https://www.pantone.com)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

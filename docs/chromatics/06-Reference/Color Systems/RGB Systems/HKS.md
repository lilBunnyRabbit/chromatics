---
tags: [color-system, rgb-system]
status: reference
updated: 2026-06-24
---

# HKS

> A European spot color system (Hostmann-Steinberg, Kast+Ehinger, Schmincke) — 120 base colors over 3,520 shades for print.

## Overview
HKS is a set of spot color standards used predominantly in European printing and graphic design. Named after its originators Hostmann-Steinberg, Kast+Ehinger, and Schmincke, it offers 120 base colors across 3,520 shades for print. It is the standard in German-speaking Europe (DACH region) and is best suited for European print production and packaging.

**Key strengths:**
- Standard in German-speaking Europe
- K (coated), N (uncoated), Z (newsprint), E (continuous) series
- Each base color shown in 9 tint steps

## Notation & Structure
Colors are specified by base number plus series suffix (e.g. `HKS 13 K`). Each base color is shown in 9 tint steps. Series: K (coated), N (uncoated), Z (newsprint), E (continuous).

## Usage
Standardized color reproduction used predominantly in European printing and graphic design — European print production (DACH region) and packaging.

## Chromatics API

**Type:** `CatalogSystem`

**Static methods:**
- `HKS.lookup('HKS 13 K')` -> `Color`
- `HKS.nearest(color)` -> closest HKS match
- `HKS.bySeries(series)` -> K (coated), N (uncoated), Z (newsprint), E (continuous)

## Resources
- [HKS (colour system) (Wikipedia)](https://en.wikipedia.org/wiki/HKS_(colour_system))

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

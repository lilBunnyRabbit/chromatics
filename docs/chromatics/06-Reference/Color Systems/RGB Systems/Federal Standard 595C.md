---
tags: [color-system, rgb-system]
status: reference
updated: 2026-06-24
---

# Federal Standard 595C

> The U.S. government's official color standard — ~650 colors for military equipment, government buildings, and federal procurement.

## Overview
Federal Standard 595C is the U.S. government's official color standard, defining a fixed palette of approximately 650 colors for military and industrial applications, government buildings, and federal procurement. It is best suited for U.S. military/government specification and defense contractor requirements.

## Notation & Structure
**Color coding:** a 5-digit number where the 1st digit indicates the finish type and the remaining digits identify the color (e.g. `36375`).

## Usage
Specifies a fixed palette for military and industrial applications — U.S. military/government specification and defense contractor requirements.

## Chromatics API

**Type:** `CatalogSystem`

**Static methods:**
- `FedStd595.lookup('36375')` -> `Color`
- `FedStd595.nearest(color)` -> closest match
- `FedStd595.byFinish(finish)` -> filter by gloss(1) / semi-gloss(2) / flat(3)

## Resources
- [Federal Standard 595 (Wikipedia)](https://en.wikipedia.org/wiki/Federal_Standard_595)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

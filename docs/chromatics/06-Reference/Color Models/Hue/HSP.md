---
tags: [color-model, hue]
status: reference
updated: 2026-06-24
---

# HSP

> Hue-Saturation-Perceived brightness -- like HSV but replaces Value with a weighted brightness (0.299R + 0.587G + 0.114B) that better matches human luminance perception.

## Overview
HSP (Hue–Saturation–Perceived brightness) is a variant of HSV that replaces Value with a perceived-brightness channel computed from Rec. 601 luminance weights. The P channel weights the RGB components (0.299R, 0.587G, 0.114B) so that the brightness measure better matches human luminance perception, making it a simpler alternative to a full CIE Lab conversion for brightness-aware work.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `H` | Hue | 0-360 | Position on the color wheel |
| `S` | Saturation | 0-1 | Color purity |
| `P` | Perceived brightness | 0-1 | Weighted luminance (Rec. 601 weights) |

## Characteristics
- P channel approximates actual perceived brightness (unlike V or L)
- Same P value across different hues looks similarly bright
- Useful for ensuring readability (text contrast) without full Lab conversion
- Simpler computation than CIE Lab while being much better than HSL/HSV
- **Formula:** P = sqrt(0.299R^2 + 0.587G^2 + 0.114B^2)
- **Best for:** Quick contrast checks, brightness-aware color adjustments, simpler alternative to Lab

## Conversions
- **Derived from:** RGB (with Rec. 601 luminance weights)
- **Converts to:** RGB

## Chromatics API
**Class:** `HSP` **extends** `HueModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `h` | `number` | 0-360 | `color.hsp_h` |
| `s` | `number` | 0-1 | `color.hsp_s` |
| `p` | `number` | 0-1 | `color.hsp_p` |

**DSL Constructor:** `HSP(h, s, p)` -> `Color`

**Model-specific methods:**
- `matchBrightness(target_p)` -> adjust to target perceived brightness, preserve hue
- `isBrighterThan(other)` -> compare perceived brightness
- `contrastQuick(other)` -> fast approximate contrast using P values

**Unique value:** P approximates perceived brightness without Lab conversion. Quick contrast checking.

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`

## Resources
- [HSP color model (Darel Rex Finley, alienryderflex.com)](http://alienryderflex.com/hsp.html)
- [Rec. 601 / luma coefficients - Wikipedia](https://en.wikipedia.org/wiki/Rec._601)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].* Related: [[HSV]], [[HSL]], [[HSI]].

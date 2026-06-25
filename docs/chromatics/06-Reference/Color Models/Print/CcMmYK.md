---
tags: [color-model, print]
status: reference
updated: 2026-06-24
---

# CcMmYK

> An extended CMYK adding light Cyan (c) and light Magenta (m) inks for smoother gradients and better skin tones in photo printing.

## Overview
CcMmYK is a variant of the CMYK model that adds extra diluted-ink channels — light Cyan (c) and light Magenta (m) — alongside the standard Cyan, Magenta, Yellow, and Key (black). The lighter inks fill the gap between paper white and the full-strength colored inks, giving finer control in highlight and midtone regions for enhanced color reproduction in specialized photo printing.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `C` | Cyan | 0-100% (0-1 normalized) | Full-strength cyan ink coverage. |
| `c` | Light Cyan | 0-100% (0-1 normalized) | Diluted cyan ink for smoother light tones. |
| `M` | Magenta | 0-100% (0-1 normalized) | Full-strength magenta ink coverage. |
| `m` | Light Magenta | 0-100% (0-1 normalized) | Diluted magenta ink for smoother light tones. |
| `Y` | Yellow | 0-100% (0-1 normalized) | Yellow ink coverage. |
| `K` | Key (Black) | 0-100% (0-1 normalized) | Black ink coverage. |

## Characteristics
- **Key strengths:**
  - Eliminates visible banding in light tones.
  - Much smoother skin tones and sky gradients.
  - Standard in 6-color photo inkjet printers.
- **Best for:** Photo printing, fine art reproduction, smooth gradient work.
- 6-channel model: an extended CMYK with two diluted ink channels.

## Conversions
- **Derived from:** CMYK (with diluted ink channels).
- **Converts to:** CMYK, RGB (via ICC).
- Conversion from CMYK auto-splits C/M into regular + light channels based on ink density thresholds.

## Chromatics API

**Class:** `CcMmYK` **extends** `SubtractiveModel`

**Model-specific methods:**
- `totalInkCoverage()` -> sum of all 6 channels
- `toCmyk()` -> merge light inks into regular (for standard 4-color press)

**Note:** 6-channel model. Conversion from CMYK auto-splits C/M into regular+light based on ink density thresholds.

## Resources
- [CcMmYK color model (Wikipedia)](https://en.wikipedia.org/wiki/CcMmYK_color_model)
- [CMYK color model (Wikipedia)](https://en.wikipedia.org/wiki/CMYK_color_model)
- [Bruce Lindbloom — color math reference](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CMYK]], [[CMY]], [[RGB]]

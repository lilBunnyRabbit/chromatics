---
tags: [color-model, print]
status: reference
updated: 2026-06-24
---

# CMY

> The subtractive color model -- Cyan, Magenta, Yellow absorb light from white, producing color by subtraction. The theoretical basis for all printing.

## Overview
CMY is a subtractive color model that represents colors using Cyan, Magenta, and Yellow ink percentages. It is used primarily in printing to simulate the mixing of inks: ideal cyan absorbs red light, magenta absorbs green light, and yellow absorbs blue light, so combining them subtracts wavelengths from white light. White is the absence of inks (the paper) and color is produced by subtraction. It forms the theoretical basis for many printing processes, and CSS does not directly support CMY, so values are typically converted to RGB for web display.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `C` | Cyan | 0-1 (also expressed 0-100%) | Cyan ink percentage; absorbs red light. Increasing it deepens the cyan tone. |
| `M` | Magenta | 0-1 (also expressed 0-100%) | Magenta ink percentage; absorbs green light. Increasing it deepens the magenta tone. |
| `Y` | Yellow | 0-1 (also expressed 0-100%) | Yellow ink percentage; absorbs blue light. Increasing it deepens the yellow tone. |
| `alpha` | Opacity | 0-1 | Controls transparency. |

## Characteristics
- **Best for:** Theoretical print color understanding, simple subtractive mixing, color reproduction analysis.
- **Typed Array:** Float32Array (provides fractional precision for percentage values).
- **Manipulations:** Color mixing (combining varying percentages of C, M, Y to produce a wide range of colors / simulate different ink proportions and tints); inversion to RGB (converting CMY values back to RGB by inverting each percentage).
- **CSS / String:** Typically converted to RGB for web display, as CSS does not directly support CMY.

## Conversions
- **Derived from:** RGB (complement: C=1-R, M=1-G, Y=1-B).
- **Converts to:** CMYK, RGB.
- **Direct conversion targets:** To/from CMYK, RGB.

## Chromatics API

**Class:** `CMY` **extends** `SubtractiveModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `c` | `number` | 0-1 | `color.cmy_c` |
| `m` | `number` | 0-1 | `color.cmy_m` |
| `y` | `number` | 0-1 | `color.cmy_y` |

**Model-specific methods:**
- `toCmyk(kStrategy?)` -> extract K channel (min, max, or custom)
- `complementary()` -> swap with RGB complement

## Resources
- [CMY color model (Wikipedia)](https://en.wikipedia.org/wiki/CMY_color_model)
- [BlackIce CMY/CMYK color space](https://www.blackice.com/colorspaceCYMK.htm)
- [Bruce Lindbloom — color math reference](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CMYK]], [[CcMmYK]], [[RGB]]

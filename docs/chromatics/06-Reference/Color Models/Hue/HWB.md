---
tags: [color-model, hue]
status: reference
updated: 2026-06-24
---

# HWB

> Describes color as a base Hue mixed with amounts of White and Black -- the most intuitive cylindrical model, matching how painters think about color mixing.

## Overview
HWB (Hue–Whiteness–Blackness) is a cylindrical color model introduced as a more intuitive alternative to HSL/HSV for blending a hue with white or black. Formally proposed by Alvy Ray Smith (with Eric Lyons) in 1996, it keeps the same hue angle as HSV/HSL but replaces the saturation/value axes with whiteness (W) and blackness (B). A color is described by taking a pure hue, mixing in some fraction of white and some fraction of black, with the remainder (1−W−B) being the pure-hue portion: **Color = (1−W−B)·Hue_color + W·White + B·Black**. If W + B ≥ 1, the result is a shade of gray (the hue is lost). Because any excess W+B clamps to gray, all HWB values map to a valid RGB color. It is conceptually simpler for users ("add x% white, y% black to this hue") but, like HSL/HSV, is not perceptually uniform and is tied to an RGB space (usually sRGB).

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `H` | Hue | 0-360 | Base color on the color wheel (0/360=red, 120=green, 240=blue) |
| `W` | Whiteness | 0-1 | Amount of white mixed in; higher = lighter/paler (W=1 = pure white) |
| `B` | Blackness | 0-1 | Amount of black mixed in; higher = darker (B=1 = pure black) |

## Characteristics
- Most intuitive cylindrical model: "start with a hue, add white or black"
- CSS Color Level 4 support via `hwb()` function
- Natural for creating tints (add W) and shades (add B)
- **Note:** W + B > 1 produces grays (the hue is lost); for chromatic colors W + B ≤ 1
- RGB ↔ HWB: whiteness = min(R,G,B), blackness = 1 − max(R,G,B)
- Not perceptually uniform; device-dependent (tied to sRGB)
- **Typed Array:** Float32Array
- **CSS / string:** `hwb(h w% b%)`; otherwise typically converted to RGB or HSL
- **Best for:** Intuitive color mixing, CSS `hwb()`, creating tint/shade scales

## Conversions
- **Derived from:** HSV (W = (1−S)·V, B = 1−V)
- **Converts to:** HSV, RGB, HSL
- **Direct conversion targets:** HWB ↔ RGB (mixture logic; RGB→HWB: W = min(R,G,B), B = 1−max(R,G,B)). HWB ↔ HSV easy (H same, W = (1−S)·V, B = 1−V). To/from RGB and HSL. No direct path to Lab or YUV except through RGB.

## Chromatics API
**Class:** `HWB` **extends** `HueModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `h` | `number` | 0-360 | `color.hwb_h` |
| `w` | `number` | 0-1 | `color.hwb_w` |
| `b` | `number` | 0-1 | `color.hwb_b` |

**DSL Constructor:** `HWB(h, w, b)` -> `Color`

**Model-specific methods:**
- `addWhite(amount)` -> raise W (tint)
- `addBlack(amount)` -> raise B (shade)
- `pureHue()` -> return with W=0, B=0 (pure hue at full saturation)
- `isGray()` -> W + B >= 1
- `toCSS()` -> `hwb(h w% b%)` string

**Unique value:** Most intuitive model for "add white" / "add black" operations. Direct CSS support.

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`

## Resources
- [HWB color model - Wikipedia](https://en.wikipedia.org/wiki/HWB_color_model)
- [hwb() - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb)
- [HWB: A more intuitive hue-based color model (Smith & Lyons, ResearchGate)](https://www.researchgate.net/publication/240035805_HWB-A_more_intuitive_hue-based_color_model)
- [Alvy Ray Smith - hwb2rgb paper](http://alvyray.com/Papers/CG/hwb2rgb.htm)
- [Day 30: the hwb() color function (Matuzović)](https://www.matuzo.at/blog/2022/100daysof-day30)
- [HWB - ColorAide documentation](https://facelessuser.github.io/coloraide/colors/hwb/)
- [Convert RGB to HWB color model (dirask)](https://dirask.com/snippets/JavaScript-convert-RGB-to-HWB-color-model-1XB6rp)
- [CSS Color Module Level 4 (W3C)](https://www.w3.org/TR/css-color-4/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].* Related: [[HSV]], [[HSL]], [[HSP]].

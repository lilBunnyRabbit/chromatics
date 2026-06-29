---
tags: [color-model, hue, critical]
status: reference
updated: 2026-06-24
---

# HSL

> The most widely used cylindrical color model for web design -- describes color as a Hue angle, Saturation level, and Lightness from black (0) through pure color (0.5) to white (1).

## Overview
HSL (Hue–Saturation–Lightness), also called HLS or sometimes HSI in some contexts, is a cylindrical-coordinate color model derived from sRGB. It was developed to align more closely with traditional artists' notions of tint, shade, and tone. Like HSV, it uses hue as the angle around the color wheel and saturation as the radial component; the difference is the third axis: Lightness is defined as the average of the maximum and minimum of R′,G′,B′ (i.e. (max + min)/2). L=0 is black, L=1 is white, and L=0.5 is the "pure" mid-value color. This produces the HSL "double cone" / bi-hexcone geometry: at L=0 and L=1 the space collapses to a point (black or white regardless of hue) and at L=0.5 it has its widest cross-section (fully saturated pure colors exist at L=0.5, S=1). Lightness controls the mixture with white/black, while Saturation controls mixture with gray of the same lightness. Formally described by Joblove and Greenberg in 1978 (who termed L "Intensity" and S "relative chroma").

HSL is intuitive for human understanding and manipulation, making it suitable for user interfaces. However, like HSV it is not perceptually uniform -- the same L value looks different across hues (e.g. a medium-lightness yellow looks much lighter than a blue at the same numeric L), because the formula is tied to RGB primaries and uncorrected for human-vision non-linearities.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `H` | Hue | 0-360 | Position on the color wheel (0=red, 120=green, 240=blue) |
| `S` | Saturation | 0-1 | Color intensity / colorfulness relative to lightness (0=gray, 1=vivid) |
| `L` | Lightness | 0-1 | Black(0) -> pure color(0.5) -> white(1); amount of light emitted/reflected |

## Characteristics
- Native CSS support via `hsl()` / `hsla()` functions
- Intuitive: L=0.5 is the "pure" version of any hue
- Easy to create tints (raise L), shades (lower L), and tones (lower S)
- Used in Adobe Illustrator, Inkscape, SVG, and color-scheming tools
- **Limitation:** NOT perceptually uniform -- same L values look different across hues
- **Typed Array:** Float32Array
- **CSS / string:** `hsl(h, s%, l%)` or `hsla(h, s%, l%, a)`
- **Best for:** CSS/web design, quick color adjustments, creating tint/shade ramps

## Conversions
- **Derived from:** sRGB (cylindrical transform)
- **Converts to:** RGB, HSV, HSI, HWB
- **Direct conversion targets:** HSL ↔ RGB (direct formulas, similar complexity to HSV). HSL ↔ HSV via explicit equations (both defined via RGB min/max). HSL ↔ HSI directly related. No direct path to YUV or Lab except via RGB.

## Chromatics API
**Class:** `HSL` **extends** `HueModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `h` | `number` | 0-360 | `color.h` |
| `s` | `number` | 0-1 | `color.s` |
| `l` | `number` | 0-1 | `color.l` |

**DSL Constructor:** `HSL(h, s, l)` -> `Color`

**Model-specific methods:**
- `tint(amount)` -> raise L toward 1 (add white)
- `shade(amount)` -> lower L toward 0 (add black)
- `tone(amount)` -> lower S toward 0 (add gray)
- `lighten(amount)` -> alias for tint
- `darken(amount)` -> alias for shade
- `saturate(amount)` -> raise S
- `desaturate(amount)` -> lower S
- `toCSS()` -> `hsl(h, s%, l%)` string

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`, `tetradic()`, `splitComplementary()`

**Priority:** High -- most familiar model for web developers, DSL primary hue manipulation space.

## Resources
- [HSL and HSV - Wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV)
- [HSL/HSV color conversion formulae - Wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV#Color_conversion_formulae)
- [Math behind colorspace conversions RGB-HSL (NIWA)](https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/)
- [HSL - colormath API docs](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-l/)
- [hsl() - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)
- [CSS Color Module Level 4 (W3C)](https://www.w3.org/TR/css-color-4/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].* Related: [[HSV]], [[HSI]], [[HWB]], [[HSLuv]].

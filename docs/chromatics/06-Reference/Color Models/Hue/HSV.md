---
tags: [color-model, hue]
status: reference
updated: 2026-06-24
---

# HSV

> The original cylindrical RGB model (Alvy Ray Smith, 1978), also called HSB -- Value represents the brightness of the brightest channel, making V=1 the "full brightness" version of a hue.

## Overview
HSV (Hue–Saturation–Value), also known as HSB (Hue–Saturation–Brightness), is a cylindrical-coordinate transformation of RGB designed to be more intuitive for humans. Imagining the RGB cube oriented on a corner (black at the bottom, white at the top), HSV uses polar coordinates in this cube: Hue is the angle around the vertical neutral axis (0°=red, 120°=green, 240°=blue), Value is the vertical axis (V=0 black, V=1 brightest), and Saturation is the radial distance from the neutral gray axis (S=0 gray, S=1 full vivid color). Mathematically, given R′,G′,B′ in [0,1]: Value V = max(R′,G′,B′); Saturation S = (V − min)/V (S=0 when V=0); Hue H is computed from which component is max and the difference of the others, yielding an angle in [0°,360°). Value is tied to the maximum channel (like shining a brighter light on a colored object), distinguishing it from HSL's Lightness.

HSV is intuitive for human understanding and manipulation, making it suitable for user interfaces. However it is not perceptually uniform -- equal numeric changes do not produce equal visual changes (e.g. at constant V, lowering saturation can still change perceived lightness), and the hue circle is not perceptually uniform.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `H` | Hue | 0-360 | Position on the color wheel (0°=red, 120°=green, 240°=blue) |
| `S` | Saturation | 0-1 | Color purity / colorfulness relative to value (0=white/gray, 1=vivid) |
| `V` | Value | 0-1 | Brightness (0=black, 1=full brightness); V = max(R,G,B) |

## Characteristics
- The default model for most color picker UIs (Photoshop, GIMP, etc.)
- Intuitive: V=1, S=1 gives the purest color
- Simple relationship with RGB: V = max(R, G, B)
- At V=1, S<1 gives a pastel/tint (white added); at V<1, S=1 gives a deep shade (black added)
- Introduced by Alvy Ray Smith (1978) as the efficient-to-compute "hexcone" model
- **Limitations:** NOT perceptually uniform; asymmetric -- V=1 can be vivid OR white depending on S
- **Typed Array:** Float32Array
- **CSS / string:** Not directly available in CSS; usually converted to RGB or HSL for display
- **Best for:** Color pickers, interactive color selection, graphics software

## Conversions
- **Derived from:** sRGB (cylindrical transform, 1978)
- **Converts to:** RGB, HSL, HSI, HWB
- **Direct conversion targets:** HSV ↔ RGB (straightforward, invertible). HSV ↔ HSL via direct formulas (both from the RGB cube). HSV ↔ HSI similarly related (HSI intensity is a function of V and S). No one-step conversion to Lab or YUV without going through RGB.

## Chromatics API
**Class:** `HSV` **extends** `HueModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `h` | `number` | 0-360 | `color.hsv_h` |
| `s` | `number` | 0-1 | `color.hsv_s` |
| `v` | `number` | 0-1 | `color.hsv_v` |

**DSL Constructor:** `HSV(h, s, v)` -> `Color`

**Model-specific methods:**
- `tint(amount)` -> lower S (desaturate toward white)
- `shade(amount)` -> lower V (darken toward black)
- `tone(amount)` -> lower S AND V proportionally
- `saturate(amount)` -> raise S
- `brighten(amount)` -> raise V

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`, `tetradic()`, `splitComplementary()`

## Resources
- [HSL and HSV - Wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV)
- [HSV - colormath API docs](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-v/)
- [Convert between RGB, YUV, HSV, CIE Lab... (Getreuer colorspace)](https://getreuer.info/posts/colorspace/)
- [CSS Color Module Level 4 (W3C)](https://www.w3.org/TR/css-color-4/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].* Related: [[HSL]], [[HSI]], [[HWB]], [[HSP]].

---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# RGB

> The foundational additive color model for all digital displays -- every screen pixel is a combination of Red, Green, and Blue light at varying intensities.

## Overview
RGB is an additive color model based on human trichromatic vision, using red, green, and blue primary light components. Colors are represented by a triplet (R, G, B) defining the intensities of these primaries, typically normalized between 0 and 1 (or 0–255 in 8-bit systems). Mathematically, RGB defines a 3D coordinate system (often visualized as a cube) where each axis corresponds to a primary color intensity. Combining full-intensity red, green, and blue yields white (additive mixing), while zero of all yields black. RGB differs from subtractive models (like CMYK) in that it describes emitted light rather than reflected light. Specific RGB *color spaces* (sRGB, Adobe RGB, etc.) further define the exact chromaticities and gamma corrections, but RGB as a model is device-dependent and not perceptually uniform.

RGB underpins electronic displays (monitors, TVs, projectors) and digital imaging. Each pixel in an LCD/OLED has sub-pixels emitting red, green, and blue light in varying intensities to produce colors, with direct hardware mapping to display pixels. It is the universal standard for image formats (PNG, JPEG), graphics APIs, and web design. Simple additive mixing applies: R+G = Yellow, R+B = Magenta, G+B = Cyan. Its strength is direct mapping to display hardware and a broad gamut for additive mixing. However, RGB is not intuitive for color selection (adjusting "red" and "green" sliders to get a desired orange is non-obvious) and not perceptually uniform (numerical differences don't linearly correspond to perceived differences) -- this led to models like HSL, HSV, and Lab.

Common variants include **RGB255** (8-bit, each channel an integer 0–255, the de facto digital screen standard, typed array `Uint8ClampedArray`) and **Normalized RGB** (each channel 0–1, ideal for internal calculations and conversions, typed array `Float32Array`).

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `r` | Red | 0–255 (8-bit) or 0–1 | Red light intensity |
| `g` | Green | 0–255 or 0–1 | Green light intensity |
| `b` | Blue | 0–255 or 0–1 | Blue light intensity |
| `alpha` | Opacity | 0–1 | 0 fully transparent; 1 fully opaque |

## Characteristics
- **Key strengths:** direct hardware mapping to display pixels (LCD/OLED subpixels); universal standard for image formats, graphics APIs, and the web; simple additive mixing (R+G=Yellow, R+B=Magenta, G+B=Cyan).
- Additive mixing: full R+G+B = white; zero of all = black; describes emitted (not reflected) light.
- Device-dependent and not perceptually uniform; specific spaces (sRGB, Adobe RGB) fix the chromaticities and gamma.
- **Typed arrays:** RGB255 uses `Uint8ClampedArray` (values clamped 0–255); Normalized RGB uses `Float32Array` (fractional values, smooth calculations).
- **CSS representations:** `rgb(r, g, b)` or `rgba(r, g, b, a)`.
- **Common manipulations:** contrast adjustment (scale differences around a midpoint); color inversion (255 − channel); brightness adjustment (add/subtract a constant across all channels, with clamping); color tinting (add to one or two channels); grayscale conversion (set all channels equal, often to the average); saturation adjustment (amplify/reduce difference from grayscale level); color balancing (adjust individual channel intensities to correct casts); linear blending / mixing (interpolate between two colors).
- **Best for:** display rendering, image storage, web development.

## Conversions
RGB is directly convertible with many models via explicit formulas: **RGB ↔ HSL**, **RGB ↔ HSV/HSB**, **RGB ↔ HSI**, **RGB ↔ HWB**, **RGB ↔ CMY/CMYK**, and **RGB ↔ YUV/YIQ/YCbCr/YPbPr** (defined linear transformations). It also converts to **CIE XYZ** through a linear combination specific to the primaries (often an intermediate step). Direct conversion targets for the variants: RGB255 ↔ Normalized RGB ↔ sRGB ↔ Linear sRGB, and via those to perceptual models like CIE Lab.

**Converts to:** HSL, HSV, HWB, CMY/CMYK, YUV/YCbCr, CIE XYZ.

## Chromatics API
**Class:** `RGB` **extends** `RGBModel` (abstract base for all RGB spaces)

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `r` | `number` | 0–255 | `color.r` |
| `g` | `number` | 0–255 | `color.g` |
| `b` | `number` | 0–255 | `color.b` |

**RGBModel shared methods:**
- `toHex()` -> `#rrggbb` string
- `blend(other, ratio)` -> blend in linear space (physically correct)
- `invert()` -> 255−r, 255−g, 255−b
- `grayscale()` -> luminance-weighted grayscale
- `luminance` -> WCAG relative luminance (0–1)
- `contrastWCAG(other)` -> contrast ratio
- `contrastAPCA(other)` -> APCA Lc value
- `meetsAA(other, size?)` -> boolean
- `meetsAAA(other, size?)` -> boolean
- `simulateCVD(type, severity?)` -> color blindness simulation

**Note:** `RGB` is the abstract base. Concrete spaces are `Srgb`, `AdobeRgb`, `DisplayP3`, etc.

## Resources
- [Wikipedia: RGB color model](https://en.wikipedia.org/wiki/RGB_color_model)
- [Wikipedia: RGB color spaces](https://en.wikipedia.org/wiki/RGB_color_spaces)
- [Colormath: RGB API](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b/) — Normalized/255 RGB conversions
- [Bruce Lindbloom — color math & RGB/XYZ matrices](http://www.brucelindbloom.com/)
- [Wikipedia: List of color spaces and their uses](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[sRGB]], [[Linear sRGB]], [[CIE XYZ]], [[HSL]].

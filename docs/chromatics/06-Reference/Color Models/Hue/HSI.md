---
tags: [color-model, hue]
status: reference
updated: 2026-06-24
---

# HSI

> Hue-Saturation-Intensity model where Intensity is the arithmetic mean of R, G, B -- making it uniquely suited for image processing and computer vision tasks.

## Overview
HSI (Hue–Saturation–Intensity) is a cylindrical-coordinate representation of points in an RGB color model, similar to HSL and HSV. It separates chromatic content (hue, saturation) from brightness by defining Intensity as the simple average of the components: *I = (R′ + G′ + B′) / 3*. Hue is the same angle in the RGB plane as in HSL/HSV, and Saturation is defined by how far the color is from a gray of the same intensity (one common formulation: *S = 1 – min(R′,G′,B′) / I* for I>0). Geometrically, the neutral axis runs from black to white through the center of the tilted RGB cube, and intensity is the projection of a color onto that neutral axis.

Because intensity treats all three RGB components equally (a true average) rather than weighting the extremes (HSL) or only the maximum (HSV), the I component is essentially the grayscale image of the color. This makes HSI popular in machine vision and remote sensing: I = (R+G+B)/3 is invariant to certain lighting changes, so pure changes in overall intensity affect I but not H or S, helping algorithms detect colored objects under varying illumination. Like HSL/HSV it is not perceptually uniform and has singularities at low intensity (hue undefined as the color approaches black, and when saturation is 0).

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `H` | Hue | 0-360 | Position on the color wheel; base color tone (0° red, 120° green, 240° blue) |
| `S` | Saturation | 0-1 | Color purity / colorfulness relative to brightness; distance from a gray of the same intensity (S=1 most extreme chroma, S=0 = gray) |
| `I` | Intensity | 0-1 | Average of R+G+B (total light energy); brightness level (I=0 black) |

## Characteristics
- Intensity represents total light energy, invariant to illumination direction
- Hue is independent of intensity -- useful for object recognition under varying lighting
- Better than HSL/HSV for image segmentation tasks
- The I channel is exactly the grayscale image (useful for edge detection, etc.)
- Differs from white/black handling of HSL: for white, I can be high but S=0
- Not perceptually uniform; singular at low intensity / zero saturation
- **Typed Array:** Float32Array (chosen for fractional precision)
- **CSS / string:** Not directly supported in CSS; typically converted to RGB or HSL for web usage
- **Best for:** Computer vision, image segmentation, color-based object detection, lighting-invariant analysis, remote sensing

## Conversions
- **Derived from:** RGB (I = (R+G+B)/3)
- **Converts to:** RGB, HSL, HSV
- **Direct conversion targets:** HSI ↔ RGB (formulas available, slightly more complex due to the different S definition: compute I = (R+G+B)/3, hue as in other models, then S). HSI ↔ HSV/HSL are interrelated (e.g. I = (2−S_HSL)·L given same hue); typically cascaded through RGB. No direct link to YUV or Lab without going through RGB.

## Chromatics API
**Class:** `HSI` **extends** `HueModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `h` | `number` | 0-360 | `color.hsi_h` |
| `s` | `number` | 0-1 | `color.hsi_s` |
| `i` | `number` | 0-1 | `color.hsi_i` |

**DSL Constructor:** `HSI(h, s, i)` -> `Color`

**Model-specific methods:**
- `tint(amount)` -> raise intensity toward 1
- `shade(amount)` -> lower intensity toward 0
- `tone(amount)` -> lower saturation toward 0
- `intensityNormalize()` -> adjust RGB so I matches without changing hue

**Unique value:** I = (R+G+B)/3 represents total light energy. Useful in vision algorithms where you want to separate "how much light" from "what color."

**Inherited:** `rotateHue()`, `complementary()`, `analogous()`, `triadic()`

## Resources
- [HSI color space - Wikipedia](https://en.wikipedia.org/wiki/HSI_color_space)
- [HSL and HSV - Wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV)
- [Converting RGB image to HSI (imageeprocessing.com)](https://www.imageeprocessing.com/2013/05/converting-rgb-image-to-hsi.html)
- [HSI-RGB color converter equations (had2know.org)](https://www.had2know.org/technology/hsi-rgb-color-converter-equations.html)
- [HSI Color Conversion (Black Ice Software)](https://www.blackice.com/colorspaceHSI.htm)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].* Related: [[HSL]], [[HSV]], [[RGB]].

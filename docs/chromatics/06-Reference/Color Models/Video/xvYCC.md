---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# xvYCC

> An extended-gamut video standard (IEC 61966-2-4) that expands YCbCr to ~1.8x sRGB gamut — used in HDMI x.v.Color.

## Overview
xvYCC is an extended-gamut video color model defined in IEC 61966-2-4. It extends the standard YCC/YCbCr gamut by using the available headroom and footroom of the YCbCr signal, expanding coverage to roughly 1.8× the sRGB gamut. This wider range is particularly beneficial for high-dynamic-range (HDR) content and is supported over HDMI 1.3+ as "x.v.Color". It remains backward compatible with standard decoders, which simply clip out-of-range values.

## Channels
| Channel | Full name | Range | Controls |
| --- | --- | --- | --- |
| `Y` | Luminance | 0–255 | Brightness of the color; increasing brightens the image |
| `C1` | Chrominance (blue projection) | -128 to +127 | Blue-related color bias |
| `C2` | Chrominance (red projection) | -128 to +127 | Red-related color bias |
| `alpha` | Opacity | 0–1 | Transparency |

## Characteristics
- Uses YCbCr headroom/footroom to reach a wider gamut (~1.8× sRGB).
- Backward compatible with standard decoders (they just clip).
- Supported in HDMI 1.3+ as "x.v.Color".
- **Typed Array:** Float32Array (chosen to accommodate negative chroma values and fractional precision).
- **Usage:** Video encoding, HDR broadcast, and applications requiring an extended color gamut.
- **Modifications:** Dynamic range expansion/adjustment — modify `Y` to change overall brightness while preserving chroma; chroma balancing — adjust `C1`/`C2` to fine-tune color differences.
- **CSS / String:** Typically converted to RGB for CSS display.
- **Best for:** Wide-gamut video over HDMI, consumer electronics.

## Conversions
- **Derived from:** YCbCr (extended range).
- **Converts to:** YCbCr, sRGB (gamut map).
- **Direct conversion targets:** To/from RGB and YCbCr.

## Chromatics API
**Class:** `XvYCC` **extends** `VideoModel`

**Note:** Extended YCbCr using headroom/footroom. Niche — include for HDMI x.v.Color compatibility.

## Resources
- [xvYCC — Wikipedia](https://en.wikipedia.org/wiki/XvYCC)
- [IEC 61966-2-4 (xvYCC) — IEC Webstore](https://webstore.iec.ch/publication/6171)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YCbCr]], [[sYCC]], [[Rec. 2100]].

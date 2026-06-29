---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# ICtCp

> A modern HDR-optimized color model (ITU-R BT.2100) using Intensity and two chroma components with PQ for 10,000 cd/m2 luminance range.

## Overview
ICtCp is a modern color model for HDR video, introduced by Dolby and standardized in ITU-R BT.2100 (HDR television). The acronym stands for Intensity (I), Chroma T (Ct), and Chroma P (Cp). It can be thought of as an improved Y'CbCr-like model that is more perceptually uniform, especially for wide color gamut and HDR content, separating intensity from two chrominance components in a perceptually uniform manner.

ICtCp is derived from an LMS representation: starting with linear Rec.2020 RGB, it applies a non-linear Perceptual Quantizer (PQ) or HLG curve (for HDR) to get nonlinear LMS', then a decorrelation matrix to get I, Ct, Cp. The I component is like luma (brightness), and Ct and Cp are two chroma components aligned approximately with the blue-yellow (Tritan) and red-green (Protan) color opponent axes of vision. The mathematical basis uses HPE LMS cone fundamentals and an opponent transform so that I, Ct, Cp are more perceptually uniform (particularly reducing hue linearity issues in highly saturated colors that YCbCr has). In effect, ICtCp aims for constant luminance (I is computed as a weighted sum of nonlinearly transformed LMS) and decouples color so that color volume can be better utilized and compression applied with fewer artifacts.

Because the human eye has lower acuity in chroma (especially in the Tritan blue-yellow axis), ICtCp's separation allows more efficient chroma subsampling or quantization with fewer perceptible errors. A given distortion in Ct or Cp is more consistently perceived across colors than in YCbCr, and changes in I affect brightness with minimal cross-talk into color (a flaw in Y'CbCr where luma included chroma crosstalk after gamma). Its weakness: more complex to compute than YCbCr (needs an LMS transform and a PQ EOTF) and relatively new, so not yet as widely supported in hardware. In practice, video encoders transform HDR content to ICtCp, compress, then inverse-transform for display. Dolby Vision uses ICtCp for internal color processing.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `I` | Intensity | 0-1 (PQ; maps 0-10,000 nits nonlinearly) | Perceptual brightness (PQ or HLG); constant luminance |
| `Ct` | Chroma tritan | ~-0.5 to 0.5 | Blue-yellow chrominance balance |
| `Cp` | Chroma protan | ~-0.5 to 0.5 | Red-green chrominance balance |
| `alpha` | Opacity | 0-1 | Transparency |

Note: Ct is aligned roughly with the Tritan (blue vs yellow) axis; Cp roughly with the Protan (red vs green) axis. Together (Ct, Cp) describe hue and saturation and can be converted to a chroma magnitude and hue angle (polar coordinates). The axes are optimized rather than the exact classical opponent axes.

## Characteristics
- Designed for HDR/WCG content from human perceptual concepts.
- Better chroma subsampling than YCbCr for HDR.
- Part of ITU-R BT.2100; constant-luminance representation.
- More perceptually uniform than YCbCr: a given distance in (Ct, Cp) is closer to constant ΔE, especially for HDR intensities.
- Typed array: Float32Array.
- HDR adjustments: alter `I` for luminance; modify `Ct` and `Cp` for precise color balance.
- CSS/string: typically converted to RGB for display.
- Best for: HDR video encoding, Dolby Vision, HDR10+, Rec. 2100 workflows.

## Conversions
- **Derived from:** LMS (via PQ or HLG).
- **Converts to:** LMS, CIE XYZ, JzAzBz.
- **ICtCp <-> LMS:** decorrelation matrix from non-linear L'M'S' to ICtCp; invert matrix then invert PQ to return to linear LMS.
- **ICtCp <-> Rec.2020 YCbCr:** not a single standard step; typically via LMS/linear RGB (e.g. YCbCr (PQ) -> RGB (PQ) -> LMS' -> ICtCp).
- **ICtCp <-> XYZ:** via LMS and linear RGB; no single common direct formula.
- Also lists direct targets: to/from RGB, YCbCr, and other HDR-friendly formats.

## Chromatics API
**Class:** `ICtCp` **extends** `VideoModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `I` | `number` | 0-1 | `color.ictcp_i` |
| `Ct` | `number` | varies | `color.ictcp_ct` |
| `Cp` | `number` | varies | `color.ictcp_cp` |

**Model-specific methods:**
- `deltaEitp(other)` -> ITU-R BT.2124 color difference for HDR
- `chromaSubsample(mode)` -> better chroma subsampling than YCbCr for HDR
- `transferFunction()` -> 'PQ' or 'HLG' depending on encoding

**Unique value:** HDR video encoding with perceptually aligned chroma channels. Better than YCbCr for HDR compression.

## Resources
- [ICtCp - Wikipedia](https://en.wikipedia.org/wiki/ICtCp)
- [List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses)
- [Dolby ICtCp white paper (Hill et al.)](https://professional.dolby.com/siteassets/pdfs/ictcp_dolbywhitepaper_v071.pdf)
- [colormath: ICtCp API](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-i-ct-cp/)
- ITU-R BT.2100 (2018) - standard including ICtCp (matrix coefficients, constant-luminance HDR representation)
- ITU-R BT.2124 - ΔEITP color difference for HDR
- [Bjorn Ottosson - Oklab](https://bottosson.github.io/posts/oklab/) (cites ICtCp as inspiration for perceptual uniformity)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YCbCr]], [[CIE XYZ]], [[Oklab]]

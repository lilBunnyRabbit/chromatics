---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# ISO-CIE

> A collection of ISO/CIE joint standards defining foundational colorimetry — standard observers, illuminants, CIELAB, CIELUV, and CIEDE2000.

## Overview
ISO-CIE refers to a collection of standardized color encoding methods and colorimetry standards defined jointly by the International Organization for Standardization (ISO) and the International Commission on Illumination (CIE). These include foundational models such as CIE XYZ, CIE Lab, and CIE Luv, as well as standard observers, standard illuminants, and the CIEDE2000 color-difference formula. They serve as the foundational references for accurate color reproduction and conversion.

**Best for:** Reference standard for all colorimetric work, industrial measurement.

## Notation & Structure
This category comprises multiple models, each with its own set of parameters:
- CIE XYZ has `X`, `Y`, `Z`.
- CIE Lab has `L`, `a`, `b`.
- CIE Luv and others define their own components.

- **Typed Array:** Varies by model (typically Float32Array for perceptual models).
- **CSS / String Representation:** Not directly represented in CSS; usually converted to RGB or HSL for display.
- **Direct Conversion Targets:** Standard conversions exist between CIE XYZ, CIE Lab, CIE Luv, etc.
- **Modifications:** Model-specific — each encoding offers unique adjustments specific to its representation.

## Usage
Fundamental in device calibration, scientific color analysis, and inter-model conversions in industrial and research settings. Specifically used for industrial color measurement and production.

## Chromatics API
**Note:** Standards collection, not a system to implement. Defines the specifications that CIE Lab, CIE Luv, deltaE2000, standard observers, and illuminants follow.

## Resources
- [Color space — Wikipedia](https://en.wikipedia.org/wiki/Color_space)
- [CIE — International Commission on Illumination (official site)](https://cie.co.at)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*

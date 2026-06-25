---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# ACES

> The Academy Color Encoding System -- a master color framework for cinema with AP0 primaries that encompass the entire visible gamut, serving as the archival interchange standard for film.

## Overview
The Academy Color Encoding System (ACES) is a color space and set of related workflows for the cinema and visual effects industries, developed by the Academy of Motion Picture Arts and Sciences. It is designed for high-fidelity color in cinema and VFX, facilitating color interchange and digital image preservation across a wide color gamut and high dynamic range. ACES is scene-referred with linear encoding that preserves full dynamic range, and its AP0 primaries encompass the entire CIE visible gamut. The ACES family flows ACES2065-1 (AP0) -> ACEScg (AP1, CGI) -> ACEScc/ACEScct (log, grading).

## Channels

| Channel | Full name | Range | Controls |
| ------- | --------- | ----- | -------- |
| `r` | Red (ACES encoding) | 0-1 | Increasing `r` intensifies red in a wide gamut space |
| `g` | Green | 0-1 | Adjusts green intensity |
| `b` | Blue | 0-1 | Adjusts blue intensity |
| `alpha` | Opacity | 0-1 | Controls transparency |

## Characteristics
- **Key strengths:** AP0 primaries encompass the entire CIE visible gamut; scene-referred linear encoding preserving full dynamic range; industry-standard interchange format for motion pictures.
- **ACES family:** ACES2065-1 (AP0) -> ACEScg (AP1, CGI) -> ACEScc/ACEScct (log, grading). For rendering use ACEScg; for grading use ACEScc/ACEScct.
- **Typed Array:** Float32Array (for high precision in wide-gamut calculations).
- **Manipulation -- Wide Gamut Adjustments:** Scale/adjust channels to work within the ACES gamut for high-fidelity color grading in film and video production.
- **CSS / String:** Converted to sRGB or RGB255 for display on standard devices.
- **Best for:** Film production archival, color interchange between VFX houses, high-end visual effects, scenarios demanding a wide dynamic range.

## Conversions
- **Converts to:** ACEScg, ACEScc, ACEScct, CIE XYZ.
- **Direct conversion targets:** ACEScc, ACEScct, ACEScg, and via conversion chains to RGB and perceptual models.

## Chromatics API
**Class:** `Aces` **extends** `RGBModel`

**Model-specific methods:**
- `toAcescg()` -> convert to ACEScg (AP0 -> AP1)
- `toAcescc()` -> convert to ACEScc (AP0 -> AP1 + log)

**Note:** AP0 primaries encompass ALL visible colors. Scene-referred linear. For rendering use ACEScg; for grading use ACEScc/ACEScct.

## Resources
- [ACES on Wikipedia](https://en.wikipedia.org/wiki/Academy_Color_Encoding_System)
- [ACES Overview -- Oscars.org Science & Technology](https://www.oscars.org/science-technology/aces)
- [ACES Central](https://acescentral.com)
- [colormath ACES color space](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-s.html)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[ACEScg]], [[ACEScc]], [[ACEScct]], [[CIE XYZ]].

---
tags: [color-model, perceptual, critical]
status: reference
updated: 2026-06-24
---

# LMS

> A physiological color space modeling the responses of the three cone types in the human retina -- Long (~560nm), Medium (~530nm), Short (~420nm) wavelength cones.

## Overview
LMS represents colors in terms of the stimulation of the three types of cone photoreceptors in the human eye. The name comes from L (long-wavelength sensitive cones, peak ~560 nm, the "red" cones), M (medium-wavelength, peak ~530 nm, "green" cones), and S (short-wavelength, peak ~420 nm, "blue" cones). An LMS space is essentially a linear transform of CIE XYZ, since the XYZ color matching functions were originally derived from human cone responses. There is no single "LMS" definition; it depends on which cone fundamentals are used (Stockman & Sharpe fundamentals are common in modern color science; CAT02 LMS from CIECAM02 is another common variant). L, M, S values are proportional to the rate of quantal catch in each cone type.

LMS is a physiologically-based model, closer to raw visual stimuli than perceptual spaces (Lab) and tied to human biology rather than device primaries (RGB). It is not meant to be uniform or intuitive for picking colors; designers rarely tweak LMS values manually. Instead it is used for vision-related computations such as chromatic adaptation and color blindness simulation. The space is linear, so adding two lights' LMS values gives the LMS of the mixture -- one reason it underpins adaptation. A variant, CAT02 LMS (from CIECAM02), is scaled for that appearance model.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `l` | Long cone response (~560 nm, "red") | 0-1+ (nonnegative; often normalized so reference white = 1 or 100) | Higher L relative to M/S shifts toward redder/magenta colors |
| `m` | Medium cone response (~530 nm, "green") | 0-1+ | High M relative to L/S shifts toward greenish/green-cyan |
| `s` | Short cone response (~420 nm, "blue") | 0-1+ | High S relative to others shifts toward bluish/violet |

Values are not bounded to [0,1] unless normalized by white; sometimes scaled to 0-255 or arbitrary units.

## Characteristics
- Directly models human vision biology (cone photoreceptor responses)
- Foundation for chromatic adaptation transforms (Bradford, Von Kries; Von Kries 1902 hypothesis assumes each LMS channel adapts independently)
- Basis for Oklab, IPT, and other modern perceptual spaces
- Used as the LMS intermediate in the ICtCp HDR space (HPE LMS cone fundamentals)
- Essential for color blindness (CVD) simulation -- e.g. to simulate protanopia, reduce/zero the L channel and convert back
- Not uniform or intuitive; for computation/analysis, not manual selection
- **Best for:** Color appearance modeling, chromatic adaptation, color blindness simulation, vision science

## Conversions
- **Derived from:** CIE XYZ (3x3 matrix)
- **Converts to:** CIE XYZ, Oklab, IPT
- **LMS ↔ XYZ:** linear 3×3 matrix per chosen cone fundamentals; inverse converts LMS back to XYZ. Example (Stockman & Sharpe 2000, D65; CAT02-style):

  | | X | Y | Z |
  |---|---|---|---|
  | L | 0.4002 | 0.7076 | -0.0808 |
  | M | -0.2263 | 1.1653 | 0.0457 |
  | S | 0 | 0 | 0.9182 |

- **LMS ↔ RGB:** map linear RGB -> XYZ -> LMS (as done in color appearance models for adaptation)
- **LMS ↔ ICtCp:** ICtCp uses an HPE-transformed LMS as an intermediate
- No direct LMS↔Lab path; route LMS -> XYZ -> Lab

## Chromatics API
**Class:** `LMS` **extends** `ColorModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `l` | `number` | 0-1+ | `color.lms_l` |
| `m` | `number` | 0-1+ | `color.lms_m` |
| `s` | `number` | 0-1+ | `color.lms_s` |

**Model-specific methods:**
- `simulateCVD(type, severity?)` -> simulate color blindness (protanopia, deuteranopia, tritanopia)
- `adaptVonKries(srcWP, dstWP)` -> Von Kries chromatic adaptation (diagonal scaling)
- `adaptBradford(srcWP, dstWP)` -> Bradford adaptation

**Unique value:** The only model where color blindness simulation is a simple matrix multiply. Essential for accessibility features.

**Priority:** High -- powers CVD simulation and chromatic adaptation.

## Resources
- [LMS color space — Wikipedia](https://en.wikipedia.org/wiki/LMS_color_space)
- [LMS colour space — lightcolourvision.org](https://lightcolourvision.org/dictionary/definition/lms-colour-space/)
- [Dolby ICtCp white paper (PDF)](https://professional.dolby.com/siteassets/pdfs/ictcp_dolbywhitepaper_v071.pdf)
- [Color Blindness Simulation Research — ixora.io](https://ixora.io/projects/colorblindness/color-blindness-simulation-research/)
- [colour-science.org — chromatic adaptation transforms](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CIE XYZ]], [[Oklab]], [[IPT]]

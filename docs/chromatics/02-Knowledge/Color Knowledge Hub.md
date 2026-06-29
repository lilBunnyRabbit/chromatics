---
tags: [moc, knowledge]
status: living
updated: 2026-06-24
---

# Color Knowledge Hub

This is the distilled, organized index of the color research I have collected over time. The original sprawling `old/` dump has been cleaned up and folded into a single structured encyclopedia under `06-Reference`; the raw originals are preserved in my Obsidian vault. What lives here is the curated map: every color model, color system, and research note, each reachable in one hop with a one-line essence for the load-bearing entries.

> [!info] Tier legend
> Notes are mentally tagged by how load-bearing they are:
> - **Critical** -- core to the library; everything else routes through these (e.g. [[sRGB]], [[Linear sRGB]], [[CIE XYZ]], [[Oklab]], [[Oklch]], [[Display P3]], [[HSL]], [[CIE Lab]]).
> - **Standard** -- commonly used, worth first-class support (most RGB spaces, perceptual spaces, hue models, the major color systems).
> - **Niche** -- historical, specialized, or academic; documented for completeness (legacy broadcast models, obscure national color standards, impossible colors).

---

## Color Models

*While many color models provide the conceptual framework, color spaces are their defined implementations -- with specified primaries, white points, and transfer functions -- for consistent color reproduction.*

### Hue (Hue-Centric Models)

*Models whose coordinates are expressed in cylindrical form with a hue (angle) as a primary component.*

- [[HSL]] -- The most widely used cylindrical color model for web design -- color as a Hue angle, Saturation, and Lightness from black (0) through pure color (0.5) to white (1). **(Critical)**
- [[HSV]]
- [[HSI]]
- [[HSP]]
- [[HWB]]
- [[HCL]]
- [[HCT]]
- [[HSLuv]]
- [[HPLuv]]

### RGB (RGB Light Models)

*Colors as combinations of red, green, and blue light -- the basis of most digital color spaces. Defined RGB spaces set specific primaries, white points, and transfer functions.*

- [[RGB]]
- [[sRGB]] -- The standard RGB color space for the web and consumer displays (IEC 61966-2-1): specific primaries, a D65 white point, and a ~2.2 gamma curve. **(Critical)**
- [[Linear sRGB]] -- sRGB with the gamma curve removed -- values proportional to physical light, making it correct for color math like blending, interpolation, and compositing. **(Critical)**
- [[Display P3]] -- Apple's adaptation of DCI P3 for consumer displays -- wide primaries with sRGB's D65 white point and ~2.2 gamma, now standard on modern Apple devices. **(Critical)**
- [[Adobe RGB]]
- [[DCI P3]]
- [[ProPhoto RGB]]
- [[Rec. 709]]
- [[Rec. 2020]]
- [[scRGB]]
- [[SMPTE-C]]
- [[RG Chromaticity]]
- [[ACES]]
- [[ACEScc]]
- [[ACEScct]]
- [[ACEScg]]

### Perceptual (Device-Independent Perceptual Models)

*Models independent of specific devices that -- often through nonlinear transforms -- approximate perceptual uniformity.*

- [[CIE XYZ]] -- The foundational color space of modern colorimetry (CIE 1931); derived from human color-matching experiments, it serves as the universal interchange hub between all other color spaces. **(Critical)**
- [[CIE Lab]] -- The workhorse of industrial color measurement (CIELAB, 1976) -- cube-root compression of XYZ approximating perceptual uniformity, making delta-E distances meaningful. **(Critical)**
- [[Oklab]] -- A modern perceptual color space (Bjorn Ottosson, 2020) that fixes CIE Lab's problems -- better uniformity in blues, improved lightness prediction, simpler math. **(Critical)**
- [[Oklch]] -- The cylindrical form of Oklab -- the best modern choice for perceptually uniform color manipulation, with native CSS support and excellent hue uniformity. **(Critical)**
- [[CIE xyY]]
- [[CIE Lch]]
- [[CIE Luv]]
- [[LCHab]]
- [[LCHuv]]
- [[CIE 1960 UCS]]
- [[CIE 1976 UCS]]
- [[UVW]]
- [[HLC]]
- [[HunterLAB]]
- [[LMS]]
- [[IPT]]
- [[JzAzBz]]
- [[JzCzHz]]
- [[CIECAM02]]
- [[CAM16]]
- [[CAM16-UCS]]
- [[OSA-UCS]]

### Video & Broadcast (Signal Encoding Models)

*Tailored for video encoding and broadcast, often separating luminance and chrominance for efficient compression.*

- [[YUV]]
- [[YIQ]]
- [[YCbCr]]
- [[YPbPr]]
- [[YCgCo]]
- [[YCoCg-R]]
- [[YDbDr]]
- [[YJK]]
- [[ICtCp]]
- [[sYCC]]
- [[xvYCC]]
- [[Rec. 601]]
- [[Rec. 2100]]
- [[NTSC]]
- [[PAL]]
- [[SECAM]]

### Print (Printing / Subtractive & Colorimetric Models)

*Used primarily in printing and for quantifying color differences.*

- [[CMY]]
- [[CMYK]]
- [[CcMmYK]]

> [!note] Munsell, NCS, RAL, Hexachrome are catalogued as **color systems**, not models — see the Color Systems section below.

### Other (Specialized Models)

*A catch-all for models that don't fit neatly into the above groups.*

- [[GL]]
- [[iCAM]]
- [[Impossible Color]]
- [[RG Color Models]]
- [[RYB]]
- [[TSL]]
- [[XYB]]

---

## Color Systems

*Standardized, often physical, collections of named or coded colors for communication and reproduction.*

### Hue Systems

- [[Munsell Color System]]
- [[NCS (Natural Color System)]]
- [[Pantone Matching System (PMS)]]
- [[RYB Color System]]

### RGB Systems

- [[ANSI Color System]]
- [[British Standard Colour (BS)]]
- [[DIC Color System]]
- [[Federal Standard 595C]]
- [[HKS]]

### Other Systems

- [[ANPA]]
- [[AS 2700]]
- [[CNS]]
- [[COPIC]]
- [[ColorADD]]
- [[Coloroid]]
- [[Colour Index International]]
- [[DIN 6164]]
- [[Focoltone]]
- [[Hexachrome]]
- [[ICC profile]]
- [[ISCC-NBS]]
- [[ISO-CIE]]
- [[Ostwald Color System]]
- [[PCCS (Practical Color Coordinate System)]]
- [[RAL]]
- [[SCOTDIC]]
- [[Toyo Color Finder]]
- [[Trumatch]]
- [[Werner's Nomenclature of Colours]]

---

## Research & Algorithms

The applied, implementation-facing notes -- the math and architecture behind a color library.

- [[Conversion Pipeline]] -- The master conversion graph showing how to get from ANY color model to ANY other through the minimal conversion chain -- the library's architectural backbone.
- [[Color Model Conversions]] -- The full conversion graph across every color model the library tracks, grouped by family, with direct conversion edges and implementation-status styling.
- [[Transfer Functions]] -- Every gamma curve, EOTF, and OETF a color library needs -- the nonlinear functions that bridge linear light and encoded signal values.
- [[Chromatic Adaptation]] -- How to convert colors between illuminants (white points) -- essential when crossing spaces like sRGB (D65) and ICC Lab (D50).
- [[Gamut Mapping]] -- What to do when a color exists in one space but not another -- strategies for mapping out-of-gamut colors, including the CSS Color Level 4 algorithm.
- [[Color Interpolation]] -- How to blend, interpolate, and create gradients between colors -- why the space matters dramatically, and how to handle hue wrapping and alpha.
- [[Color Difference Formulas]] -- All major color difference formulas quantifying how different two colors appear -- essential for QC, gamut mapping, and palette evaluation.
- [[Color Harmony Algorithms]] -- The algorithms behind harmony rules -- how to compute complementary, triadic, analogous, and other relationships, and which space to do it in.
- [[Contrast and Accessibility]] -- The algorithms behind contrast checking, WCAG compliance, APCA, and color blindness simulation -- core features for any modern color tool.
- [[CSS Color Specification]] -- CSS Color Level 4 and 5 syntax reference -- every color function, relative color syntax, and new feature a web-facing library should support.
- [[Existing Library Analysis]] -- Competitive analysis of existing color libraries -- what they do well, what they miss, and where chromatics fits.

---

## Synthesized knowledge

The higher-level, hand-written companions that turn this reference encyclopedia into usable guidance.

- [[Color Models]] -- overview and selection guidance across the model families above.
- [[Color Science & Algorithms]] -- the synthesized science layer tying the research notes together.
- [[Accessibility]] -- contrast, WCAG/APCA, and color-vision-deficiency guidance.
- [[Library Landscape]] -- the ecosystem of existing tools and where chromatics sits.
- [[Color Theory]]
- [[Brand Color Design]]
- [[Resources]]

---

Back to [[Home]].

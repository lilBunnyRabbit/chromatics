---
tags: [color-model, print]
status: reference
updated: 2026-06-24
---

# CMYK

> The standard printing color model -- adds Black (Key) to CMY for deeper darks, cost savings, and sharper text rendering.

## Overview
CMYK is a subtractive color model used in color printing, based on absorbing (masking) light using pigments. It extends the CMY model (cyan, magenta, yellow — the complements of the RGB primaries) by adding a **K (black / Key)** component, which is essential for practical printing. Ideal cyan absorbs red, magenta absorbs green, and yellow absorbs blue, so combining them subtracts wavelengths from white light. The K component accounts for black ink because mixing 100% C, M, Y in real inks produces a muddy dark brown rather than a true black; black ink also improves shadow depth, sharpens text, and is more economical than laying down all three colored inks.

White is the absence of inks (the paper color) and black is achieved by full ink coverage. Mathematically the idealized CMYK can be seen as an inverted RGB (C=1-R, M=1-G, Y=1-B under normalized [0,1] values), with K commonly defined as K=min(C,M,Y). CMYK is device-dependent (results vary with printer profiles, ink formulations, and paper), has a smaller gamut than typical RGB spaces, and is not intuitive for picking hues (designers often pick in Pantone or Lab and convert). CSS does not natively support CMYK, so values are typically converted to RGB for display. ICC profiles map device-independent spaces (CIE Lab D50, the Profile Connection Space) to CMYK for accurate reproduction. The four-color process was introduced for color comic strips around the 1890s.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `C` | Cyan | 0-100% (0-1 normalized) | Cyan ink coverage; absorbs red light. Higher cyan = more red absorption (looks greenish-blue). |
| `M` | Magenta | 0-100% (0-1 normalized) | Magenta ink coverage; absorbs green light. Higher magenta = purplish/red cast. |
| `Y` | Yellow | 0-100% (0-1 normalized) | Yellow ink coverage; absorbs blue light. Higher yellow = more yellow/orange. |
| `K` | Key (Black) | 0-100% (0-1 normalized) | Black ink coverage; adds neutral density, darkens the color and reduces saturation. |
| `alpha` | Opacity | 0-1 | Controls transparency. |

## Characteristics
- **Best for:** Print production, packaging, offset printing, books, magazines — any physical color output where pigments are laid on paper.
- **Typed Array:** Float32Array.
- **Strengths:** Aligns with how inks mix; wider tonal range and better shadow depth via black; more economical than achieving darks with C+M+Y alone.
- **Limitations:** Device-dependent (varies with printer profile, ink, paper); smaller gamut than typical RGB; many vivid RGB colors cannot be reproduced exactly.
- **GCR / UCR:** When K is added, C, M, Y may be reduced to compensate (gray component replacement). E.g., a medium gray may be 0C 0M 0Y 50K rather than 50% of each.
- **Manipulations:** Tint/shade adjustment (changing K shifts darkness; C, M, Y adjust hue and saturation); color separation (splitting images into individual color components including black for printing).
- **CSS / String:** Typically converted to RGB since CSS does not natively support CMYK.

## Conversions
- **Derived from:** CMY (with K extraction).
- **Converts to:** CMY, RGB (approximate).
- **CMY ↔ RGB:** Direct by inversion (idealized inks, no gamma: C=1-R, M=1-G, Y=1-B).
- **CMYK ↔ RGB:** Formula-based given a K strategy; one common formula: K=1-max(R,G,B), then C=(1-R-K)/(1-K), etc. (when 1-K > 0).
- **CMY ↔ CMYK:** Compute a K (typically the minimum, or a desired black level) and subtract it out; reverse by adding K back into C, M, Y.
- **Note:** No direct analytic conversions to HSL/HSV/CIE Lab without going through RGB or an intermediary colorimetric space; professional workflows use ICC profiles / lookup tables (CMYK ⇄ Lab/XYZ via the Profile Connection Space), not a single formula.

## Chromatics API

**Class:** `CMYK` **extends** `SubtractiveModel`

**Channels:**
| Property | Type | Range | DSL accessor |
|----------|------|-------|-------------|
| `c` | `number` | 0-1 | `color.cmyk_c` |
| `m` | `number` | 0-1 | `color.cmyk_m` |
| `y` | `number` | 0-1 | `color.cmyk_y` |
| `k` | `number` | 0-1 | `color.cmyk_k` |

**DSL Constructor:** `CMYK(c, m, y, k)` -> `Color`

**Model-specific methods:**
- `totalInkCoverage()` -> c+m+y+k (printing constraint, max ~300-340%)
- `gcrReplace(amount)` -> gray component replacement (shift CMY toward K)
- `ucrReplace()` -> under color removal
- `richBlack()` -> create a rich black (e.g., 60C 40M 40Y 100K)
- `isOverInked(limit?)` -> totalInkCoverage > limit

## Resources
- [CMYK color model (Wikipedia)](https://en.wikipedia.org/wiki/CMYK_color_model)
- [Why is black designated by the letter K in CMYK? (Color Vision Printing)](https://www.colorvisionprinting.com/blog/why-is-the-color-black-designated-by-the-letter-k-in-cmyk)
- [List of color spaces and their uses (Wikipedia)](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses)
- [ICC Profiles (IBM docs)](https://www.ibm.com/docs/en/i/7.4?topic=management-icc-profiles)
- [Profile Connection Space — ICC profile series (Color Sherlock's Journal)](https://printcolormanagement.wordpress.com/2012/09/24/profile-connection-space-pcs-part-2-of-icc-profile-series/)
- [colormath CMYK API (ajalt)](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-c-m-y-k/)
- [Bruce Lindbloom — color math reference](http://www.brucelindbloom.com/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[CMY]], [[CcMmYK]], [[RGB]]

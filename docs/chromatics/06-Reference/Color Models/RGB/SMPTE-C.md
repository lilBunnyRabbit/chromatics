---
tags: [color-model, rgb]
status: reference
updated: 2026-06-24
---

# SMPTE-C

> An RGB color space from SMPTE for early HDTV (SMPTE 240M), with primaries close to NTSC but improved transfer function -- largely superseded by Rec. 709.

## Overview
SMPTE-C (SMPTE 240M) is an RGB color space defined by SMPTE for early HDTV systems. It uses primaries close to NTSC standards but with an improved, more accurate transfer function, and a D65 white point. It served as a historical bridge between NTSC and modern HDTV and contributed to the development of Rec. 709, by which it has been mostly superseded. It is often associated with NTSC variants.

## Characteristics
- **Key strengths:** Historical bridge between NTSC and modern HDTV; defined more accurate primaries than original NTSC; contributed to the development of Rec. 709.
- **Primaries:** R(0.630, 0.340), G(0.310, 0.595), B(0.155, 0.070). **White point:** D65.
- **Best for:** Legacy broadcast compatibility, archival media conversion.

## Conversions
- **Converts to:** Rec. 709, sRGB, CIE XYZ.

## Chromatics API
**Class:** `SmpteC` **extends** `RGBModel`

**Note:** Legacy broadcast space, superseded by Rec. 709. Include for archival media conversion. Minimal API -- just conversion to/from sRGB.

## Resources
- [SMPTE C / NTSC variants on Wikipedia](https://en.wikipedia.org/wiki/NTSC#SMPTE_C)
- [NTSC on Wikipedia](https://en.wikipedia.org/wiki/NTSC)
- [Bruce Lindbloom -- RGB working space information](http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html)
- [colour-science.org](https://www.colour-science.org/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[Rec. 709]], [[sRGB]], [[CIE XYZ]].

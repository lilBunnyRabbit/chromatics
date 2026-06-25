---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# PAL

> The Phase Alternating Line color television standard (Germany, 1963) — fixes NTSC's color consistency problems by alternating the phase of one chroma component on each line.

## Overview
PAL (Phase Alternating Line) is the European analog color television standard, introduced in Germany in 1963. It improves on NTSC by alternating the phase of the V chroma signal on alternate lines, so that phase errors cancel out when averaged, automatically correcting hue errors. The result is more consistent color than NTSC, at a small cost in vertical color resolution.

## Characteristics
- **Key specifications:**
  - 625 scan lines, 25 fps (50 Hz interlaced).
  - Uses the YUV color model.
  - Color subcarrier at 4.433619 MHz.
  - Phase alternation on the V component eliminates hue errors.
- **Key strengths:**
  - More color-accurate than NTSC (automatic hue error correction).
  - Dominated Europe, Australia, most of Asia, Africa, and South America.
- **vs NTSC:** PAL alternates the phase of the V chroma signal on alternate lines so phase errors cancel out when averaged — more consistent color at a small cost in vertical color resolution.
- **Coverage:** UK, Germany, Australia, most of Western Europe, China, India, Brazil.
- **Superseded by:** DVB (Digital Video Broadcasting).

## Conversions
- Defines YUV encoding with phase alternation; see [[YUV]] for the color model.

## Chromatics API
**Note:** Broadcast standard, not a convertible model. Defines YUV encoding with phase alternation. See `YUV` for the color model.

## Resources
- [PAL — Wikipedia](https://en.wikipedia.org/wiki/PAL)
- [YUV — Wikipedia](https://en.wikipedia.org/wiki/YUV)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YUV]], [[NTSC]], [[SECAM]], [[Rec. 601]].

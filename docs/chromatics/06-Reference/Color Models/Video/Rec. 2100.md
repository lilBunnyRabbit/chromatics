---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# Rec. 2100

> The ITU standard for HDR television (BT.2100) — extends Rec. 2020's gamut with HDR transfer functions (PQ and HLG).

## Overview
Rec. 2100 (ITU-R BT.2100) is the ITU-R standard for HDR and Ultra-HD television. It builds on Rec. 2020's wide color gamut and adds high-dynamic-range transfer functions — PQ (Perceptual Quantizer) and HLG (Hybrid Log-Gamma) — detailing the color spaces and transfer functions used by modern HDR/UHD video formats.

## Characteristics
- **Key strengths:**
  - PQ (Perceptual Quantizer): 0–10,000 cd/m², absolute luminance.
  - HLG (Hybrid Log-Gamma): relative, backward-compatible with SDR.
  - Foundation for HDR10, HDR10+, Dolby Vision, and HLG broadcast.
- **Gamut:** Rec. 2020.
- **Best for:** HDR video production, streaming, broadcast.

## Conversions
- **Converts to:** ICtCp, Rec. 2020, sRGB (tone mapping).

## Chromatics API
**Note:** HDR encoding spec. Uses Rec. 2020 primaries + PQ or HLG transfer function. Relates to `ICtCp` and `Rec2020` classes.

## Resources
- [Rec. 2100 — Wikipedia](https://en.wikipedia.org/wiki/Rec._2100)
- [ITU-R BT.2100 — ITU](https://www.itu.int/rec/R-REC-BT.2100)
- [ICtCp — Wikipedia](https://en.wikipedia.org/wiki/ICtCp)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[Rec. 2020]], [[ICtCp]], [[Rec. 601]].

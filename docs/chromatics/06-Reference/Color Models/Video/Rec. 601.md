---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# Rec. 601

> The ITU standard for SD television color encoding (BT.601) — defines YCbCr coefficients for 525-line (NTSC) and 625-line (PAL/SECAM).

## Overview
Rec. 601 (ITU-R BT.601) is the standard-definition video color space used in broadcast television. It defines Y-Cb-Cr (YCbCr) encoding parameters for standard-definition broadcast, covering both 525-line (NTSC) and 625-line (PAL/SECAM) systems.

## Characteristics
- **Luma weights:** Y = 0.299R + 0.587G + 0.114B.
- Defines YCbCr parameters for SD broadcast television (525-line NTSC and 625-line PAL/SECAM).
- **Best for:** SD video encoding, DVD authoring, legacy broadcast.

## Conversions
- **Converts to:** RGB, Rec. 709 (which uses different luma weights).

## Chromatics API
**Note:** Standard definition encoding spec. Uses YCbCr with specific luma weights (0.299, 0.587, 0.114). Not a separate class — use `YCbCr.withWeights('bt601')`.

## Resources
- [Rec. 601 — Wikipedia](https://en.wikipedia.org/wiki/Rec._601)
- [ITU-R BT.601 — ITU](https://www.itu.int/rec/R-REC-BT.601)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YCbCr]], [[Rec. 709]], [[Rec. 2100]], [[NTSC]].

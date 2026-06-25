---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# SECAM

> The Sequential Color with Memory television standard (France, 1967) — transmits chroma channels one at a time using FM modulation for complete immunity to phase errors.

## Overview
SECAM (Sequential Color with Memory) is the French analog color television standard, introduced in 1967. Instead of transmitting both chroma channels simultaneously, it sends them sequentially — Db on one line, Dr on the next — using FM modulation rather than AM. This gives complete immunity to differential phase errors and avoids cross-color artifacts between the chroma channels, at the cost of lower vertical chroma resolution.

## Characteristics
- **Key specifications:**
  - 625 scan lines, 25 fps (50 Hz interlaced).
  - Uses the YDbDr color model.
  - Chroma transmitted sequentially: Db on one line, Dr on the next.
  - FM modulation (not AM like NTSC/PAL) for chroma.
- **Key strengths:**
  - Complete immunity to differential phase errors (FM modulation).
  - No cross-color artifacts between Db and Dr channels.
  - Simple decoder design.
- **vs PAL:** PAL corrects phase errors by averaging; SECAM avoids them entirely by using FM and sequential transmission. Trade-off: lower vertical chroma resolution.
- **Coverage:** France, Russia, former Soviet states, parts of Africa and the Middle East.
- **Superseded by:** DVB and DVB-T2.

## Conversions
- Defines YDbDr encoding with FM modulation; see [[YDbDr]] for the color model.

## Chromatics API
**Note:** Broadcast standard, not a convertible model. Defines YDbDr encoding with FM modulation. See `YDbDr` for the color model.

## Resources
- [SECAM — Wikipedia](https://en.wikipedia.org/wiki/SECAM)
- [YDbDr — Wikipedia](https://en.wikipedia.org/wiki/YDbDr)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YDbDr]], [[PAL]], [[NTSC]].

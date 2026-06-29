---
tags: [color-model, video]
status: reference
updated: 2026-06-24
---

# YDbDr

> The SECAM television color model -- used in French and former Soviet analog broadcasting with FM modulation for immunity to phase errors.

## Overview
YDbDr is a color standard used in some analog video systems (particularly in Europe) that represents color differences. It is the SECAM television color model, used in French and former Soviet analog broadcasting, employing FM modulation for immunity to phase errors.

## Channels
| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `Y` | Luma (luminance) | Varies | Brightness |
| `Db` | Blue color-difference | Varies | Blue chrominance |
| `Dr` | Red color-difference | Varies | Red chrominance |

## Characteristics
- SECAM analog broadcast color model.
- FM modulation provides immunity to phase errors.
- Best for: legacy SECAM video processing, historical broadcast.

## Conversions
- **Derived from:** YUV (scaled).
- **Converts to:** RGB, YUV.

## Chromatics API
**Class:** `YDbDr` **extends** `VideoModel`

**Note:** SECAM legacy. Include for SECAM archival conversion. Minimal unique API.

## Resources
- [YDbDr - Wikipedia](https://en.wikipedia.org/wiki/YDbDr)
- [SECAM - Wikipedia](https://en.wikipedia.org/wiki/SECAM)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[YUV]], [[YIQ]], [[YCbCr]]

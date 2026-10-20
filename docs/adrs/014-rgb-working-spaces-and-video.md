# ADR-014: RGB working spaces and video

**Date:** 2026-10-20
**Status:** Accepted

## Context

The parity table's RGB and video rows: ACES, scRGB, SMPTE-C, Rec. 2100, and the studio's twelve video ids. Sources and decisions are in the [brainstorm](../brainstorm/2026-10-18-own-color-library.md), grills 68–71 and the model specifics after them. Free primaries exist for nearly everything: the Academy specs (S-2008-001, S-2014-003/004, S-2016-001), SMPTE 170M-2004, the FCC rule, ITU-R BT.470/601/709/2020/2100 and ITU-T H.273. Only the IEC scRGB / sYCC / xvYCC documents are paywalled.

## Decision

- **ACES:**
  - `Aces2065` (`aces2065-1`, AP0), `Acescg` (AP1), `Acescc` and `Acescct` (log encodings of AP1).
  - The ACES white is adapted to D65 with Bradford (ACES CTL, OCIO, color.js). `Acescg` ↔ `Aces2065` uses the spec's matrix with no adaptation.
  - The log curves mirror negatives around lin 0 and aren't capped at 65504 (grill 70). Every value round-trips.
- **SMPTE-C:** `SmpteC` (`smpte-c`), 170M §4 primaries, §5 transfer curve, mirrored for negatives.
- **Rec. 2100 (grill 71):** `Rec2100Pq` and `Rec2100Hlg`, RGB on BT.2020 primaries. Relative Y = 1 is 203 cd/m² for PQ and HLG 0.75, as in `Ictcp` / `IctcpHlg`.
- **YCbCr (grill 68):**
  - Three classes: `Ycbcr601`, `Ycbcr709`, `Ycbcr2020`.
  - Float form, Y 0–1, Cb/Cr ±0.5 with no offset (H.273 eq. 45–47).
  - Each is a matrix over encoded RGB: `Srgb` for 601 / 709, `Rec2020` for 2020.
- **Other video:**
  - `Yiq` and `Yuv` use SMPTE 170M Annex A's precise values.
  - `Ydbdr` comes from BT.470-6 Table 2.
  - `Ycgco` uses H.273 eq. 51–53.
  - All of these sit over `Srgb`.
- **Duplicates (grill 69):** no class. scRGB → `LinearSrgb`; sYCC / rec601 / YPbPr → `Ycbcr601`; xvYCC → `Ycbcr709`; SECAM → `Ydbdr`. YCgCo-R waits for integer-coded models.

## Alternatives Considered

- **ACES without adaptation:** the studio's approach. It keeps ACES white warm on a D65 display, which is ACES's "D60 sim" output intent, not a colorimetric conversion.
- **CAT02 for ACES:** colour-science's default. The ACES CTL and OCIO use Bradford.
- **Spec-faithful ACES clamps:** lossy (grill 70).
- **One `Ycbcr` class with a weights factory:** grill 68.
- **Alias subclasses or re-exports for the duplicates:** grill 69.
- **One PQ-only `Rec2100`:** grill 71.
- **SMPTE-C as gamma 2.2:** colour-science's choice, citing the paywalled RP 145. 170M is free and normative for the curve.

## Consequences

- These models deliberately diverge from the studio:
  - ACES gains Bradford.
  - SMPTE-C gains a transfer curve.
  - Rec. 2100 white moves from 10 000 to 203 cd/m².
  - YIQ moves from culori's digits to 170M's (about 4e-4).
  - YCbCr loses its 0.5 offset.
  The migration maps them; none touches the brand golden hexes (sRGB).
- The log, PQ and HLG decodes are exponential, so their totality sweep stays in the reference ranges (`realistic: 1`).

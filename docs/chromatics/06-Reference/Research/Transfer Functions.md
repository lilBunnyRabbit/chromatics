---
tags: [research, transfer-functions]
status: reference
updated: 2026-06-24
---

# Transfer Functions

## By Claude Code

**Every gamma curve, EOTF, and OETF your color library needs -- the nonlinear functions that bridge linear light and encoded signal values.**

---

## sRGB (IEC 61966-2-1)

Piecewise function, NOT pure gamma 2.2.

**Encode (linear → sRGB):**
```
if C ≤ 0.0031308:  C_srgb = 12.92 × C
else:               C_srgb = 1.055 × C^(1/2.4) - 0.055
```

**Decode (sRGB → linear):**
```
if C ≤ 0.04045:  C_linear = C / 12.92
else:             C_linear = ((C + 0.055) / 1.055)^2.4
```

---

## Pure Gamma

| Space | Gamma (γ) | Encode | Decode |
|-------|-----------|--------|--------|
| Adobe RGB | 2.19921875 | C^(1/γ) | C^γ |
| ProPhoto RGB | 1.8 | C^(1/γ) | C^γ |
| DCI P3 (theater) | 2.6 | C^(1/γ) | C^γ |

**Note:** Display P3 uses sRGB's transfer function, NOT 2.6.

---

## BT.709 / BT.601

Nearly identical to sRGB (difference ~0.04%).

```
Encode: if C < 0.018:  4.500 × C    else: 1.099 × C^0.45 - 0.099
Decode: if C < 0.081:  C / 4.500    else: ((C + 0.099) / 1.099)^(1/0.45)
```

---

## PQ (Perceptual Quantizer / ST 2084)

HDR: 0 to 10,000 cd/m². Used in HDR10, Dolby Vision, Rec. 2100.

```
Encode:
  Y = C_linear / 10000
  N = (c1 + c2 × Y^m1) / (1 + c3 × Y^m1)
  C_pq = N^m2

  m1 = 0.1593017578125
  m2 = 78.84375
  c1 = 0.8359375
  c2 = 18.8515625
  c3 = 18.6875
```

---

## HLG (Hybrid Log-Gamma / BT.2100)

HDR for broadcast, backward-compatible with SDR.

```
Encode:
  if C ≤ 1/12:  √(3 × C)
  else:          a × ln(12C - b) + c

  a = 0.17883277,  b = 0.28466892,  c = 0.55991073
```

---

## Implementation Checklist

| Function | Required for |
|----------|-------------|
| sRGB encode/decode | sRGB, Display P3 |
| Gamma 2.2 | Adobe RGB |
| Gamma 1.8 | ProPhoto RGB |
| Gamma 2.6 | DCI P3 theater |
| BT.709 | Rec. 709 (or treat as sRGB) |
| PQ | Rec. 2100 PQ, HDR10, JzAzBz |
| HLG | Rec. 2100 HLG, broadcast |
| Linear (identity) | Linear sRGB, ACEScg, scRGB |

**Performance tip:** For sRGB, use a 256-entry LUT for 8-bit decode or polynomial approximation for hot paths.

---

## References

- IEC 61966-2-1, ITU-R BT.709-6, ITU-R BT.2100-2
- SMPTE ST 2084, ARIB STD-B67

## Resources

- [IEC 61966-2-1 (sRGB)](https://webstore.iec.ch/publication/6169)
- [ITU-R BT.2100 (PQ and HLG)](https://www.itu.int/rec/R-REC-BT.2100)
- [SMPTE ST 2084 (PQ)](https://ieeexplore.ieee.org/document/7291452)
- [Bruce Lindbloom - companding](http://www.brucelindbloom.com/index.html?Eqn_RGB_to_XYZ.html)

---

See also: [[Color Science & Algorithms]] · [[Color Knowledge Hub]] · [[Conversion Pipeline]] · [[Color Model Conversions]] · [[Display P3]]

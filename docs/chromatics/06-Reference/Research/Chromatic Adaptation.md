---
tags: [research, chromatic-adaptation]
status: reference
updated: 2026-06-24
---

# Chromatic Adaptation

## By Claude Code

**How to convert colors between illuminants (white points) -- essential when converting between spaces like sRGB (D65) and ICC Lab (D50).**

---

## When You Need It

| From | To | White point change |
|------|----|--------------------|
| sRGB (D65) | CIE Lab ICC (D50) | D65 → D50 |
| ProPhoto RGB (D50) | sRGB (D65) | D50 → D65 |
| ACES (D60) | sRGB (D65) | D60 → D65 |

Same white point (e.g., sRGB → Rec. 709, both D65) = no adaptation needed.

---

## The Process

```
XYZ_adapted = M⁻¹ · diag(M·XYZ_dest_white / M·XYZ_src_white) · M · XYZ_source
```

---

## Bradford Transform (Recommended Default)

The ICC standard. Uses a sharpened blue channel.

```
M = [ 0.8951000  0.2664000  -0.1614000]
    [-0.7502000  1.7135000   0.0367000]
    [ 0.0389000 -0.0685000   1.0296000]
```

---

## CAT16 (For CAM16/HCT)

Fixes CAT02's negative value issues.

```
M = [ 0.401288  0.650173  -0.051461]
    [-0.250268  1.204414   0.045854]
    [-0.002079  0.048952   0.953127]
```

---

## Von Kries (Simplest)

Diagonal scaling in LMS.

```
M = [ 0.40024  0.70760  -0.08081]
    [-0.22630  1.16532   0.04570]
    [ 0.00000  0.00000   0.91822]
```

---

## Standard White Points (XYZ, Y=1)

| Illuminant | X | Y | Z | CCT | Use |
|-----------|---|---|---|-----|-----|
| A | 1.09850 | 1.00000 | 0.35585 | 2856K | Incandescent |
| D50 | 0.96422 | 1.00000 | 0.82521 | 5003K | ICC profiles, ProPhoto |
| D55 | 0.95682 | 1.00000 | 0.92149 | 5503K | Mid-morning daylight |
| D65 | 0.95047 | 1.00000 | 1.08883 | 6504K | sRGB, Rec.709, displays |
| D75 | 0.94972 | 1.00000 | 1.22638 | 7504K | North sky daylight |
| E | 1.00000 | 1.00000 | 1.00000 | 5454K | Equal energy (theoretical) |
| F2 | 0.99186 | 1.00000 | 0.67393 | 4230K | Cool white fluorescent |
| F11 | 1.00962 | 1.00000 | 0.64350 | 4000K | Philips TL84 |

---

## Implementation Tips

1. **Default to Bradford** for D65↔D50 (ICC compatibility)
2. **Use CAT16** if implementing CAM16 or HCT
3. **Pre-compute** the combined matrix for common pairs (D65↔D50)
4. **Cache** M⁻¹ since it's constant

---

## References

- ICC Specification (ISO 15076-1)
- CIE 160:2004 - Chromatic adaptation review
- Li et al. (2017) - CAM16 and CAT16
- http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html

## Resources

- [Bruce Lindbloom - Chromatic Adaptation](http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html)
- [ICC.1:2022 Specification (ISO 15076-1)](https://www.color.org/specification/ICC.1-2022-05.pdf)
- [CIE Standard Illuminants](https://cie.co.at/data-tables)

---

See also: [[Color Science & Algorithms]] · [[Color Knowledge Hub]] · [[Conversion Pipeline]] · [[Color Model Conversions]] · [[Oklab]]

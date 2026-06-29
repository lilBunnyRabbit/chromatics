---
tags: [research, conversion-pipeline]
status: reference
updated: 2026-06-24
---

# Conversion Pipeline

## By Claude Code

**The master conversion graph showing how to get from ANY color model to ANY other through the minimal conversion chain -- your library's architectural backbone.**

---

## The Hub: CIE XYZ

CIE XYZ is the universal interchange point. Every color space can convert to/from XYZ.

```
                              CIE XYZ (D65)
                            /    |    \     \
                    LMS    CIE xyY  CIE Lab  CIE Luv
                   / |  \          / \        / \
              Oklab IPT CAM16  CIE LCh  LCHuv  HSLuv
               |              (LCHab)    |       |
             Oklch              |      LCHuv   HPLuv
                              HLC
                              HCL
```

---

## RGB Conversion Chain

```
sRGB (gamma) ←→ Linear sRGB ←→ CIE XYZ (D65)
                                    ↕ (Bradford D65↔D50)
                              CIE XYZ (D50)
                                    ↕
                              CIE Lab (D50, ICC)

Adobe RGB (gamma 2.2) ←→ Linear Adobe RGB ←→ CIE XYZ (D65)
ProPhoto (gamma 1.8) ←→ Linear ProPhoto ←→ CIE XYZ (D50)
Display P3 (sRGB gamma) ←→ Linear P3 ←→ CIE XYZ (D65)
Rec. 2020 (BT.709 gamma) ←→ Linear 2020 ←→ CIE XYZ (D65)
```

**Pattern:** Every RGB space follows: Encoded → Linear → XYZ via a 3x3 matrix.

---

## Cylindrical RGB Conversions

These are purely mathematical transforms of sRGB (no XYZ needed):

```
sRGB ←→ HSL
sRGB ←→ HSV (HSB)
sRGB ←→ HWB
sRGB ←→ HSI
sRGB ←→ HSP

HSV ←→ HSL (direct formulas exist)
HSV ←→ HWB (W = (1-S)×V, B = 1-V)
```

---

## Video Model Conversions

```
sRGB ←→ YUV (matrix multiply)
sRGB ←→ YCbCr (matrix + offset, Rec. 601 or 709 weights)
sRGB ←→ YPbPr (matrix multiply)
sRGB ←→ YIQ (matrix multiply, NTSC weights)
sRGB ←→ YDbDr (matrix multiply, SECAM weights)
sRGB ←→ YCgCo (add/subtract only)
```

---

## Perceptual Model Conversions

```
CIE XYZ → CIE Lab:  cube-root transform (with white point)
CIE Lab → CIE LCh:  polar coordinates (C=√(a²+b²), h=atan2(b,a))
CIE XYZ → CIE Luv:  via u',v' chromaticity
CIE Luv → LCHuv:    polar coordinates
CIE XYZ → LMS:      3x3 matrix
LMS → Oklab:         cube root + 3x3 matrix
Oklab → Oklch:       polar coordinates
LMS → IPT:           power function + 3x3 matrix
CIE XYZ → JzAzBz:   via PQ transfer + LMS
CIE XYZ → CAM16:    via LMS + adaptation + appearance correlates
```

---

## Key 3x3 Matrices

### sRGB Linear → CIE XYZ (D65)
```
[ 0.4123908   0.3575843   0.1804808 ]
[ 0.2126390   0.7151687   0.0721923 ]
[ 0.0193308   0.1191950   0.9505322 ]
```

### CIE XYZ (D65) → sRGB Linear
```
[  3.2409699  -1.5373832  -0.4986108 ]
[ -0.9692436   1.8759675   0.0415551 ]
[  0.0556301  -0.2039770   1.0569715 ]
```

### Display P3 Linear → CIE XYZ (D65)
```
[ 0.4865709   0.2656677   0.1982173 ]
[ 0.2289746   0.6917385   0.0792869 ]
[ 0.0000000   0.0451134   1.0439444 ]
```

### Linear sRGB → LMS (Oklab)
```
[ 0.4122214708  0.5363325363  0.0514459929 ]
[ 0.2119034982  0.6806995451  0.1073969566 ]
[ 0.0883024619  0.2817188376  0.6299787005 ]
```

### LMS^(1/3) → Oklab
```
[ 0.2104542553  0.7936177850 -0.0040720468 ]
[ 1.9779984951 -2.4285922050  0.4505937099 ]
[ 0.0259040371  0.7827717662 -0.8086757660 ]
```

---

## Shortest Conversion Paths

| From | To | Path |
|------|----|------|
| sRGB | Oklch | sRGB → linear → LMS → Oklab → Oklch |
| HSL | CIE Lab | HSL → sRGB → linear → XYZ → Lab |
| Display P3 | sRGB | P3 → linear P3 → XYZ → linear sRGB → sRGB (+ gamut map) |
| CMYK | Oklch | CMYK → sRGB (approx) → linear → LMS → Oklab → Oklch |
| ProPhoto | sRGB | ProPhoto → linear → XYZ(D50) → Bradford → XYZ(D65) → linear sRGB → sRGB |
| HCT | sRGB | HCT → CAM16 J,C,h → XYZ → linear sRGB → sRGB |

---

## Architecture Recommendations

1. **Implement XYZ as your internal hub** -- every space converts to/from XYZ
2. **Add direct shortcuts** for common hot paths (sRGB↔Oklab, sRGB↔HSL)
3. **Lazy conversion:** Only compute the target space, don't convert to all spaces eagerly
4. **Cache linear RGB** when doing multiple conversions from the same source
5. **Separate concerns:** Transfer function (gamma) is distinct from primaries (matrix)
6. **Use Float64** for intermediate XYZ/LMS values (precision matters in long chains)

---

## References

- Lindbloom - http://www.brucelindbloom.com/ (comprehensive matrices)
- CSS Color Level 4 - Predefined color spaces section - https://www.w3.org/TR/css-color-4/
- Ottosson (2020) - Oklab derivation and matrices - https://bottosson.github.io/posts/oklab/
- Fairchild (2013) - "Color Appearance Models" (CAM conversions)

## Resources

- [Bruce Lindbloom - RGB/XYZ matrices](http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html)
- [CSS Color Module Level 4 - sample conversion code](https://drafts.csswg.org/css-color-4/#color-conversion-code)
- [Colour Science for Python](https://www.colour-science.org/)

---

See also: [[Color Science & Algorithms]] · [[Color Knowledge Hub]] · [[Transfer Functions]] · [[Chromatic Adaptation]] · [[Color Model Conversions]] · [[Oklch]] · [[Oklab]] · [[Display P3]]

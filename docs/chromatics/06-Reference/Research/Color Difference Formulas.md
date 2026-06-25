---
tags: [research, color-difference]
status: reference
updated: 2026-06-24
---

# Color Difference Formulas

## By Claude Code

**All major color difference formulas used to quantify how different two colors appear to humans -- essential for QC, gamut mapping, and palette evaluation.**

---

## ΔE76 (CIE 1976)

Euclidean distance in CIE Lab.

```
ΔE76 = √((L₁-L₂)² + (a₁-a₂)² + (b₁-b₂)²)
```

**Pros:** Fast, simple | **Cons:** Overweights blues, underweights yellows

| ΔE76 | Meaning |
|------|---------|
| 0-1 | Not perceptible to most people |
| 1-2 | Perceptible through close observation |
| 2-10 | Perceptible at a glance |
| 11-49 | More similar than opposite |
| 100 | Exactly opposite |

---

## ΔE94 (CIE 1994)

Adds weighting for lightness, chroma, and hue.

```
ΔE94 = √((ΔL/(kL·SL))² + (ΔC/(kC·SC))² + (ΔH/(kH·SH))²)

SL = 1
SC = 1 + 0.045·C₁*  (graphic arts)  or  1 + 0.048·C₁* (textiles)
SH = 1 + 0.015·C₁*  (graphic arts)  or  1 + 0.014·C₁* (textiles)
kL = 1 (graphic arts) or 2 (textiles)
kC = kH = 1
```

**Cons:** Asymmetric -- ΔE94(a,b) ≠ ΔE94(b,a)

---

## ΔECMC (CMC l:c)

Ellipsoidal tolerance from the Society of Dyers and Colourists. Typically l:c = 2:1 for acceptability.

```
ΔECMC = √((ΔL/(l·SL))² + (ΔC/(c·SC))² + (ΔH/SH)²)

SL = 0.040975·L₁*/(1+0.01765·L₁*)   if L₁* ≥ 16, else 0.511
SC = 0.0638·C₁*/(1+0.0131·C₁*) + 0.638
SH = SC·(F·T + 1 - F)
F = √(C₁*⁴/(C₁*⁴ + 1900))
T = 0.56 + |0.2·cos(h₁+168°)|    if 164° ≤ h₁ ≤ 345°
    0.36 + |0.4·cos(h₁+35°)|     otherwise
```

---

## ΔE2000 (CIEDE2000)

The gold standard. Fixes blue non-linearity, adds rotation term, better weighting.

```
ΔE00 = √((ΔL'/(kL·SL))² + (ΔC'/(kC·SC))² + (ΔH'/(kH·SH))²
         + RT·(ΔC'/(kC·SC))·(ΔH'/(kH·SH)))

Key corrections:
1. a* axis stretched by factor depending on chroma (fixes blue)
2. Rotation term RT for blue-purple region
3. Better lightness weighting SL = 1 + 0.015·(L̄'-50)² / √(20+(L̄'-50)²)
4. SC = 1 + 0.045·C̄'
5. SH = 1 + 0.015·C̄'·T

T = 1 - 0.17·cos(h̄'-30°) + 0.24·cos(2h̄') + 0.32·cos(3h̄'+6°) - 0.20·cos(4h̄'-63°)
RT = -sin(2Δθ)·RC
   Δθ = 30·exp(-((h̄'-275°)/25)²)
   RC = 2·√(C̄'⁷/(C̄'⁷+25⁷))
```

**Implementation note:** 25⁷ = 6,103,515,625. Use `Math.pow(meanC, 7) / (Math.pow(meanC, 7) + 6103515625)`.

---

## ΔEok (Oklab Euclidean)

Euclidean distance in Oklab. Surprisingly competitive with ΔE2000 for screen colors.

```
ΔEok = √((L₁-L₂)² + (a₁-a₂)² + (b₁-b₂)²)
```

**Pros:** Trivial, fast | **Cons:** Not ISO standard
**When to use:** Web/screen where simplicity > industrial precision. CSS Color 4 uses Oklch for gamut mapping.

---

## Choosing a Formula

| Context | Formula |
|---------|---------|
| Quick screen comparison | ΔEok |
| General purpose | ΔE2000 |
| Textile industry | ΔECMC 2:1 |
| Paint/coatings | ΔE2000 |
| CSS/web gamut mapping | ΔEok |
| Legacy | ΔE76 |

**JND:** ΔE ≈ 1.0 in ΔE2000 ≈ 1 just noticeable difference. ~2.0 is "acceptable" in most industries.

---

## References

- CIE 142-2001, ISO/CIE 11664-6:2014 (CIEDE2000)
- Sharma, Wu, Dalal (2005) - "The CIEDE2000 Color-Difference Formula"
- https://en.wikipedia.org/wiki/Color_difference
- Ottosson (2020) - "A perceptual color space for image processing" (Oklab): https://bottosson.github.io/posts/oklab/
- Culori difference API: https://culorijs.org/api/#difference

---

See also: [[Color Science & Algorithms]] · [[Color Knowledge Hub]] · [[Oklab]] · [[CIE Lab]] · [[Oklch]]

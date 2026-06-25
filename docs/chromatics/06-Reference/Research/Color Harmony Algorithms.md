---
tags: [research, color-harmony]
status: reference
updated: 2026-06-24
---

# Color Harmony Algorithms

## By Claude Code

**The algorithms behind color harmony rules -- how to compute complementary, triadic, analogous, and other relationships, and which color space to do it in.**

---

## Which Space to Compute In

| Space | Hue uniformity | Recommendation |
|-------|---------------|----------------|
| HSL | Poor (yellow is tiny, blue is huge) | Avoid for harmonies |
| Oklch | Excellent | Best general choice |
| CIE LCh | Good | Good alternative |
| HCT | Excellent | Best for Material Design |

**Rule:** Always compute harmonies in a perceptually uniform space. A 180° complement in HSL is NOT a true perceptual complement.

---

## Classic Harmonies

All angles are hue rotations from the base color.

### Complementary
```
complement = base_hue + 180°
```
Maximum contrast. Use for accent colors.

### Split-Complementary
```
split_1 = base_hue + 150°
split_2 = base_hue + 210°
```
High contrast but less tension than complementary.

### Analogous
```
analog_1 = base_hue - 30°
analog_2 = base_hue + 30°
// Extended: ±60° for 5-color analogous
```
Harmonious, low contrast. Good for backgrounds/themes.

### Triadic
```
tri_1 = base_hue + 120°
tri_2 = base_hue + 240°
```
Balanced, vibrant. Difficult to use well -- one color should dominate.

### Tetradic (Rectangle)
```
tet_1 = base_hue + 60°
tet_2 = base_hue + 180°
tet_3 = base_hue + 240°
```
Rich palette. Works best with one dominant + three accents.

### Square
```
sq_1 = base_hue + 90°
sq_2 = base_hue + 180°
sq_3 = base_hue + 270°
```
Even spacing, vibrant.

---

## Tint/Shade/Tone Generation

### Tint Ramp (Lighter Variants)
In Oklch:
```
for i in 0..n:
    L = lerp(base_L, 0.97, i/n)  // toward white
    C = base_C * (1 - i/n * 0.5) // reduce chroma slightly
    h = base_h                     // preserve hue
```

### Shade Ramp (Darker Variants)
```
for i in 0..n:
    L = lerp(base_L, 0.05, i/n)  // toward black
    C = base_C * (1 - i/n * 0.3) // chroma drops in dark
    h = base_h
```

### Tailwind-style 50-950 Scale
Generate 11 stops with perceptually even lightness spacing:
```
L values (Oklch): [0.97, 0.93, 0.87, 0.78, 0.68, 0.57, 0.47, 0.38, 0.30, 0.23, 0.15]
// Approximately maps to: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
```

---

## Material Design Tonal Palette (HCT)

Google's approach for dynamic theming:

1. Take seed color, convert to HCT
2. Fix Hue (H) from seed
3. Generate 13 tones: T = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100]
4. For each tone, find maximum achievable chroma in sRGB at that H,T
5. Cap chroma if it exceeds sRGB boundary

---

## Accessible Palette Generation

### Contrast-First Approach
Instead of picking colors and checking contrast, work backwards:

```
1. Fix background lightness (e.g., L=0.15 for dark theme)
2. For text: find minimum L that gives 4.5:1 contrast (WCAG AA)
3. For interactive elements: find L for 3:1 contrast
4. Pick hues freely at those constrained lightness values
```

### Color Blindness Safety
Avoid relying on these hue pairs alone:
- Red vs Green (protanopia, deuteranopia -- ~8% of males)
- Blue vs Yellow (tritanopia -- rare)

**Safe strategy:** Ensure palette members differ in lightness, not just hue.

---

## Implementation Tips

1. **Always wrap hue:** `h = ((h % 360) + 360) % 360`
2. **Interpolate hue shortest path** by default (check if |h1-h2| > 180, adjust)
3. **Gamut check** every generated color -- harmony angles may produce out-of-gamut results
4. **Preserve base color** exactly in the output palette (don't let rounding drift it)

---

## References

- Itten, Johannes - "The Art of Color" (1961)
- Material Design 3 - Dynamic Color specification: https://m3.material.io/styles/color/system/overview
- WCAG 2.1 - Contrast requirements: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- Material Color Utilities (HCT reference implementation): https://github.com/material-foundation/material-color-utilities
- Oklch picker (harmony exploration): https://oklch.com/

---

See also: [[Color Science & Algorithms]] · [[Color Knowledge Hub]] · [[Oklch]] · [[HCT]] · [[Contrast and Accessibility]] · [[Color Interpolation]]

---
tags: [research, accessibility]
status: reference
updated: 2026-06-24
---

# Contrast and Accessibility

## By Claude Code

**The algorithms behind contrast checking, WCAG compliance, APCA, and color blindness simulation -- core features for any modern color tool.**

---

## WCAG 2.x Relative Luminance

The formula behind WCAG contrast ratios.

### Step 1: Relative Luminance (L)
```
L = 0.2126 × R_lin + 0.7152 × G_lin + 0.0722 × B_lin

where R_lin, G_lin, B_lin are linearized sRGB values:
  if C_srgb ≤ 0.04045: C_lin = C_srgb / 12.92
  else:                 C_lin = ((C_srgb + 0.055) / 1.055)^2.4
```

### Step 2: Contrast Ratio
```
ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

### WCAG Thresholds

| Level | Normal text | Large text (18pt/14pt bold) | UI components |
|-------|------------|----------------------------|---------------|
| AA | 4.5:1 | 3:1 | 3:1 |
| AAA | 7:1 | 4.5:1 | N/A |

---

## APCA (Advanced Perceptual Contrast Algorithm)

The next-generation contrast algorithm being developed for WCAG 3.0. Significantly better for text readability prediction.

### Key Differences from WCAG 2.x
- **Polarity-aware:** Dark text on light bg is different from light text on dark bg
- **Font-size aware:** Thresholds vary by font size and weight
- **Better low-luminance handling:** Fixes WCAG 2.x issues with dark themes
- **Uses perceived lightness, not luminance ratio**

### APCA Lightness Contrast (Lc)
```
// Simplified — full algorithm at github.com/Myndex/SAPC-APCA
Y_text = sRGBtoY(text_color)     // linearize + luminance
Y_bg = sRGBtoY(bg_color)

// Apply power curve (different for text vs bg)
S_txt = Y_text^0.56
S_bg = Y_bg^0.57

// Polarity-aware contrast
if S_bg > S_txt:  // dark text on light bg
    Lc = (S_bg - S_txt) × 1.14
else:              // light text on dark bg
    Lc = (S_bg - S_txt) × 1.14
// (actual formula has additional offsets and clamping)
```

### APCA Thresholds (approximate)

| Lc value | Use |
|----------|-----|
| 15 | Minimum for non-text elements (icons, borders) |
| 30 | Minimum for large/bold text (≥36px) |
| 45 | Minimum for body text (16-24px, bold) |
| 60 | Minimum for body text (16px, normal weight) |
| 75 | Minimum for small/thin text (<16px) |
| 90 | Preferred for best readability |

---

## Color Blindness Simulation

### Types and Prevalence

| Type | Affected cone | Prevalence (male) | Prevalence (female) |
|------|--------------|-------------------|---------------------|
| Protanopia | L (red) missing | ~1.3% | ~0.02% |
| Protanomaly | L (red) weak | ~1.3% | ~0.02% |
| Deuteranopia | M (green) missing | ~1.2% | ~0.01% |
| Deuteranomaly | M (green) weak | ~5.0% | ~0.4% |
| Tritanopia | S (blue) missing | ~0.001% | ~0.001% |
| Achromatopsia | All cones | ~0.003% | ~0.003% |

**Total:** ~8% of males, ~0.5% of females have some form of color vision deficiency.

### Brettel Simulation (Recommended)

The Brettel, Viénot & Mollon (1997) algorithm is the standard for accurate simulation.

1. Convert sRGB → linear RGB → LMS
2. Project LMS onto the reduced-dimension plane for the given deficiency
3. Convert back LMS → linear RGB → sRGB

**Key matrices** (for full protanopia, applied in LMS space):
```
Protanopia (L cone missing):
  L is computed from M and S using the deficiency plane

Deuteranopia (M cone missing):
  M is computed from L and S

Tritanopia (S cone missing):
  S is computed from L and M
```

For anomalous trichromacy (protanomaly, deuteranomaly), interpolate between normal and full deficiency based on severity.

### Viénot Simplified Matrices

Faster but less accurate. Applied directly in linear RGB:

**Protanopia:**
```
[0.56667  0.43333  0.00000]
[0.55833  0.44167  0.00000]
[0.00000  0.24167  0.75833]
```

**Deuteranopia:**
```
[0.62500  0.37500  0.00000]
[0.70000  0.30000  0.00000]
[0.00000  0.30000  0.70000]
```

**Tritanopia:**
```
[0.95000  0.05000  0.00000]
[0.00000  0.43333  0.56667]
[0.00000  0.47500  0.52500]
```

---

## Designing for Color Blindness

### Rules
1. **Never use color alone** to convey meaning (add icons, patterns, labels)
2. **Ensure lightness contrast** between elements (works for all vision types)
3. **Test with simulated views** for protanopia AND deuteranopia at minimum

### Safe Color Combinations
- Blue + Orange (safe for most CVD types)
- Blue + Red (distinguishable even for deuteranopia)
- Avoid: Red + Green, Green + Brown, Blue + Purple, Red + Brown

---

## Implementation Recommendations

1. **Always provide WCAG 2.x** (it's the current legal standard)
2. **Add APCA** as an advanced option (it's better but not yet standardized)
3. **Include color blindness simulation** (protanopia + deuteranopia cover 95%+ of CVD)
4. **Auto-suggest** accessible alternatives when a user picks a low-contrast pair

---

## References

- WCAG 2.1 - https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- APCA - https://github.com/Myndex/SAPC-APCA
- Brettel, Viénot & Mollon (1997) - "Computerized simulation of color appearance for dichromats"
- Machado, Oliveira & Fernandes (2009) - Anomalous trichromacy simulation
- APCA contrast calculator: https://www.myndex.com/APCA/
- WCAG 3.0 working draft: https://www.w3.org/TR/wcag-3.0/

---

See also: [[Color Science & Algorithms]] · [[Color Knowledge Hub]] · [[Color Harmony Algorithms]] · [[Oklch]] · [[Transfer Functions]]

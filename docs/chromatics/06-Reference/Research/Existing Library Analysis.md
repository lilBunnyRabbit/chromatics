---
tags: [research, libraries]
status: reference
updated: 2026-06-24
---

# Existing Library Analysis

## By Claude Code

**Competitive analysis of existing color libraries -- what they do well, what they miss, and where chromatics fits.**

---

## JavaScript Libraries

### Culori (recommended as foundation)
- **URL:** https://culorijs.org/
- **Size:** ~12KB gzipped, tree-shakeable
- **Models:** 30+ (sRGB, P3, Rec.2020, Oklch, Lab, Luv, HSL, HWB, Okhsl, Okhsv, etc.)
- **Strengths:** Modular, fast, well-tested, gamut mapping, interpolation, CSS Color 4 parsing, actively maintained
- **Weaknesses:** Plain object API (`{mode:'oklch', l:0.5, c:0.1, h:300}` -- no methods on colors), no model-specific utilities, no class hierarchy
- **Why use underneath chromatics:** Handles all conversion math correctly; you wrap it with your typed API

### Color.js (Lea Verou)
- **URL:** https://colorjs.io/
- **Size:** ~30KB gzipped
- **Models:** 25+ including all CSS Color 4 spaces
- **Strengths:** CSS spec-aligned (Lea co-authored CSS Color 4), class-based API, gamut mapping, interpolation, deltaE
- **Weaknesses:** Heavier, less tree-shakeable than Culori, slightly slower
- **Alternative to Culori:** If you prefer a class-based foundation instead of functional

### Chroma.js
- **URL:** https://gka.github.io/chroma.js
- **Size:** ~14KB gzipped
- **Strengths:** Great API for mixing/blending, nice scale/gradient generation, widely adopted
- **Weaknesses:** Limited models (no Oklch, no P3, no Rec.2020), not spec-aligned, less actively maintained

### Colord
- **URL:** https://www.npmjs.com/package/colord
- **Size:** 1.7KB core
- **Strengths:** Tiny, plugin architecture, good for size-constrained apps
- **Weaknesses:** Very limited model support in core, plugins add size

### d3-color
- **URL:** https://d3js.org/d3-color
- **Strengths:** Well-tested, part of D3 ecosystem
- **Weaknesses:** Limited models, designed for D3 not standalone use

---

## What None of Them Do

| Feature | Culori | Color.js | Chroma | Colord | **chromatics** |
|---------|--------|----------|--------|--------|----------------|
| Model-specific utility methods | No | Partial | No | No | **Yes** |
| "What is this model good at?" API | No | No | No | No | **Yes** |
| Color relationships as code | No | No | No | No | **Yes (DSL)** |
| Reactive dependency graph | No | No | No | No | **Yes (DSL)** |
| Two-way editing (UI ↔ code) | No | No | No | No | **Yes (DSL)** |
| HCT tonal palette generation | No | No | No | No | **Yes** |
| APCA contrast checking | No | Partial | No | No | **Yes** |
| CVD simulation matrices | No | No | No | No | **Yes** |

---

## Python Libraries (reference, not competition)

### colour-science
- **URL:** https://colour.readthedocs.io
- **Models:** 60+ (by far the most comprehensive)
- **Note:** The gold standard for scientific color work. Too heavy for JS but good reference for algorithms and test data.

### ColorAide
- **URL:** https://facelessuser.github.io/coloraide/
- **Note:** Excellent API design to study. Class-based, model-specific methods, good inspiration for chromatics' API.

---

## Culori Integration Notes

### How chromatics wraps Culori

```typescript
import { oklch, converter, displayable } from 'culori';

class Oklch {
  private _culori: CuloriOklch;

  constructor(l: number, c: number, h: number) {
    this._culori = { mode: 'oklch', l, c, h };
  }

  // Culori does the conversion
  toSrgb(): Srgb {
    const rgb = converter('rgb')(this._culori);
    return new Srgb(rgb.r, rgb.g, rgb.b);
  }

  // Chromatics adds the model-specific method
  gamutMap(target: 'srgb' | 'p3' = 'srgb'): Oklch {
    // Use Culori's gamut mapping or implement CSS Color 4 algorithm
    const mapped = clampChroma(this._culori, 'oklch', target);
    return new Oklch(mapped.l, mapped.c, mapped.h);
  }

  // This method doesn't exist in Culori -- it's chromatics' value-add
  isInGamut(space: string = 'srgb'): boolean {
    return displayable(converter(space)(this._culori));
  }
}
```

### What to take from Culori
- Conversion functions (all 30+ models)
- Gamut mapping (`clampChroma`, `toGamut`)
- Interpolation (`interpolate`, `samples`)
- CSS parsing (`parse`)
- Color difference (`differenceEuclidean`, `differenceCie76`, `differenceCiede2000`)

### What chromatics adds on top
- Class hierarchy with typed channels
- Model-specific utility methods
- Conversion registry with `.from()` / `.to()` pattern
- DSL integration (constructors return unified Color type)
- APCA contrast, CVD simulation, harmony calculations

---

## Resources

- Culori: https://culorijs.org/
- Color.js: https://colorjs.io/
- Chroma.js: https://gka.github.io/chroma.js
- Colord: https://www.npmjs.com/package/colord
- d3-color: https://d3js.org/d3-color
- colour-science (Python): https://colour.readthedocs.io
- ColorAide (Python): https://facelessuser.github.io/coloraide/
- CSS Color Module Level 4: https://www.w3.org/TR/css-color-4/

---

See also: [[Color Science & Algorithms]] · [[Color Knowledge Hub]] · [[Oklch]] · [[Display P3]] · [[Color Difference Formulas]] · [[Contrast and Accessibility]] · [[Color Harmony Algorithms]]

---
tags: [research, color-interpolation]
status: reference
updated: 2026-06-24
---

# Color Interpolation

## By Claude Code

**How to blend, interpolate, and create gradients between colors -- why the choice of color space matters dramatically, and how to handle hue wrapping and alpha.**

---

## The Space Matters

Interpolating between red (#ff0000) and cyan (#00ffff) in different spaces:

| Space | Midpoint | Problem? |
|-------|----------|----------|
| sRGB | Dark gray/brown | Goes through gray (desaturated) |
| Linear sRGB | Slightly better gray | Dark band in the middle |
| Oklch | Vivid blue-green | Stays saturated -- correct! |
| CIE Lab | Vivid but slightly off | Hue shift in blue region |
| HSL | Vivid green | Hue works but lightness is wrong |

**Rule:** Interpolate in Oklab/Oklch for best results. CSS `color-mix()` defaults to Oklab.

---

## Basic Linear Interpolation

For any rectangular color space (RGB, Lab, Oklab):

```js
function lerp(a, b, t) {
    return a + (b - a) * t;  // t in [0, 1]
}

function interpolateOklab(color1, color2, t) {
    return {
        L: lerp(color1.L, color2.L, t),
        a: lerp(color1.a, color2.a, t),
        b: lerp(color1.b, color2.b, t),
    };
}
```

---

## Hue Interpolation (Cylindrical Spaces)

In Oklch, HSL, LCh -- hue is an angle (0-360). Naive lerp breaks at the 359° → 1° boundary.

### Shortest Path (Default)
```js
function lerpHue(h1, h2, t) {
    let diff = h2 - h1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return ((h1 + diff * t) % 360 + 360) % 360;
}
```

### CSS Hue Interpolation Methods
```
shorter:    take the shorter arc (default)
longer:     take the longer arc
increasing: always go h1 → h2 increasing (clockwise)
decreasing: always go h1 → h2 decreasing (counterclockwise)
```

### Handling `none` Hue
When chroma is 0, hue is meaningless. CSS says: if one color has `none` hue, use the other's hue. If both are `none`, result hue is `none`.

---

## Premultiplied Alpha

For correct alpha compositing, multiply color channels by alpha before interpolation:

```js
function interpolateWithAlpha(c1, c2, t) {
    // Premultiply
    const a1 = c1.alpha, a2 = c2.alpha;
    const pL1 = c1.L * a1, pL2 = c2.L * a2;
    const pa1 = c1.a * a1, pa2 = c2.a * a2;
    const pb1 = c1.b * a1, pb2 = c2.b * a2;

    // Interpolate premultiplied values
    const alpha = lerp(a1, a2, t);
    const pL = lerp(pL1, pL2, t);
    const pa = lerp(pa1, pa2, t);
    const pb = lerp(pb1, pb2, t);

    // Un-premultiply
    if (alpha === 0) return { L: 0, a: 0, b: 0, alpha: 0 };
    return { L: pL / alpha, a: pa / alpha, b: pb / alpha, alpha };
}
```

**Why:** Without premultiplication, blending red (alpha=1) with transparent green (alpha=0) gives you a visible 50% green tint. With premultiplication, it correctly fades to red.

---

## Multi-Stop Gradients

For 3+ color stops, options include:

### Piecewise Linear
Simplest. Interpolate between adjacent pairs. Creates visible "kinks" at stops.

### Catmull-Rom Spline
Smooth curve through all stops. Use the Oklab coordinates as control points.

```
For stop i at parameter t:
  P(t) = 0.5 × ((2P₁) + (-P₀+P₂)t + (2P₀-5P₁+4P₂-P₃)t² + (-P₀+3P₁-3P₂+P₃)t³)
```

### B-Spline
Smooth but doesn't pass through control points. Good for "smooth" palettes.

---

## The Dark Band Problem

Why you must NOT interpolate in gamma-encoded sRGB:

```
Red (1,0,0) + Blue (0,0,1) midpoint in sRGB = (0.5, 0, 0.5) → dark purple
Same in linear sRGB = (0.5, 0, 0.5) → brighter purple (correct energy)
Same in Oklab = vivid violet (perceptually correct)
```

Gamma-encoded interpolation underestimates the midpoint brightness because `0.5^2.2 ≈ 0.22` in linear light.

**Fix:** Always linearize before blending in RGB, or better yet, blend in Oklab.

---

## Easing Functions for Color

Apply easing to the `t` parameter, not to the color values:

```js
// Ease-in-out cubic
function easeInOut(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
}

// Use: interpolateOklab(c1, c2, easeInOut(t))
```

This creates smooth gradients that accelerate and decelerate.

---

## Recommendations for Your Library

1. **Default interpolation space: Oklab** (matches CSS behavior)
2. **Expose space choice** to users (Oklab, Oklch, sRGB-linear, Lab, HSL)
3. **Handle hue interpolation** with all 4 CSS methods
4. **Always use premultiplied alpha** when alpha differs between colors
5. **Provide multi-stop gradient** function with at least piecewise linear
6. **Never interpolate in gamma-encoded sRGB** (or at least warn)

---

## References

- CSS Color Level 4 - Interpolation section: https://www.w3.org/TR/css-color-4/#interpolation
- Ottosson (2021) - "How software gets color wrong": https://bottosson.github.io/posts/colorwrong/
- https://www.joshwcomeau.com/css/make-beautiful-gradients/
- Culori interpolation API: https://culorijs.org/api/#interpolate

---

See also: [[Color Science & Algorithms]] · [[Color Knowledge Hub]] · [[Oklab]] · [[Oklch]] · [[Color Harmony Algorithms]] · [[Gamut Mapping]]

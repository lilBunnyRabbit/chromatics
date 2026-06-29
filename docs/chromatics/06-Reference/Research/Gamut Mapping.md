---
tags: [research, gamut-mapping]
status: reference
updated: 2026-06-24
---

# Gamut Mapping

## By Claude Code

**What to do when a color exists in one space but not another -- the strategies for mapping out-of-gamut colors, including the CSS Color Level 4 algorithm.**

---

## When Gamut Mapping is Needed

Any time a wider-gamut color must be represented in a narrower space:
- Oklch → sRGB (chroma may exceed sRGB boundary)
- Display P3 → sRGB (some P3 colors don't fit in sRGB)
- ProPhoto RGB → any display space
- CIE Lab → any RGB space

---

## Strategy 1: Clamp (Naive)

Simply clip each RGB channel to [0, 1].

```js
r = Math.max(0, Math.min(1, r))
g = Math.max(0, Math.min(1, g))
b = Math.max(0, Math.min(1, b))
```

**Pros:** Fastest possible
**Cons:** Changes hue and lightness unpredictably. A saturated cyan might become a different blue.

---

## Strategy 2: CSS Color Level 4 Algorithm (Recommended)

The W3C-specified algorithm. Reduces chroma in Oklch while preserving lightness and hue.

```
1. Convert color to Oklch
2. If already in destination gamut → done
3. Set L to clamp(L, 0, 1) and C to clamp(C, 0, max)
4. Binary search on C (chroma):
   - while C difference > epsilon (0.02):
     - mid = (min_C + max_C) / 2
     - test = oklch(L, mid, h)
     - if test is in gamut: min_C = mid
     - else: max_C = mid
5. Return the highest in-gamut chroma at same L and h
```

**Pros:** Preserves hue and lightness, perceptually reasonable
**Cons:** Requires iterative checking (typically 10-20 iterations)

**Implementation detail:** "In gamut" check = convert to target RGB, verify all channels in [0,1] with a small epsilon tolerance (~0.001).

---

## Strategy 3: Chroma Reduction (Simple)

Like CSS but without binary search -- just linearly reduce chroma until in gamut.

```
while not in_gamut(oklch_to_srgb(L, C, h)):
    C = C * 0.95  // reduce by 5%
```

**Pros:** Simple to implement
**Cons:** May overshoot (reduce too much), slower convergence than binary search

---

## Strategy 4: Perceptual Compression (ICC)

Used in ICC profiles' perceptual rendering intent. Compresses the entire source gamut to fit the destination.

- Maps source gamut boundary to destination gamut boundary
- Preserves relative relationships between colors
- All colors shift, even those already in gamut
- Complex, uses 3D LUT

**Best for:** Print workflows where preserving relationships matters more than absolute accuracy

---

## Strategy 5: Relative Colorimetric (ICC)

Maps colors using the white point, clips anything out of gamut.

- In-gamut colors stay exactly the same (after white point adaptation)
- Out-of-gamut colors are clipped to nearest gamut boundary
- Most common intent for proofing

---

## Gamut Boundary Detection

To check if a color is in gamut:

```js
function isInGamut(r, g, b, epsilon = 0.001) {
    return r >= -epsilon && r <= 1 + epsilon
        && g >= -epsilon && g <= 1 + epsilon
        && b >= -epsilon && b <= 1 + epsilon;
}
```

---

## Gamut Size Comparison

| Space | % of CIE 1931 xy | Relative to sRGB |
|-------|-------------------|-------------------|
| sRGB | ~35.9% | 1.0x |
| Display P3 | ~45.1% | ~1.26x |
| Adobe RGB | ~52.1% | ~1.45x |
| Rec. 2020 | ~75.8% | ~2.11x |
| ProPhoto RGB | ~91.2% | ~2.54x |
| ACES AP0 | ~100% | ~2.79x |

---

## Recommendations for Your Library

1. **Default gamut mapping:** CSS Color 4 algorithm (chroma reduction in Oklch)
2. **Expose strategy choice:** Let users pick clamp, CSS, or perceptual
3. **Always preserve hue:** Hue shifts are the most visually jarring artifact
4. **Cache gamut boundaries:** Pre-compute sRGB boundary in Oklch for fast lookup
5. **Provide `isInGamut()` check** for any color in any target space

---

## References

- CSS Color Level 4 - Section 12 "Gamut Mapping" - https://www.w3.org/TR/css-color-4/#gamut-mapping
- ICC.1:2022 - Rendering intents
- Morovic (2008) - "Color Gamut Mapping"

## Resources

- [CSS Color 4 - Gamut Mapping algorithm](https://www.w3.org/TR/css-color-4/#css-gamut-mapping)
- [Björn Ottosson - Gamut clipping in Oklab](https://bottosson.github.io/posts/gamutclipping/)
- [Culori - gamut mapping reference implementation](https://culorijs.org/api/#mapper)

---

See also: [[Color Science & Algorithms]] · [[Color Knowledge Hub]] · [[Conversion Pipeline]] · [[CSS Color Specification]] · [[Oklch]] · [[Display P3]]

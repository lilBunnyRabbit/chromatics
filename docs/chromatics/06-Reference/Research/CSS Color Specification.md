---
tags: [research, css-color-specification]
status: reference
updated: 2026-06-24
---

# CSS Color Specification

## By Claude Code

**CSS Color Level 4 and 5 syntax reference -- every color function, relative color syntax, and new feature your library should support for web developers.**

---

## CSS Color Level 4 (Widely Supported)

### New Color Functions

```css
/* Oklch and Oklab */
color: oklch(0.7 0.15 180);          /* L C h */
color: oklab(0.7 -0.1 0.05);        /* L a b */

/* CIE LCh and Lab */
color: lch(50 80 120);               /* L C h */
color: lab(50 -20 40);               /* L a b */

/* Any predefined color space */
color: color(display-p3 1 0.5 0);    /* Display P3 */
color: color(srgb 1 0.5 0);          /* Explicit sRGB */
color: color(srgb-linear 1 0.5 0);   /* Linear sRGB */
color: color(a98-rgb 1 0.5 0);       /* Adobe RGB */
color: color(prophoto-rgb 1 0.5 0);  /* ProPhoto RGB */
color: color(rec2020 1 0.5 0);       /* Rec. 2020 */
color: color(xyz-d65 0.5 0.4 0.3);   /* CIE XYZ D65 */
color: color(xyz-d50 0.5 0.4 0.3);   /* CIE XYZ D50 */
```

### Alpha Syntax
```css
color: oklch(0.7 0.15 180 / 0.5);    /* 50% alpha */
color: rgb(255 128 0 / 50%);          /* percentage alpha */
```

### none Keyword
```css
color: oklch(0.7 0.15 none);          /* achromatic (no hue) */
color: oklch(none 0.15 180);          /* missing lightness */
```

---

## Relative Color Syntax (CSS Color Level 5)

Transform an existing color by referencing its components:

```css
/* Lighten by 20% */
--lighter: oklch(from var(--brand) calc(l + 0.2) c h);

/* Desaturate */
--muted: oklch(from var(--brand) l calc(c * 0.5) h);

/* Shift hue by 30° */
--shifted: oklch(from var(--brand) l c calc(h + 30));

/* Change alpha */
--faded: oklch(from var(--brand) l c h / 0.5);

/* Convert spaces: take an HSL color, output in Oklch */
--converted: oklch(from hsl(200 80% 50%) l c h);

/* Use components from one space in another */
--mixed: rgb(from var(--brand) calc(r * 0.8) g b);
```

---

## color-mix()

Interpolate between two colors in a chosen space:

```css
/* 50/50 mix in Oklch */
color: color-mix(in oklch, red, blue);

/* 25% red, 75% blue */
color: color-mix(in oklch, red 25%, blue);

/* Specify hue interpolation method */
color: color-mix(in oklch shorter hue, red, blue);
color: color-mix(in oklch longer hue, red, blue);
color: color-mix(in oklch increasing hue, red, blue);
color: color-mix(in oklch decreasing hue, red, blue);
```

**Hue interpolation methods:**
- `shorter` (default): Take the shorter arc around the hue circle
- `longer`: Take the longer arc
- `increasing`: Always go clockwise (increasing angles)
- `decreasing`: Always go counterclockwise

---

## color-contrast() (Proposed, Level 5)

Auto-pick the best contrast color:

```css
/* Pick whichever has better contrast against --bg */
color: color-contrast(var(--bg) vs white, black);

/* Pick the first that meets AA threshold */
color: color-contrast(var(--bg) vs white, black to AA);
```

**Status:** Limited support, still being specified.

---

## light-dark() (Level 5)

Respond to color scheme:

```css
color: light-dark(#333, #ccc);  /* dark text in light mode, light in dark */
```

---

## Supported Predefined Color Spaces

| CSS identifier | Color space | White point |
|---------------|-------------|-------------|
| `srgb` | sRGB | D65 |
| `srgb-linear` | Linear sRGB | D65 |
| `display-p3` | Display P3 | D65 |
| `a98-rgb` | Adobe RGB (1998) | D65 |
| `prophoto-rgb` | ProPhoto RGB | D50 |
| `rec2020` | Rec. 2020 | D65 |
| `xyz-d65` | CIE XYZ | D65 |
| `xyz-d50` | CIE XYZ | D50 |

---

## Gamut Mapping in CSS

When a color is out of gamut for the output device, CSS Color 4 specifies:
1. Convert to Oklch
2. Binary search: reduce chroma until color fits in destination gamut
3. Preserve lightness and hue

This is why your library should implement the Oklch gamut mapping algorithm.

---

## What Your Library Should Parse

At minimum, to be CSS-compatible:

| Format | Example |
|--------|---------|
| Hex | `#ff8000`, `#f80`, `#ff800080` |
| rgb() | `rgb(255 128 0)`, `rgb(255 128 0 / 0.5)` |
| hsl() | `hsl(30 100% 50%)` |
| hwb() | `hwb(30 0% 0%)` |
| lab() | `lab(70 20 -30)` |
| lch() | `lch(70 40 300)` |
| oklab() | `oklab(0.7 0.1 -0.05)` |
| oklch() | `oklch(0.7 0.15 300)` |
| color() | `color(display-p3 1 0.5 0)` |
| Named | `red`, `rebeccapurple`, all 148 CSS named colors |

---

## References

- CSS Color Level 4 - https://www.w3.org/TR/css-color-4/
- CSS Color Level 5 - https://www.w3.org/TR/css-color-5/
- MDN oklch() - https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch

## Resources

- [CSS Color Module Level 4 (W3C TR)](https://www.w3.org/TR/css-color-4/)
- [CSS Color Module Level 5 (W3C TR)](https://www.w3.org/TR/css-color-5/)
- [MDN - CSS color_value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)
- [MDN - color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
- [OKLCH Color Picker & Converter (evilmartians)](https://oklch.com/)

---

See also: [[Color Science & Algorithms]] · [[Color Knowledge Hub]] · [[Gamut Mapping]] · [[Conversion Pipeline]] · [[Oklch]] · [[Oklab]] · [[Display P3]]

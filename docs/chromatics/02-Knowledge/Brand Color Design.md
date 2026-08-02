---
tags: [knowledge, brand]
---

# Brand Color Design

A worked methodology for deriving a complete, accessible brand palette from a single base color using perceptual color relationships. The approach starts from a dark background, builds a primary by combining hue rotation with a perceptual lightness bump, then derives secondary, accent, and foreground roles through complementary and split-complementary relationships in [[Oklch]] and [[HSL]]. This note captures the reusable rules; the underlying theory lives in [[Color Theory]], and these rules feed directly into [[Dynamic Theme]] generation and the [[Unified Product Plan]].

> [!note] Superseded in practice
> The applied, finished version of this methodology is [[Brand Dark Theme Spec]] — same seed, every constant now derived rather than hand-tuned, with a verified 63-pair contrast contract.

## Core Idea

Pick **one base color** (here a dark background) and derive every other role from it by fixed, repeatable transforms. Working in [[Oklch]] keeps lightness and chroma perceptually even across hues, so a single "+L, rotate hue" rule produces consistent results no matter where on the wheel you land — unlike HSL, where equal lightness values look uneven between hues. Every derived color is validated against the background for [[Accessibility]] contrast.

## Worked Palette

Derived from background `#17252c` — `hsl(200, 31%, 13%)` / `oklch(0.26 0.0233 230)`:

| Role | Hex | HSL | Oklch | Derivation |
|------|-----|-----|-------|------------|
| Background | `#17252c` | `hsl(200, 31%, 13%)` | `oklch(0.26 0.0233 230)` | Base color |
| Primary | `#a6ba7d` | `hsl(80, 31%, 61%)` | `oklch(0.76 0.0865 123)` | Background HSL triad (+120° hue), +48% lightness |
| Secondary | `#bca4de` | `hsl(265, 47%, 76%)` | `oklch(0.76 0.0865 303)` | Primary Oklch complement (hue +180°) |
| Accent | `#dea17f` | `hsl(22, 59%, 68%)` | `oklch(0.76 0.0865 50)` | Primary Oklch + Background Oklch complementary hue |
| Foreground | `#b5b3a6` | `hsl(52, 9%, 68%)` | `oklch(0.76 0.0183 100)` | Background HSL split-complementary, +55% lightness, −22% saturation |
| Text | `#e9eff2` | — | — | Background hue, lightness ≈ background + 80% (~93%) |

## Derivation Rules

1. **Primary** = background shifted to a triadic hue (+120°) and lightened. Combining a hue rotation with a large perceptual lightness increase lifts the dark base into a usable, distinct foreground-capable color while keeping a relationship to the background.
2. **Secondary** = the primary's complement (Oklch hue +180°), keeping the same L and C so it reads as an equal-weight sibling.
3. **Accent** = primary lightness/chroma carried onto the background's complementary hue, tying the accent back to the base while staying visually distinct from primary and secondary.
4. **Foreground / neutral** = derived from the background's split-complementary hue with a strong lightness lift and reduced saturation, giving a near-neutral that still harmonizes rather than a flat gray.
5. **Text** = background hue at very high lightness (≈ +80%) for body copy, sitting well above the AA/AAA contrast threshold against the dark background.

> Refinement heuristics from iteration:
> - **Secondary refined:** `oklch(Primary L − 0.05, Primary C × 1.1, Primary hue + 180°)`
> - **Accent refined:** `oklch(Primary L + 0.05, Primary C × 1.2, Background complementary hue)`

## Accessibility Tuning

The primary's lightness is tuned against the background to hit WCAG targets. Stepping the primary's lightness raises the contrast ratio through the AA/AAA thresholds:

| Primary | Lighten | Contrast | Level |
|---------|---------|----------|-------|
| `#94ad62` | 40% | 6.2 | AA |
| `#9fb673` | 45% | 7.0 | AAA |
| `#a2b776` | 46% | 7.1 | AAA |
| `#a6bb7d` | 48% | 7.4 | AAA |
| `#abbe84` | 50% | 7.7 | AAA |

The chosen primary (~48% lighten, −120° hue from a triad relationship) clears AAA. Always validate each role against its background; see [[Accessibility]] for the contrast-ratio definition and thresholds.

## Why Oklch for This

- **Perceptual evenness:** equal L and C steps look equal across hues, so the same derivation rule gives consistent weight whether the primary lands on green, purple, or orange.
- **Predictable lightness for contrast:** Oklch L correlates with perceived brightness, making it straightforward to tune a color to a target contrast ratio.
- **Clean hue rotations:** complement (+180°) and triad (+120°) relationships stay perceptually balanced, where the same rotations in HSL can produce jarring lightness jumps.

See [[Color Theory]] for the perceptual-uniformity background and [[Oklch]] / [[HSL]] for the model definitions.

## Resources

- [hue.tools](https://hue.tools/) — inspect a color across HSL, Oklch, and others, and generate harmonies
- [tweakcn theme editor](https://tweakcn.com/editor/theme) — build and preview component themes from a palette

## See Also

- [[Color Theory]] — harmony, perception, and contrast fundamentals
- [[Accessibility]] — WCAG contrast ratios and color-vision guidance
- [[Dynamic Theme]] — programmatic palette generation from these rules
- [[Unified Product Plan]] — where the brand palette fits in the product
- [[Oklch]] · [[HSL]] · [[RGB]] — the color models used above

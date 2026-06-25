---
tags: [knowledge, color-theory]
---

# Color Theory

Foundational theory of color: how color is modeled, how humans perceive it, how light and pigment mix, how differences are measured, and how these principles apply to interface and brand design. This note covers the conceptual groundwork; for the underlying coordinate systems see [[Color Models]], and for computation (conversions, ΔE, adaptation transforms) see [[Color Science & Algorithms]]. Start at the [[Color Knowledge Hub]] for the full map.

## Color Models and Their Foundations

A **color model** is a structured way to represent a color as numbers. Different models serve different purposes — some are tied to device primaries, others to human perception. The major families:

- **Additive vs subtractive.** [[RGB]] (Red, Green, Blue) is an *additive* model: colors are produced by mixing light, so full red + green yields yellow. [[CMYK]] (Cyan, Magenta, Yellow, blacK) is *subtractive*: you start with white paper and add inks that absorb wavelengths and reflect the rest. Both are device-dependent; conversions are simple in principle (e.g. C = 1 − R) but require calibration for accuracy.
- **Cylindrical transforms of RGB.** [[HSV]] (Hue, Saturation, Value) and [[HSL]] (Hue, Saturation, Lightness) remap RGB into more human-friendly axes of hue angle, color purity, and brightness. They are simple geometric transforms, **not** perceptually uniform — pure yellow and pure blue have very different luminance despite equal "lightness" in HSL.
- **Device-independent reference spaces.** [[CIE xyY|CIE XYZ]] (1931) is a linear space built from human color-matching experiments; every visible color has XYZ coordinates, though the X, Y, Z primaries are imaginary. Distances in XYZ do **not** match perceived differences, which motivated more uniform spaces. [[CIE Lab|CIELAB]] (1976) is derived from XYZ via a cube-root nonlinearity into L* (lightness) and a*/b* (red–green, blue–yellow opponent axes), designed so equal coordinate steps aim to be equal perceptual steps.
- **Perceptual appearance models.** [[CAM16]] (CIECAM16) predicts perceptual attributes — lightness, chroma, hue, brightness, colorfulness, saturation — under defined viewing conditions, and has a uniform variant [[CAM16-UCS]]. [[Oklab]] (2020) is a simpler perceptual space that fixes some of CIELAB's non-uniformities (especially for blues). [[HCT]] (Hue-Chroma-Tone), used by Material Design 3, is built on CAM16 for consistent tonal palettes.

> See [[Color Models]] for the complete taxonomy and per-model reference notes.

## Perception: How Humans See Color

Color is not a property of light alone — it is a sensation produced by the eye and brain.

- **Trichromacy.** The retina has three cone types (L, M, S) peaking at roughly 560 nm (long/red), 530 nm (medium/green), and 420 nm (short/blue). Any stimulus is reduced to three signals. Classic color-matching experiments showed any test light can be matched by three primaries — the basis of trichromatic vision. Cone responses behave approximately linearly, which greatly simplifies color science.
- **Metamerism.** Because color is three-dimensional, many different spectral power distributions can produce the same cone responses and therefore look identical — these are *metamers*. Metamerism is what makes color reproduction possible: an RGB display or CMYK print fools the eye by producing the right cone signals even though its spectrum differs from the real object. It also creates failures: two samples may match under daylight but differ under tungsten (illuminant metamerism), which is why colorimetry depends on standard observers and illuminants.
- **Physics of object color.** Objects have a **spectral reflectance** — they absorb some wavelengths and reflect others. Perceived color depends on the light source spectrum *and* the reflectance together. A leaf looks green under white sunlight but nearly black under a red lamp that lacks green wavelengths to reflect. Standard illuminants (e.g. D65 daylight) fix the light side of this equation for controlled measurement.
- **Chromatic adaptation and color constancy.** Vision keeps object colors stable under changing light — a white page looks white under noon sun or warm indoor light. The mechanism is **chromatic adaptation**: the visual system recalibrates its sensitivity to the illuminant's color bias, like an automatic white balance (described by the von Kries coefficient law). The resulting **color constancy** is impressive but incomplete; under extreme light a residual cast remains. Appearance models like CIECAM16 include a chromatic adaptation transform to predict how a color seen under one illuminant appears under another — see [[Color Science & Algorithms]].

## Color Difference: Delta E (ΔE)

**ΔE** quantifies the perceived difference between two colors, introduced by the CIE in 1976 alongside CIELAB. ΔE ≈ 1 was historically the smallest difference an average eye can see, though real thresholds depend on hue and context.

- **ΔE76 (CIE 1976).** The Euclidean distance in CIELAB: √((ΔL*)² + (Δa*)² + (Δb*)²). Simple and still common, but over-predicts differences for saturated blues and dark colors because CIELAB is not perfectly uniform.
- **ΔE94 (CIE 1994).** Adds weighting factors separating lightness, chroma, and hue, with variants for graphic arts vs textiles. Reduces the weight of differences in highly saturated and dark regions where the eye is less sensitive.
- **ΔE00 (CIEDE 2000).** The current standard. Adds a hue-rotation term to fix the blue region, improved lightness scaling, and neutral-color handling; lightness weighting varies with the color's lightness level. Best agreement with visual data, recommended for critical matching.

**Interpreting ΔE:** ≈ 0 is a perfect match, ≈ 2 is just noticeable at a glance, ≈ 5 is a clear difference, > 10 is distinctly different. Industries set tolerances accordingly (printing might require ΔE < 5 for brand colors; display calibration aims for ΔE < 1). For UI work, note that **accessibility uses luminance contrast ratio, not ΔE** — see the design section below and [[Accessibility]].

## Color Temperature and White Balance

**Color temperature** describes a light source by comparison to a black-body radiator: ~1000 K glows dull red, ~3000 K orange, ~6000 K near white, higher turns bluish. Counterintuitively, "warm" reddish light has a *lower* Kelvin value and "cool" bluish light a *higher* one. Standard reference points: **D65** (~6504 K, average noon daylight, the sRGB white point) and **D50** (~5000 K, print viewing). Lowering a display's white point shifts whites toward yellow/red; raising it shifts toward blue.

**White balancing** removes color casts by adjusting for the illuminant. A camera under tungsten light boosts the blue channel so neutral grays render neutral — mathematically a per-channel gain, often via the von Kries (LMS scaling) transform. **Display calibration** sets the white point by adjusting R, G, B drive so emitted white matches a target chromaticity (D65 for consumer, D50 for print proofing), ideally with ambient lighting matched so on-screen whites don't appear tinted relative to the room.

## Applications in UI/UX Design

- **Use perceptual spaces.** Ramping or blending in [[CIE Lch|LCH]] or Oklab yields smoother gradients without dark banding, because equal lightness steps look equal. CSS supports `lab()` and `lch()` for this. Material Design 3's HCT (CAM16-based) guarantees visually even tonal steps when generating light-to-dark palettes — directly relevant to [[Dynamic Theme]] generation.
- **Accessibility = luminance contrast.** WCAG contrast ratio is (L1 + 0.05) / (L2 + 0.05) on relative luminance, ranging 1:1 to 21:1. Normal text needs ≥ 4.5:1 (AA), large text ≥ 3:1. Contrast is purely luminance-based, so two equally-light but different hues have ~1:1 contrast — never rely on hue alone. See [[Accessibility]] and [[Brand Color Design]].
- **Branding and harmony.** Color drives brand perception, attention, emotion, and usability. Apply classic harmony (complementary, analogous, triadic) with a limited palette, consistent roles (primary/secondary/neutral, error/success), and tested behavior across displays and light/dark modes. Test with color-blindness simulators so charts and states stay distinguishable. See [[Brand Color Design]].

## Brief History

- **Newton (1704, *Opticks*)** split white light into a spectrum and built the first color wheel — additive light mixing. **Goethe (1810, *Theory of Colors*)** took a perceptual approach (afterimages, simultaneous contrast) with a pigment-based circle. The apparent conflict resolved once it was understood that Newton described *additive* (light → white) and Goethe *subtractive* (pigment → black) systems.
- **19th century.** Runge's color sphere, Chevreul's simultaneous contrast, the Young–Helmholtz trichromatic theory (Maxwell's 1861 three-filter color photograph), and later Bauhaus teaching (Itten's color contrasts).
- **Modern color science.** [[Munsell Color System|Munsell]] (1905) defined hue/value/chroma perceptually. The **CIE** (1931) established XYZ and the standard observer; **CIELAB + ΔE** followed in 1976. The **ICC** (1993) created device-independent color management via [[ICC profile|ICC profiles]]; sRGB (1996) and Adobe RGB (1998) standardized RGB.
- **Recent.** CIECAM02 → **CIECAM16** (2022), **Oklab** (2019) for better interpolation, and wide-gamut/HDR displays (DCI-P3, Rec. 2020) driving Lab/LCH into CSS Color Level 4.

## Resources

- [Programming Design Systems — Color models and color spaces](https://programmingdesignsystems.com/color/color-models-and-color-spaces/index.html) and [A short history of color theory](https://programmingdesignsystems.com/color/a-short-history-of-color-theory/index.html)
- [HunterLab — Lab, RGB and CMYK color spaces explained](https://www.hunterlab.com/blog/lab-rgb-and-cmyk-color-spaces-explained/)
- [RP Photonics — Color spaces](https://www.rp-photonics.com/color_spaces.html)
- [W3C Workshop — Better than Lab? CIELAB & Oklab (Lilley)](https://www.w3.org/Graphics/Color/Workshop/slides/talk/lilley)
- [Zschuessler — Delta E learn](http://zschuessler.github.io/DeltaE/learn/) and [ColorWiki — Delta E](https://www.colorwiki.com/wiki/Delta_E:_The_Color_Difference)
- [WCAG — Contrast ratio](https://www.w3.org/WAI/GL/wiki/Contrast_ratio) · [Nielsen Norman Group — Using color to enhance design](https://www.nngroup.com/articles/color-enhance-design/)
- [Chromatic adaptation — Wikipedia](https://en.wikipedia.org/wiki/Chromatic_adaptation) · [Color appearance model — Wikipedia](https://en.wikipedia.org/wiki/Color_appearance_model)
- **Interactive tools:** [PhET Color Vision](https://phet.colorado.edu/en/simulations/color-vision) · [ColorMine converter](http://colormine.org/) · [Coblis color-blindness simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/) · [Color Oracle](https://colororacle.org/) · [Adobe Color](https://color.adobe.com/) · [Viz Palette](https://projects.susielu.com/viz-palette) · [X-Rite Hue Test](https://www.xrite.com/hue-test) · [Bruce Lindbloom color math](http://www.brucelindbloom.com/)

## See Also

- [[Color Models]] — coordinate systems and per-model reference notes
- [[Color Science & Algorithms]] — conversions, ΔE formulas, adaptation transforms
- [[Brand Color Design]] — applying theory to brand palettes
- [[Accessibility]] — contrast and color-vision-deficiency guidance
- [[Color Knowledge Hub]] — index of all color knowledge notes

---
tags: [knowledge, resources]
---

# Resources

The "where to learn more" hub for color science, tooling, and libraries. Cross-links: [[Library Landscape]], [[Color Knowledge Hub]].

## Color science references

Foundational specs, formulas, and reference material for understanding color spaces, conversions, and perceptual models.

- [Bruce Lindbloom](http://www.brucelindbloom.com/) — the canonical reference for color space conversion math, matrices, and ΔE formulas.
- [colour-science.org](https://www.colour-science.org/) — comprehensive, scientifically rigorous color science resources and reference data.
- [W3C CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) — the authoritative spec for modern CSS color (oklch, oklab, color(), color-mix(), etc.).
- [Björn Ottosson: Oklab](https://bottosson.github.io/posts/oklab/) — the original derivation of the Oklab/Oklch perceptual color space.
- [EasyRGB Color Math](http://www.easyrgb.com/en/math.php#text2) — practical, copy-pasteable conversion formulas between color spaces.

### Wikipedia hubs

- [Color space](https://en.wikipedia.org/wiki/Color_space) — top-level entry point into color space theory.
- [RGB color model](https://en.wikipedia.org/wiki/RGB_color_model)
- [HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)
- [HWB color model](https://en.wikipedia.org/wiki/HWB_color_model)
- [CIELAB color space](https://en.wikipedia.org/wiki/CIELAB_color_space)
- [CMYK color model](https://en.wikipedia.org/wiki/CMYK_color_model)
- [YCbCr](https://en.wikipedia.org/wiki/YCbCr)

## Tools

Interactive pickers, gamut viewers, palette generators, and accessibility checkers.

### Pickers, converters & gamut viewers

- [oklch.com](https://oklch.com/) — the reference Oklch picker and gamut viewer.
- [oklch.fyi](https://oklch.fyi) — Oklch playground and conversion utility.
- [huetone](https://huetone.ardov.me/) — perceptually-uniform palette tool with APCA contrast and gamut visualization.
- [hue.tools](https://hue.tools/) — multi-format color conversion, mixing, and inspection.
- [ColorHexa](https://colorhexa.com) — detailed per-color info, conversions, and schemes.
- [Aspose color converter](https://products.aspose.com/svg/net/color-converter/rgb-to-hwb/) — RGB ↔ HWB and other format conversions.

### Palette generators & inspiration

- [Coolors](https://coolors.co/) — fast palette generator and explorer.
- [Adobe Color](https://color.adobe.com/) — color wheel, harmony rules, and extraction.
- [Paletton](https://paletton.com/) — classic harmony-based palette designer.
- [Colormind](http://colormind.io/) — ML-driven palette generation.
- [Color Hunt](https://colorhunt.co/) — curated palette gallery.
- [Atmos playground](https://atmos.style/playground) — palette and scale builder.
- [Colorffy CSS generator](https://colorffy.com/css-generator) — gradient and palette CSS output.
- [Harmonizer (Evil Martians)](https://harmonizer.evilmartians.com/) — perceptually-balanced palette generator.
- [Leonardo (Adobe)](https://leonardocolor.io/) — contrast-driven adaptive color scale generation.
- [ColorBox](https://colorbox.io/) — programmatic color scale design.

### Theming & scale utilities

- [tweakcn theme editor](https://tweakcn.com/editor/theme) — shadcn/Tailwind theme editor.
- [Tailwind Color Shades](https://javisperez.github.io/tailwindcolorshades/) — generate Tailwind shade scales from a base color.
- [Tailwind Color](https://tailwindcolor.com/) — Tailwind palette reference.
- [Material Palettes](https://materialpalettes.com/) — Material Design palette picker.
- [Material Theme Builder](https://material.io/resources/theme-editor/) — Material theme generation.
- [Smart Swatch](https://smart-swatch.netlify.app/) — generate accessible swatch scales.

### Contrast & accessibility

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — the standard WCAG contrast checker.
- [Deque Color Contrast Analyzer](https://color-contrast-checker.deque.com/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)
- [Accessible Colors](https://www.accessible-colors.com/) — suggests WCAG-compliant adjustments.
- [Tanaguru Contrast Finder](https://contrast-finder.tanaguru.com/) — finds passing color alternatives.
- [ContrastChecker.com](https://contrastchecker.com/)
- [Color Safe](http://colorsafe.co/) — accessible text-color palettes.
- [WhoCanUse](https://www.whocanuse.com/) — simulates contrast across vision conditions.
- [Color Review](https://color.review/) — explore and find accessible color pairs.
- [Colour Contrast Checker](https://colourcontrast.cc/) — WCAG combination checker.

### Preview & API

- [Realtime Colors](https://realtimecolors.com/) — preview palettes on a real website mockup.
- [The Color API](https://github.com/joshbeckman/thecolorapi) — REST API for color identification and schemes.

## JS libraries

For the full comparison and selection rationale, see [[Library Landscape]].

- [culori](https://culorijs.org/) — broadest color-space coverage, tree-shakeable, CSS Color 4 aware. The default pick for serious color math in JS.
- [colorjs.io](https://colorjs.io/) — spec-aligned reference implementation by the CSS Color 4 editors; thorough but heavier.
- [chroma.js](https://gka.github.io/chroma.js) — ergonomic API for scales, interpolation, and ΔE; great for data-viz palettes.
- [d3-color](https://d3js.org/d3-color) — minimal, solid color primitives; ideal inside the D3 ecosystem, limited scope alone.
- [colord](https://www.npmjs.com/package/colord) — tiny, fast, plugin-based; good when bundle size is the priority.
- [color (Qix-)](https://github.com/Qix-/color) — long-standing immutable wrapper around color-convert; widely used in Node tooling.
- [color-convert](https://github.com/Qix-/color-convert) — low-level conversion primitives underpinning many of the above.
- [TinyColor](https://bgrins.github.io/TinyColor/) — small, mature manipulation library; pre-Oklch era.
- [color2k](https://github.com/ricokahler/color2k) — sub-2kB manipulation library focused on size.
- [ac-colors](https://github.com/vinaypillai/ac-colors) — class-based conversions and random color generation.
- [color-names (meodai)](https://github.com/meodai/color-names) — large dataset mapping colors to human names.

### Other-language references (for porting math)

- [coloraide (Python)](https://facelessuser.github.io/coloraide/) — well-documented manipulation and gamut math.
- [colour (Python)](https://colour.readthedocs.io) / [colour-science (PyPI)](https://pypi.org/project/colour-science) — research-grade color science.
- [python-colormath](https://python-colormath.readthedocs.io/) — conversions and ΔE.
- [colorspacious (Python)](https://colorspacious.readthedocs.io/en/latest/) — CAM02 and perceptual difference.
- [palette (Rust)](https://github.com/Ogeon/palette) / [color (Rust)](https://docs.rs/color/)
- [go-colorful (Go)](https://github.com/lucasb-eyer/go-colorful)
- [ColorSpace (C++)](https://github.com/berendeanicolae/ColorSpace) / [vivid (C++)](https://github.com/gurki/vivid)
- [colormath (Kotlin)](https://ajalt.github.io/colormath/colorspaces/) — excellent per-space docs ([GitHub](https://github.com/ajalt/colormath/blob/master)).
- [Little-CMS](https://github.com/mm2/Little-CMS) — the de facto ICC color management engine (C).

## Books, papers & articles

- [Codrops: Coloring with Code](https://tympanus.net/codrops/2021/12/07/coloring-with-code-a-programmatic-approach-to-design/) — programmatic approach to color in design.
- [7 JavaScript Color Libraries — and which to choose](https://blog.shahednasser.com/7-javascript-color-libraries-and-which-should-you-choose) — practical library comparison overview.
- [RGB → HSI conversion walkthrough](https://www.imageeprocessing.com/2013/05/converting-rgb-image-to-hsi.html) — worked image-processing example.

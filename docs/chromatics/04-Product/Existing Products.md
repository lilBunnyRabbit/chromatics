---
tags: [product, competitive-landscape]
---

# Existing Products

Competitive landscape for color tooling: the web apps, libraries, and design utilities Chromatics is measured against, and the gaps it aims to fill. Related: [[Vision]] · [[Unified Product Plan]] · [[Dynamic Theme]].

## Web Tools & Design Apps

### Palette Generators & Inspiration

- **Coolors** — Fast, popular palette generator. Spacebar generates instant palettes, lock favorite colors, adjust HSB sliders, export in many formats. Showcases trending community palettes. Mobile apps + Figma/Adobe plugins. Also includes a contrast checker and color blindness simulator in its palette detail view.
- **Adobe Color** (formerly Kuler) — Comprehensive scheme builder. Classic harmony rules (analogous, monochromatic, triad, complementary, etc.), extracts palettes from images. Built-in accessibility: contrast checks and color blindness simulation on a palette. Creative Cloud integration saves palettes to libraries for use in Adobe apps.
- **Paletton** (Color Scheme Designer) — Older but still useful, focused on color-wheel relationships. Explores monochromatic, adjacent, triadic, tetradic schemes visually. Interactive previews show palettes in sample UI layouts/artworks. Strong for traditional color-theory harmonies.
- **Colormind** — AI-powered scheme generator using deep learning trained on photos, movies, and popular designs. Supports partial palettes (lock colors, fill the rest); outputs a coherent 5-color palette, often with a UI mockup preview suggesting usage per color (background, accent, etc.).
- **Color Hunt** — Crowdsourced collection of trendy 4-color palettes, curated by category (pastel, summer, minimal). Inspiration over generation; taps human-created palettes and design trends. Quick HEX grabs.
- https://atmos.style/
- 

### Contrast & Accessibility Tools

- **Leonardo** (LeonardoColor.io) — Accessible palette generation backed by Adobe's Leonardo engine. Users specify contrast ratios; tool generates color scales accordingly (e.g. blues from light to dark where each step is a WCAG-compliant contrast ratio). Outputs design tokens / CSS variables, bridging design and dev.
- **Color Safe** — Accessible palette builder starting from a chosen background/brand color, generating complementary text colors that meet WCAG. Adjustable target level (AA, AAA); previews sample text with generated combinations.
- **Contrast Checker tools** — WebAIM Contrast Checker, Deque's checker, etc. Input foreground/background, output contrast ratio and AA/AAA pass. Some (Accessible Brand Colors, Contrast Finder) suggest the nearest compliant color when the original fails.

### Multi-purpose Utilities

- **Hue.Tools** — Open-source "Swiss army knife." Mix colors and generate intermediate shades (choice of interpolation space like LCH), blend two colors with Photoshop-style blend modes, convert a color into many formats (HEX, RGB, HSL, Lab, etc.), suggest harmonies (complementary, triadic, analogous) and nearest color name, and modify (lighten, darken, saturate/desaturate, rotate hue). Consolidates what would otherwise need multiple tools.
- **ColorHexa** — Color "encyclopedia": input a code, get variations (tints, shades, analogous, triadic), conversion to every format, and color-name info. Useful for analyzing a single color in depth.
- **Design System tools** — Material Design palette generators (e.g. Material Theme Editor) produce full light/dark palettes from primary/secondary picks following Material guidelines. ColorBox by Lyft generates stepwise scales with consistent perceptual increments for design systems. Highlight the opportunity of bridging raw color theory with practical UI needs (consistency, states, light/dark mode).

## Libraries (Color Models & Utilities)

### JavaScript / TypeScript

- **Chroma.js** — Widely-used, zero-dependency (~13.5 kB). Parses many formats, adjusts (`.darken()`, `.saturate()`), converts between models, generates scales via linear or Bézier interpolation in various spaces. Data-viz helpers (cubehelix). Versatile but larger than newer libs.
- **Culori** — Comprehensive, modern. CSS Color Level 4 and beyond: sRGB, HSL, Lab/LCh, OKLab/OKLch, JzAzBz, ICTCP. Conversions, color-difference (ΔE 1976/1994/2000), blending/interpolation across spaces. Modular: small core, optional add-ons (ColorBrewer presets, extended names). Strong on color science and correctness.
- **Colord** — Tiny (~1.7 kB gzipped), high-performance. Chainable immutable API, TypeScript, 100% test coverage. 3×+ faster than `color`/`tinycolor2`. Supports all standard CSS formats, strict spec adherence, plugin system for extensions.
- **@adobe/leonardo-contrast-colors** — Generates adaptive palettes from target contrast ratios rather than picking colors then checking. `generateContrastColors()` produces scales from a base color, contrast ratios, and light/dark context. Paired with the Leonardo web UI. Key for accessible color systems.
- **Color** (Qix's `color`) — Easy class for manipulation/conversion. Accepts CSS strings, getters (`.hsl()`, `.red()`), chainable `.lighten()`/`.desaturate()`. ~7.6 kB; mid-range size vs. functionality.
- **TinyColor** (`tinycolor2`) — Classic small lib (~5 kB). Parse, manipulate (`.brighten()`, `.darken()`), readable-text detection, `isLight()`, random colors, simple palettes. No updates since 2021; lacks newer color-space features.
- **Others** — `color-space`, `color-convert`, **colorjs.io** (Lea Verou; very full-featured with gamut mapping and multiple ΔE methods, extreme accuracy, spec compliance), `d3-color` (immutable color object with L\*a\*b\*/HCL, D3 ecosystem).

### Python

- **Colormath** — Wide range of spaces (CIE XYZ/Lab/LCH/Luv, RGB variants, HSL/HSV, CMY/CMYK, spectral). All standard ΔE formulas, chromatic adaptation between illuminants, RGB↔HEX. For scientific/engineering color work.
- **Colour Science** (`colour`) — Even more extensive: many transforms, datasets (color matching functions, illuminants), CIECAM02 appearance models, spectral→color. Used in film/VFX, photography, ACES color management.
- **Others** — `colorsys` (stdlib, basic RGB↔HLS/HSV), **ColorAide** (developer-friendly OOP, CSS3/4 strings, multiple spaces), `colorspacious` (perceptual conversions, colormap uniformity).

### Rust

- **palette** — Type-safe color management; linear-space representation prevents gamma/linear mix-ups. Wide range of spaces plus user-defined ones. Conversions, blending, correctness by design. Used in graphics/rendering.
- **color** (linebender / Raph Levien et al.) — Implements CSS Color Level 4 for GUI/document editing. Static (type-encoded space) and dynamic `Color` types. Easy interpolation/gradients, CSS parse/serialize (incl. `lab()`, `lch()`). Focused on 3-component spaces; CMYK/spectral out of scope.

### Go

- **go-colorful** (Lucas Beyer) — Pure Go; fills the gap left by `image/color` (RGBA only). Converts RGB↔HSL/HSV/linear RGB/XYZ/xyY/Lab/Luv/LCh(HCL). Random colors, blending, palette generation; implements `color.Color`. For perceptual distance, image→Lab clustering, etc.
- **Standard library & others** — `image/color` (RGBA struct, SVG names, no conversions), forks/variants, `fatih/color` for ANSI terminal colors. go-colorful is the go-to for comprehensive color-space handling.

### C++

- **ColorSpace** — C++17, classes for many models (Rgb, Lab, Lch, Cmy, Cmyk, Hsl, Hsv, Xyz, …), templated `To<T>` conversion. ΔE comparisons (CIE76/94/2000, CMC). For rigorous color handling without heavy frameworks.
- **Vivid** — High-level `Color` class holding RGB/HSV/HSL/LCH, quick conversions (`.hsl()`, `.hex()`), named colors, data-viz palettes (Viridis, Plasma), perceptual interpolation. Focused on ease of use (incl. ANSI codes, nearest named color).
- **Others** — OpenCV / Qt QColor conversions; LittleCMS / ICC libraries for profile management.

## Gap Analysis & How Chromatics Differs

The landscape is crowded, but consistent gaps remain — these are the openings Chromatics targets (see [[Vision]] and [[Unified Product Plan]]).

- **Advanced models vs. ease of use** — Light libs stick to RGB/HEX/HSL and skip perceptual spaces (Lab, OKLCH); comprehensive libs support them but are heavy/complex. *Opportunity:* hit the sweet spot — modern spaces with an ergonomic API, high-level methods that hide the math, graceful out-of-gamut handling (desaturate rather than clip).
- **Performance at scale** — Single-color ops are trivial; thousands of colors (datasets, images) expose overhead. *Opportunity:* vectorized array operations, potentially WASM/GPU parallelism for data-viz and image processing.
- **Accessibility from the start** — Contrast is usually an afterthought; Leonardo flips it by making contrast the input. *Opportunity:* bake accessibility in — never suggest a failing combination, `suggestTextColor(bg, options)`, integrated color-blindness/Daltonization preview while choosing.
- **Missing domains (print & spectral)** — Most libs are screen-only; CMYK/Pantone and spectral data are rare. *Opportunity:* design-and-print workflows (CMYK, ICC profiles), physically-based spectral mixing.
- **Cross-ecosystem & collaboration** — No universal standard across languages; handoff is inconsistent. *Opportunity:* unified experience — a web app to create palettes plus a package/API to fetch them by ID/JSON, design-token export, sharing/versioning. This is the direction of [[Dynamic Theme]] and the [[Unified Product Plan]].
- **Developer experience** — Some libs lack TS types or have legacy APIs. *Opportunity:* clear docs, intellisense-friendly typings, tree-shakeable modules, "it just works" flexible input, both OOP and functional APIs.
- **Innovative palette generation** — AI tools generate but don't explain or honor intent. *Opportunity:* perceptually-uniform spacing (equal perceived steps), deterministic theory-grounded generation.
- **Visualizations & education** — Few tools teach *why* a palette works. *Opportunity:* 3D color-space diagrams, similarity/contrast warnings, learning-by-doing.

**Chromatics' differentiation:** combine the thoroughness of scientific libraries, the speed of lightweight tools, and the user-centric design of modern interfaces — model-specific control, accessibility-first workflows, predictable perceptual results, and newer color models — to bridge design and code in a way no single existing product does.

---

Related: [[Vision]] · [[Unified Product Plan]] · [[Dynamic Theme]]

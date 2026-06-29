export const name = 'Conversions';

export const source = `// Conversions — a color KEEPS its model. Convert only when you ask:
//   MODEL.from(color)   or   color.to("model")
// Then ops live on whatever model you're in.

// Built as HSL → stays HSL. Reading its own channels is exact.
brand   = HSL(265, 0.6, 0.62)
brand_h = brand.h                  // 265, untouched

// Two equivalent ways to convert:
in_oklch = OKLCH.from(brand)       // static:   MODEL.from(color)
also_ok  = brand.to("oklch")       // instance: color.to("model")

// A grey keeps its hue across a round-trip (no OKLCH-canonical loss):
grey      = HSL(210, 0, 0.5)
grey_back = grey.to("hsv").to("hsl")    // grey_back.h is still 210

// Ops are bare when you're ALREADY in that model …
warmer = brand.rotateHue(-25)      // HSL hue rotate (brand is HSL)
deeper = in_oklch.darken(0.08)     // OKLCH lightness (in_oklch is OKLCH)

// … and you NAME a model to borrow its math (an explicit conversion):
tweaked = brand.oklch.lighten(0.1) // think in OKLCH from an HSL color

// Binary ops require BOTH colors in ONE model — convert first.
accent   = HSL(38, 0.85, 0.6)
in_hsl   = mix(brand, accent, 0.5)              // both HSL → blends in HSL
in_oklab = mix(brand.oklab, accent.oklab, 0.5)  // both → OKLab → blends there
// mix(brand, accent.oklch) would ERROR: HSL vs OKLCH

// Each color renders in its OWN model — see the CSS in the Inspector.
css_native  = brand                // hsl(...)
css_percept = in_oklch             // oklch(...)`;

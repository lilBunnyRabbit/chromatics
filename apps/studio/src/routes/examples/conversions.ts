export const name = 'Conversions';

export const source = `// Conversions — a color KEEPS its model. Convert only when you ask:
//   Model.from(color)   or   color.to(Model)
// Both return a NEW color; methods change the color they're called on.

// Built as HSL → stays HSL. Reading its own channels is exact.
brand   = Hsl(265, 0.6, 0.62)
brand_h = brand.h                  // 265, untouched

// Two equivalent ways to convert:
in_oklch = Oklch.from(brand)     // static:   Model.from(color)
also_ok  = brand.to(Oklch)       // instance: color.to(Model)

// A grey keeps its hue across a round-trip (no OKLCH-canonical loss):
grey      = Hsl(210, 0, 0.5)
grey_back = grey.to(Hsv).to(Hsl)    // grey_back.h is still 210

// Methods change the color, so copy first to keep the original …
warmer = brand.clone().rotateHue(-25)      // HSL hue rotate (brand is HSL)
deeper = in_oklch.clone().darken(0.08)     // OKLCH lightness (in_oklch is OKLCH)

// … or convert, which copies anyway, to borrow another model's math:
tweaked = brand.to(Oklch).lighten(0.1) // think in OKLCH from an HSL color

// Binary ops require BOTH colors in ONE model — convert first.
accent   = Hsl(38, 0.85, 0.6)
in_hsl   = brand.clone().mix(accent, 0.5)              // both HSL → blends in HSL
in_oklab = brand.to(Oklab).mix(accent.to(Oklab), 0.5)  // both → OKLab → blends there
// brand.mix(accent.to(Oklch)) is a type error in TS and a mix of two models here: convert both

// Each color renders in its OWN model — see the CSS in the Inspector.
css_native  = brand                // hsl(...)
css_percept = in_oklch             // oklch(...)`;

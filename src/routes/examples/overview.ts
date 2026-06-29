export const name = 'Overview';

export const source = `// ── Chromatics — one brand color, a whole design system ───────────
// Everything below derives from \`brand\`. Change it and the palette,
// theme, tokens, components and previews all cascade.
// Tabs to try:  Inspector · Preview · Styleguide · Export

brand = hex("#6c5ce7")             // ← edit me

// ── Theme — surfaces & text from perceptual lightness (OKLCH) ──
bg      = OKLCH(0.17, brand.ok_c * 0.25, brand.ok_h)
surface = bg.lighten(0.05)
border  = surface.lighten(0.12)
fg      = OKLCH(0.96, 0.012, brand.ok_h)
muted   = fg.darken(0.30)

// ── Brand + harmony on the OKLCH hue wheel (true hues) ──
// brand is hex, so name a model to borrow its math:
primary   = brand.oklch.gamutMap()
secondary = primary.rotateHue(150).gamutMap()
accent    = primary.rotateHue(-60).gamutMap()

// Readable button text, auto-chosen by WCAG contrast:
primary_fg = primary.srgb.contrastWCAG(fg) >= 4.5 ? fg : bg

// ── Semantic — brand lightness & chroma, fixed hues ──
success = OKLCH(primary.ok_l, primary.ok_c, 150).gamutMap()
warning = OKLCH(primary.ok_l, primary.ok_c, 80).gamutMap()
error   = OKLCH(primary.ok_l, primary.ok_c, 28).gamutMap()

// ── Conversions — a color keeps its model; convert when you ask ──
as_hct  = HCT.from(primary)            // static convert: MODEL.from(color)
tone_70 = primary.hct.atTone(70)       // borrow HCT math from OKLCH
press   = primary.cmyk.limitInk(240)   // print-safe CMYK ink limit
warmth  = OKLCH(0.94, 0.02, brand.ok_h).ucs60.cct   // paper white → Kelvin

// ── Map named colors → roles (shareable; the editor wins) ──
roles = theme({
  bg: "bg", fg: "fg", surface: "surface", border: "border",
  primary: "primary", primaryFg: "primary_fg",
  secondary: "secondary", accent: "accent"
})

// ── Design tokens — generators expand each scale (no loops) ──
text   = scale.text(16, 1.25)
space  = scale.space(4)
radius = scale.radius(10)
shadow = scale.shadow(brand)
font   = token("font", { sans: "Inter, system-ui, sans-serif", mono: "JetBrains Mono, monospace" })

// ── Components — the Styleguide tab renders & audits these ──
button = component.button({
  variants: [
    { name: "primary", bg: "primary",    fg: "primary-fg" },
    { name: "soft",    bg: "primary/15", fg: "primary" },
    { name: "ghost",   bg: "bg",         fg: "fg", border: "border" }
  ],
  sizes: [
    { name: "sm", padY: "1", padX: "3", text: "sm" },
    { name: "md", padY: "2", padX: "4", text: "base" }
  ],
  states: ["default", "hover", "disabled"]
})

card = component.card({
  bg: "surface", fg: "fg", border: "border",
  radius: "lg", pad: "6", shadow: "md", title: "Card title"
})

// ── Previews — values that render as cards in the Inspector ──
ramp        = preview.ramp(primary)
triad       = preview.harmony(brand, "triadic")
legibility  = preview.pair(fg, surface)             // WCAG + APCA
gamut_check = preview.gamut(OKLCH(0.72, 0.32, 150)) // vivid green, out of sRGB
palette     = preview.palette(primary, secondary, accent, success, warning, error)
logo        = preview.brandMark(brand)`;

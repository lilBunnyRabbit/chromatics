export const name = 'Previews';

export const source = `// Preview primitives — values that RENDER in the Inspector.
// These aren't colors; each \`preview.*\` draws itself as a card.
// Open the Inspector tab to see them all.
brand   = OKLCH(0.62, 0.16, 264)
accent  = brand.rotateHue(150).gamutMap()
bg      = OKLCH(0.16, 0.02, 264)
surface = OKLCH(0.22, 0.02, 264)
fg      = OKLCH(0.96, 0.01, 264)
wide    = OKLCH(0.72, 0.32, 150)   // beyond sRGB on purpose

// ── Relationships ──
brand_ramp    = preview.ramp(brand)
brand_to_accent = preview.gradient(brand, accent, "oklab", 7)
triad         = preview.harmony(brand, "triadic")
blend         = preview.mix(brand, accent, 5)

// ── Accessibility ──
body_text     = preview.pair(fg, bg)              // type specimen + WCAG + APCA
brand_on_dark = preview.pair(brand, bg)
brand_cvd     = preview.cvd(brand)
legibility    = preview.onBackgrounds(brand, [bg, surface, fg])

// ── Single color ──
brand_3d      = preview.space(brand, "oklch")
channels      = preview.channels(brand, "oklch")
gamut_check   = preview.gamut(wide)
press         = preview.print(brand)
closest_name  = preview.name(brand)
warmth        = preview.temperature(brand)

// ── Scheme & mockups ──
palette       = preview.palette(brand, accent, bg, surface, fg)
contrast_grid = preview.grid(bg, surface, fg, brand, accent)
chart         = preview.chart(brand, accent, fg)
ui_card       = preview.ui(bg, fg, brand)
logo          = preview.brandMark(brand)`;

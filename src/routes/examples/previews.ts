export const name = 'Previews';

export const source = `// Preview primitives — values that RENDER in the Inspector.
// These aren't colors; each one draws itself as a card.
// Inside a \`preview { }\` block you call them bare — no \`preview.\` prefix.
// Open the Inspector tab to see them all.
brand   = OKLCH(0.62, 0.16, 264)
accent  = brand.rotateHue(150).gamutMap()
bg      = OKLCH(0.16, 0.02, 264)
surface = OKLCH(0.22, 0.02, 264)
fg      = OKLCH(0.96, 0.01, 264)
wide    = OKLCH(0.72, 0.32, 150)   // beyond sRGB on purpose

preview {
  // ── Relationships ──
  brand_ramp      = ramp(brand)
  brand_to_accent = gradient(brand, accent, "oklab", 7)
  triad           = harmony(brand, "triadic")
  blend           = mix(brand, accent, 5)

  // ── Accessibility ──
  body_text     = pair(fg, bg)              // type specimen + WCAG + APCA
  brand_on_dark = pair(brand, bg)
  brand_cvd     = cvd(brand)
  legibility    = onBackgrounds(brand, [bg, surface, fg])

  // ── Single color ──
  brand_3d     = space(brand, "oklch")
  brand_ch     = channels(brand, "oklch")
  gamut_check  = gamut(wide)
  press        = print(brand)
  closest_name = name(brand)
  warmth       = temperature(brand)

  // ── Scheme & mockups ──
  swatches      = palette(brand, accent, bg, surface, fg)
  contrast_grid = grid(bg, surface, fg, brand, accent)
  categories    = chart(brand, accent, fg)
  ui_card       = ui(bg, fg, brand)
  logo          = brandMark(brand)
}`;

export const name = 'Previews';

export const source = `// Preview primitives — values that RENDER in the Inspector.
// These aren't colors; each one draws itself as a card.
// Inside a \`preview { }\` block you call them bare — no \`preview.\` prefix.
// Open the Inspector tab to see them all.
brand   = Oklch(0.62, 0.16, 264)
accent  = brand.clone().rotateHue(150).to(Srgb).gamutMap().to(Oklch)
bg      = Oklch(0.16, 0.02, 264)
surface = Oklch(0.22, 0.02, 264)
fg      = Oklch(0.96, 0.01, 264)
wide    = Oklch(0.72, 0.32, 150)   // beyond sRGB on purpose

preview {
  // ── Relationships ── (each derivation can pick the model it works in)
  brand_ramp      = ramp(brand)                        // OKLCH lightness (default)
  brand_ramp_lab  = ramp(brand, Lab)                 // …or any model's lightness axis
  brand_to_accent = gradient(brand, accent, Oklab, 7)
  spectrum        = gradient(brand, accent, { space: Lch, hue: "longer" })
  triad           = harmony(brand, "triadic")          // rotate on the OKLCH wheel
  triad_hsl       = harmony(brand, "triadic", Hsl)   // …vs the classic HSL wheel
  blend           = brand.clone().mix(accent, 5)

  // ── Accessibility ──
  body_text     = pair(fg, bg)              // type specimen + WCAG + APCA
  brand_on_dark = pair(brand, bg)
  brand_cvd     = cvd(brand)
  legibility    = onBackgrounds(brand, [bg, surface, fg])

  // ── Single color ──
  brand_3d     = space(brand, Oklch)
  brand_ch     = channels(brand, Oklch)
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

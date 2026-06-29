export const name = 'Overview';

export const source = `// ── Chromatics ── colors as relationships, not fixed hexes ──────────
// Define ONE brand color; everything else is derived from it.
// Change \`brand\` and the whole palette re-derives. Edit and watch.

brand = hex("#6c5ce7")             // ← the one color everything follows

// Brand as a true OKLCH color, then accents on the hue wheel
primary = brand.oklch.gamutMap()
accent  = primary.rotate(-150).gamutMap()   // a related, shifted hue
muted   = primary.desaturate(0.08).gamutMap()

// Dark-mode surfaces & text from the brand's hue (perceptual lightness)
bg      = OKLCH(0.17, brand.ok_c * 0.25, brand.ok_h)
surface = bg.lighten(0.05)
fg      = OKLCH(0.96, 0.012, brand.ok_h)

// Button text auto-picked so it always passes WCAG contrast
primary_fg = primary.srgb.contrastWCAG(fg) >= 4.5 ? fg : bg

// ── See it — previews render as cards in the Inspector ──────────────
// Inside a \`preview { }\` block you call the primitives bare (no prefix).
preview {
  palette    = palette(primary, accent, muted)
  ramp       = ramp(primary)            // tonal 50–950
  legibility = pair(primary_fg, primary) // WCAG + APCA
  darkmode   = ui(bg, fg, primary)       // mini UI mockup
}

// Next: open the Styleguide tab, or try the Design System example for
// tokens + components. Everything you see is authored in this editor.`;

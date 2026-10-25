export const name = 'Overview';

export const source = `// ── Chromatics ── colors as relationships, not fixed hexes ──────────
// Define ONE brand color; everything else is derived from it.
// Change \`brand\` and the whole palette re-derives. Edit and watch.

brand = parse("#6c5ce7")             // ← the one color everything follows

// Brand as a true OKLCH color, then accents on the hue wheel
primary = brand.to(Oklch).to(Srgb).gamutMap().to(Oklch)
accent  = primary.clone().rotateHue(-150).to(Srgb).gamutMap().to(Oklch)   // a related, shifted hue
muted   = primary.clone().shift({ c: -0.08 }).to(Srgb).gamutMap().to(Oklch)

// Dark-mode surfaces & text from the brand's hue (perceptual lightness)
bg      = Oklch(0.17, brand.to(Oklch).c * 0.25, brand.to(Oklch).h)
surface = bg.clone().lighten(0.05)
fg      = Oklch(0.96, 0.012, brand.to(Oklch).h)

// Button text auto-picked so it always passes WCAG contrast
primary_fg = primary.to(Srgb).contrast(fg.to(Srgb)) >= 4.5 ? fg : bg

// ── See it — previews render as cards in the Inspector ──────────────
// Inside a \`preview { }\` block you call the primitives bare (no prefix).
preview {
  palette    = palette(primary, accent, muted)
  ramp       = ramp(primary)            // tonal 50–950
  legibility = pair(primary_fg, primary) // WCAG + APCA
  darkmode   = ui(bg, fg, primary)       // mini UI mockup
}

// Next: open the Design System tab, or try the Design System example for
// tokens + components. Everything you see is authored in this editor.`;

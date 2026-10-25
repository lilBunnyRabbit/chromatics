export const name = 'Dynamic Theme';

export const source = `// One seed → a full accessible dark theme.
// Edit the seed and the whole scheme cascades.
seed = OKLCH(0.62, 0.15, 264)

// Surfaces from perceptual lightness, kept in gamut
bg      = seed.atLightness(0.16).gamutMap()
surface = seed.atLightness(0.21).gamutMap()
fg      = seed.atLightness(0.94).gamutMap()

// Brand + perceptual harmony (correct hues, not HSL)
primary   = seed.gamutMap()
secondary = seed.rotateHue(150).gamutMap()
accent    = seed.rotateHue(-60).gamutMap()

// Semantic, locked to the brand lightness/chroma
success = OKLCH(primary.ok_l, primary.ok_c, 145).gamutMap()
warning = OKLCH(primary.ok_l, primary.ok_c, 75).gamutMap()
error   = OKLCH(primary.ok_l, primary.ok_c, 28).gamutMap()
info    = OKLCH(primary.ok_l, primary.ok_c, 240).gamutMap()

// Background scale
bg_dark  = bg.darken(0.04)
bg_light = bg.lighten(0.05)

// Auto-pick a readable foreground for primary buttons
primary_fg = primary.srgb.contrastWCAG(bg) >= 4.5 ? bg : fg

// Live accessibility check (a boolean in the inspector)
aa_text = fg.srgb.contrastWCAG(bg) >= 4.5`;

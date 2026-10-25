export const name = 'Dynamic Theme';

export const source = `// One seed → a full accessible dark theme.
// Edit the seed and the whole scheme cascades.
seed = Oklch(0.62, 0.15, 264)

// Surfaces from perceptual lightness, kept in gamut
bg      = seed.clone().set({ l: 0.16 }).to(Srgb).gamutMap().to(Oklch)
surface = seed.clone().set({ l: 0.21 }).to(Srgb).gamutMap().to(Oklch)
fg      = seed.clone().set({ l: 0.94 }).to(Srgb).gamutMap().to(Oklch)

// Brand + perceptual harmony (correct hues, not HSL)
primary   = seed.to(Srgb).gamutMap().to(Oklch)
secondary = seed.clone().rotateHue(150).to(Srgb).gamutMap().to(Oklch)
accent    = seed.clone().rotateHue(-60).to(Srgb).gamutMap().to(Oklch)

// Semantic, locked to the brand lightness/chroma
success = Oklch(primary.l, primary.c, 145).to(Srgb).gamutMap().to(Oklch)
warning = Oklch(primary.l, primary.c, 75).to(Srgb).gamutMap().to(Oklch)
error   = Oklch(primary.l, primary.c, 28).to(Srgb).gamutMap().to(Oklch)
info    = Oklch(primary.l, primary.c, 240).to(Srgb).gamutMap().to(Oklch)

// Background scale
bg_dark  = bg.clone().darken(0.04)
bg_light = bg.clone().lighten(0.05)

// Auto-pick a readable foreground for primary buttons
primary_fg = primary.to(Srgb).contrast(bg.to(Srgb)) >= 4.5 ? bg : fg

// Live accessibility check (a boolean in the inspector)
aa_text = fg.to(Srgb).contrast(bg.to(Srgb)) >= 4.5`;

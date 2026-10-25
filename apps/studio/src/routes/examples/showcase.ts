export const name = 'Showcase';

export const source = `// Chromatics showcase — one seed, the whole engine.
// Each line manipulates a DIFFERENT color model. Edit the seed
// and everything below cascades. Open the API docs (top bar) or
// the 3D Explore tab to see every model.
seed = Oklch(0.62, 0.16, 264)

// ── Core theme — perceptual lightness, kept in sRGB gamut ──
background = seed.clone().set({ l: 0.15 }).to(Srgb).gamutMap().to(Oklch)
surface    = seed.clone().set({ l: 0.21 }).to(Srgb).gamutMap().to(Oklch)
foreground = seed.clone().set({ l: 0.95 }).to(Srgb).gamutMap().to(Oklch)
muted      = foreground.clone().set({ c: 0.02 }).darken(0.22)
border     = surface.clone().lighten(0.12)

// ── Brand harmony on the OKLCH hue wheel (correct hues) ──
primary   = seed.to(Srgb).gamutMap().to(Oklch)
secondary = seed.clone().rotateHue(150).to(Srgb).gamutMap().to(Oklch)
tertiary  = seed.clone().rotateHue(-90).to(Srgb).gamutMap().to(Oklch)

// Most vivid in-gamut accent at the same lightness: ask for too much chroma, let gamutMap() trim it
vivid  = seed.clone().rotateHue(60)
accent = Oklch(vivid.l, vivid.to(Oklch).set({ c: 0.5 }).to(Srgb).gamutMap().to(Oklch).c, vivid.h)

// Readable button text, auto-chosen by WCAG contrast (via sRGB)
primary_fg = primary.to(Srgb).contrast(foreground.to(Srgb)) >= 4.5 ? foreground : background

// ── Semantic colors via HCT — fixed hue, brand chroma, set tone ──
success = Hct(150, primary.to(Hct).c, 58).to(Hct).set({ t: 58 })
warning = Hct(85, primary.to(Hct).c, 72).to(Hct).set({ t: 72 })
error   = Hct(25, primary.to(Hct).c, 55).to(Hct).set({ t: 55 })
info    = Hct(250, primary.to(Hct).c, 62).to(Hct).set({ t: 62 })

// ── Material tonal ramp from the brand (HCT tones) ──
brand_20 = primary.to(Hct).set({ t: 20 })
brand_50 = primary.to(Hct).set({ t: 50 })
brand_90 = primary.to(Hct).set({ t: 90 })

// ── The mixing SPACE matters — same blend, three models ──
mix_oklab  = primary.to(Oklab).mix(accent.to(Oklab), 0.5)
mix_linear = primary.to(LinearSrgb).mix(accent.to(LinearSrgb), 0.5)
mix_ryb    = Ryb(0, 0, 1).to(Ryb).mix(Ryb(0, 1, 0), 0.5)   // blue + yellow → green!

// ── Tints & shades in HSL / HWB ──
tint  = primary.to(Hsl).tint(0.4)
shade = primary.to(Hsl).shade(0.4)
soft  = primary.to(Hwb).shift({ w: 0.25 })

// ── Perceptually-uniform hue shift (HSLuv) ──
hsluv_shift = primary.to(Hsluv).rotateHue(40)

// ── Print preview — CMYK, ink-limited for newsprint ──
press = primary.to(Cmyk).limitInk(2.4) // 240 % total ink

// ── CSS filter effects, applied in sRGB as browsers do ──
aged = accent.to(Srgb).filter("sepia", 0.6)

// White balance — a near-neutral "paper" tinted by the brand hue
paper = Oklch(0.94, 0.02, primary.h)

// ── Live metrics the engine computes (numbers / booleans) ──
ink_pct  = (primary.to(Cmyk).totalInk() * 100)            // total area coverage %
temp_k   = paper.to(Xyy).cct()                  // correlated colour temp (K)
delta_e  = primary.to(Cam16Ucs).deltaE(accent.to(Cam16Ucs))  // CAM16-UCS ΔE′
aa_pass  = (foreground.to(Srgb).contrast(background.to(Srgb)) >= 4.5)
in_p3    = accent.to(DisplayP3).inGamut()`;
